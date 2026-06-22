import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Header } from '../components/Header';
import { MeetingInput } from '../components/MeetingInput';
import { SummaryDisplay } from '../components/SummaryDisplay';
import { ActionItemsDashboard } from '../components/ActionItemsDashboard';
import { UploadHistory } from '../components/UploadHistory';
import { AIConversationalModal } from '../components/AIConversationalModal';
import type { ActionItem, Department, Employee, Notification, UploadHistoryItem } from '../types';
import type { BusinessData } from '../App';


interface ManagerDashboardProps {
    user: Employee;
    onLogout: () => void;
    businessData: BusinessData;
    onBusinessDataUpdate: (data: BusinessData) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, onLogout, businessData, onBusinessDataUpdate }) => {
    const [summary, setSummary] = useState<string>('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);
    const [newItemIds, setNewItemIds] = useState<Set<number>>(new Set());
    const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setIsUploading(true);
        setSummary('');

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress > 99) {
                 progress = 100;
                 clearInterval(interval);
            }
            setUploadProgress(progress);
        }, 200);


        try {
            const audioPart = await fileToGenerativePart(file);

            const prompt = `You are a business assistant. Analyze this meeting audio. Your response must be in two parts, separated by \`%%%SEPARATOR%%%\`.

Part 1: A concise executive summary in Persian.

%%%SEPARATOR%%%

Part 2: A valid JSON array of action items. Do not include any text before or after the JSON array in this part. For each action item object in the array, provide:
- a "task" description (string).
- a "department" (string) from this list: ${businessData.departments.join(', ')}.
- a "dueDate" (string) in YYYY-MM-DD format.
- an "assigneeName" (string). Match the name to one of the following employees: ${businessData.employees.map(e => `- ${e.name}`).join('\n')}. If no specific person is mentioned, provide an empty string.
`;
            
            const contents = { parts: [audioPart, {text: prompt}] };
            const model = 'gemini-2.5-flash'; 
            
            if (progress < 100) {
              await new Promise(resolve => {
                const checkProgress = () => {
                  if (uploadProgress >= 100) {
                    resolve(true);
                  } else {
                    setTimeout(checkProgress, 100);
                  }
                };
                checkProgress();
              });
            }
            setIsUploading(false);

            const stream = await ai.models.generateContentStream({
                model: model,
                contents: contents,
            });

            let fullResponseText = '';
            let summaryDone = false;
            
            for await (const chunk of stream) {
                fullResponseText += chunk.text;
                
                const separator = '%%%SEPARATOR%%%';
                if (!summaryDone) {
                    const separatorIndex = fullResponseText.indexOf(separator);
                    if (separatorIndex !== -1) {
                        const summaryPart = fullResponseText.substring(0, separatorIndex).trim();
                        setSummary(summaryPart);
                        summaryDone = true;
                    } else {
                        setSummary(fullResponseText);
                    }
                }
            }
            
            const separator = '%%%SEPARATOR%%%';
            const separatorIndex = fullResponseText.indexOf(separator);

            if (separatorIndex !== -1) {
                const summaryPart = fullResponseText.substring(0, separatorIndex).trim();
                setSummary(summaryPart);

                const jsonPart = fullResponseText.substring(separatorIndex + separator.length);
                try {
                    const cleanedJsonPart = jsonPart.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
                    const parsedActionItems = JSON.parse(cleanedJsonPart);

                    const newItems: ActionItem[] = parsedActionItems.map((item: any, index: number) => {
                        const assignee = businessData.employees.find(e => e.name === item.assigneeName);
                        const newId = Date.now() + index;
                        return {
                            id: newId,
                            task: item.task,
                            department: item.department,
                            dueDate: item.dueDate,
                            completed: false,
                            completionDate: null,
                            assigneeId: assignee?.id
                        };
                    });
                    
                    const currentNewIds = new Set(newItems.map(item => item.id));
                    onBusinessDataUpdate({ ...businessData, actionItems: [...businessData.actionItems, ...newItems] });
                    setNewItemIds(currentNewIds);

                    setTimeout(() => {
                        setNewItemIds(new Set());
                    }, 3000);

                } catch (error) {
                    console.error("Error parsing action items JSON:", error);
                    setSummary(prev => prev + "\n\n**خطا در پردازش اقدامات:**\n" + "فرمت داده‌های استخراج شده برای اقدامات صحیح نبود.");
                }
            } else {
                setSummary(fullResponseText.trim());
            }

            const newHistoryItem: UploadHistoryItem = {
                id: Date.now(),
                fileName: file.name,
                fileSize: file.size,
                uploadDate: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric'}) + ', ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
            };
            onBusinessDataUpdate({ ...businessData, uploadHistory: [newHistoryItem, ...businessData.uploadHistory]});

        } catch (error) {
            console.error("Error processing file:", error);
            setSummary("متاسفانه در تحلیل فایل خطایی رخ داد. لطفا دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [businessData, ai, uploadProgress, onBusinessDataUpdate]);


    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueItems = businessData.actionItems.filter(item => !item.completed && new Date(item.dueDate) < today);
        
        const newNotifications = overdueItems
            .filter(item => !notifications.some(n => n.actionItemId === item.id))
            .map(item => ({
                id: Date.now() + item.id,
                message: `اقدام "${item.task}" تاخیر دارد.`,
                actionItemId: item.id,
                read: false,
            }));
        
        if (newNotifications.length > 0) {
            setNotifications(prev => [...prev, ...newNotifications]);
        }
    }, [businessData.actionItems, notifications]);


    const handleToggleCompletion = (id: number) => {
        const newActionItems = businessData.actionItems.map(item =>
            item.id === id
                ? { ...item, completed: !item.completed, completionDate: !item.completed ? new Date().toISOString().split('T')[0] : null }
                : item
        );
        onBusinessDataUpdate({...businessData, actionItems: newActionItems });
    };

    const handleAddItem = (item: Omit<ActionItem, 'id' | 'completed' | 'completionDate'>) => {
        const newId = Date.now();
        const newItem: ActionItem = {
            id: newId,
            ...item,
            completed: false,
            completionDate: null,
        };
        onBusinessDataUpdate({ ...businessData, actionItems: [...businessData.actionItems, newItem] });
        setNewItemIds(new Set([newId]));
        setTimeout(() => setNewItemIds(new Set()), 3000);
    };

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        const newEmployees = businessData.employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp);
        onBusinessDataUpdate({ ...businessData, employees: newEmployees });
    };

    const handleMarkNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({...n, read: true})));
    };

    const handleNotificationClick = (actionItemId: number) => {
        setHighlightedItemId(actionItemId);
    };

    return (
        <>
            <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans-fa">
                <Header
                    user={user}
                    onLogout={onLogout}
                    businessName={businessData.businessName}
                    notifications={notifications}
                    onMarkAsRead={handleMarkNotificationsAsRead}
                    onNotificationClick={handleNotificationClick}
                />
                <main className="p-4 md:p-8 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 flex flex-col gap-8">
                            <MeetingInput
                                onFileUpload={handleFileUpload}
                                isLoading={isLoading}
                                isUploading={isUploading}
                                uploadProgress={uploadProgress}
                            />
                            <UploadHistory history={businessData.uploadHistory} isLoading={isLoading && !isUploading} />
                        </div>
                        <div className="lg:col-span-2">
                            <SummaryDisplay summary={summary} isLoading={isLoading && !isUploading} />
                        </div>
                    </div>

                    <div className="mt-8">
                        <ActionItemsDashboard
                            actionItems={businessData.actionItems}
                            onToggleCompletion={handleToggleCompletion}
                            onAddItem={handleAddItem}
                            highlightedItemId={highlightedItemId}
                            onClearHighlight={() => setHighlightedItemId(null)}
                            newItemIds={newItemIds}
                            departments={businessData.departments}
                            employees={businessData.employees}
                            onUpdateEmployee={handleUpdateEmployee}
                            loggedInUser={user}
                        />
                    </div>
                </main>
                 <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
                    aria-label="مشاور هوش مصنوعی 1001"
                    title="مشاور هوش مصنوعی 1001"
                >
                    <span className="font-black text-2xl tracking-tighter">1001</span>
                </button>
            </div>
            <AIConversationalModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                actionItems={businessData.actionItems}
                employees={businessData.employees}
            />
        </>
    );
};
