import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Header } from './components/Header';
import { MeetingInput } from './components/MeetingInput';
import { SummaryDisplay } from './components/SummaryDisplay';
import { ActionItemsDashboard } from './components/ActionItemsDashboard';
import { UploadHistory } from './components/UploadHistory';
import { AIConversationalModal } from './components/AIConversationalModal';
import type { ActionItem, Employee, Notification, UploadHistoryItem } from './types';
import { INITIAL_ACTION_ITEMS, INITIAL_EMPLOYEES, DEPARTMENTS } from './constants';


const App: React.FC = () => {
    const [summary, setSummary] = useState<string>('');
    const [actionItems, setActionItems] = useState<ActionItem[]>(INITIAL_ACTION_ITEMS);
    const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
    const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);
    const [newItemIds, setNewItemIds] = useState<Set<number>>(new Set());
    const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

    // FIX: Initialize GoogleGenAI with API Key from environment variables.
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
            if (progress > 100) progress = 100;
            setUploadProgress(progress);
            if (progress === 100) {
                clearInterval(interval);
                setIsUploading(false);
            }
        }, 200);

        try {
            const audioPart = await fileToGenerativePart(file);

            const prompt = `
            You are a business assistant. Analyze this meeting audio.
            1. Provide a concise executive summary in Persian.
            2. Extract all action items in Persian. For each action item, provide:
               - a clear 'task' description.
               - the relevant 'department' from this list: ${DEPARTMENTS.join(', ')}.
               - a 'dueDate' in YYYY-MM-DD format.
               - the name of the 'assigneeName'. If no specific person is mentioned, leave it empty.
            
            Match the assignee name to one of the following employees:
            ${employees.map(e => `- ${e.name}`).join('\n')}
            
            Return the response as a single JSON object with two keys: "summary" and "actionItems".
            `;

            const contents = { parts: [audioPart, {text: prompt}] };
            // FIX: Use a model that supports audio input and complex reasoning.
            const model = 'gemini-2.5-pro';

            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING, description: 'The executive summary of the meeting.' },
                    actionItems: {
                        type: Type.ARRAY,
                        description: 'A list of action items extracted from the meeting.',
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                task: { type: Type.STRING, description: 'The description of the action item.' },
                                department: { type: Type.STRING, description: 'The department responsible for the task.' },
                                dueDate: { type: Type.STRING, description: 'The due date in YYYY-MM-DD format.' },
                                assigneeName: { type: Type.STRING, description: 'The name of the employee assigned to the task.' },
                            },
                             required: ['task', 'department', 'dueDate']
                        }
                    }
                },
                required: ['summary', 'actionItems']
            };

            const response = await ai.models.generateContent({
                model: model,
                contents: contents,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                }
            });
            
            // FIX: Access the response text correctly.
            const resultText = response.text.trim();
            const result = JSON.parse(resultText);

            setSummary(result.summary);

            const newItems: ActionItem[] = result.actionItems.map((item: any, index: number) => {
                const assignee = employees.find(e => e.name === item.assigneeName);
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
            setActionItems(prev => [...prev, ...newItems]);
            setNewItemIds(currentNewIds);

            const newHistoryItem: UploadHistoryItem = {
                id: Date.now(),
                fileName: file.name,
                fileSize: file.size,
                uploadDate: new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric'}) + ', ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
            };
            setUploadHistory(prev => [newHistoryItem, ...prev]);

            setTimeout(() => {
                setNewItemIds(new Set());
            }, 3000);

        } catch (error) {
            console.error("Error processing file:", error);
            setSummary("متاسفانه در تحلیل فایل خطایی رخ داد. لطفا دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [employees, ai]);


    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueItems = actionItems.filter(item => !item.completed && new Date(item.dueDate) < today);
        
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
    }, [actionItems, notifications]);


    const handleToggleCompletion = (id: number) => {
        setActionItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, completed: !item.completed, completionDate: !item.completed ? new Date().toISOString().split('T')[0] : null }
                    : item
            )
        );
    };

    const handleAddItem = (item: Omit<ActionItem, 'id' | 'completed' | 'completionDate'>) => {
        const newId = Date.now();
        const newItem: ActionItem = {
            id: newId,
            ...item,
            completed: false,
            completionDate: null,
        };
        setActionItems(prev => [...prev, newItem]);
        setNewItemIds(new Set([newId]));
        setTimeout(() => setNewItemIds(new Set()), 3000);
    };
    
    const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
        const newEmployee: Employee = {
            id: Date.now(),
            ...employee
        };
        setEmployees(prev => [...prev, newEmployee]);
    };

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    };
    
    const handleDeleteEmployee = (employeeId: number) => {
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        setActionItems(prev => prev.map(item => item.assigneeId === employeeId ? { ...item, assigneeId: undefined } : item));
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
                            <UploadHistory history={uploadHistory} isLoading={isLoading && !isUploading} />
                        </div>
                        <div className="lg:col-span-2">
                            <SummaryDisplay summary={summary} isLoading={isLoading && !isUploading} />
                        </div>
                    </div>

                    <div className="mt-8">
                        <ActionItemsDashboard
                            actionItems={actionItems}
                            onToggleCompletion={handleToggleCompletion}
                            onAddItem={handleAddItem}
                            highlightedItemId={highlightedItemId}
                            onClearHighlight={() => setHighlightedItemId(null)}
                            newItemIds={newItemIds}
                            employees={employees}
                            onAddEmployee={handleAddEmployee}
                            onUpdateEmployee={handleUpdateEmployee}
                            onDeleteEmployee={handleDeleteEmployee}
                        />
                    </div>
                </main>
                 <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
                    aria-label="دستیار هوش مصنوعی"
                    title="دستیار هوش مصنوعی"
                >
                    <i className="fa-solid fa-brain text-2xl"></i>
                </button>
            </div>
            <AIConversationalModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                actionItems={actionItems}
                employees={employees}
            />
        </>
    );
};

export default App;
