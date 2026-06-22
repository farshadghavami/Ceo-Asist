
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Header } from '../components/Header';
import { MeetingInput } from '../components/MeetingInput';
import { SummaryDisplay } from '../components/SummaryDisplay';
import { ActionItemsDashboard } from '../components/ActionItemsDashboard';
import { UploadHistory } from '../components/UploadHistory';
import { AIConversationalModal } from '../components/AIConversationalModal';
import { ManageEmployeesModal } from '../components/ManageEmployeesModal';
import { SidebarAIAssistant } from '../components/SidebarAIAssistant';
import type { ActionItem, Department, Employee, Notification, UploadHistoryItem, TranscriptSegment } from '../types';
import type { BusinessData } from '../App';


interface ManagerDashboardProps {
    user: Employee;
    onLogout: () => void;
    businessData: BusinessData;
    onBusinessDataUpdate: (data: BusinessData) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, onLogout, businessData, onBusinessDataUpdate }) => {
    const [summary, setSummary] = useState<string>('');
    const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>([]);
    const [rawTranscript, setRawTranscript] = useState<string>('');
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);
    const [newItemIds, setNewItemIds] = useState<Set<number>>(new Set());
    const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    
    // Mobile Menu State
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState<'nav' | 'assistant'>('nav');

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

    const getMimeType = (file: File): string => {
        if (file.type && file.type !== '') return file.type;
        const extension = file.name.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'mp3': return 'audio/mp3';
            case 'wav': return 'audio/wav';
            case 'm4a': return 'audio/x-m4a';
            case 'aac': return 'audio/aac';
            case 'ogg': return 'audio/ogg';
            case 'flac': return 'audio/flac';
            case 'webm': return 'audio/webm';
            case 'mp4': return 'video/mp4';
            case 'amr': return 'audio/amr';
            default: return 'audio/mp3';
        }
    };

    const fileToGenerativePart = async (file: File) => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        const mimeType = getMimeType(file);
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: mimeType },
        };
    };

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setIsUploading(true);
        setSummary('');
        setTranscriptSegments([]);
        setRawTranscript('');
        
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(file));

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
            const prompt = `You are a professional secretary. Analyze this meeting.
1. Transcribe the audio in Persian with timestamps [MM:SS].
2. Write a concise summary in Persian after "%%%SEPARATOR%%%".
3. Provide a JSON array of action items after another "%%%SEPARATOR%%%".
JSON: [{"task": "...", "department": "...", "dueDate": "YYYY-MM-DD", "assigneeName": "..."}]
Departments: ${businessData.departments.join(', ')}
Employees: ${businessData.employees.map(e => e.name).join(', ')}
`;
            
            const streamResult = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: { parts: [audioPart, {text: prompt}] },
            });

            let fullResponseText = '';
            const timeRegex = /(?:\[?(\d{1,2}):(\d{2})\]?)\s*(.*)/;

            for await (const chunk of streamResult) {
                fullResponseText += chunk.text;
                const parts = fullResponseText.split('%%%SEPARATOR%%%');

                if (parts.length >= 1) {
                    const rawText = parts[0].trim();
                    setRawTranscript(rawText);
                    const lines = rawText.split('\n');
                    const parsedSegments: TranscriptSegment[] = [];
                    lines.forEach(line => {
                        const match = line.match(timeRegex);
                        if (match) {
                            const start = parseInt(match[1]) * 60 + parseInt(match[2]);
                            parsedSegments.push({ start, end: start + 5, text: match[3].trim() });
                        }
                    });
                    if (parsedSegments.length > 0) setTranscriptSegments(parsedSegments);
                }
                if (parts.length >= 2) setSummary(parts[1].trim());
            }
            
            const parts = fullResponseText.split('%%%SEPARATOR%%%');
            if (parts.length >= 3) {
                try {
                    const jsonPart = parts[2].trim().replace(/^```json\n/, '').replace(/\n```$/, '');
                    const parsedItems = JSON.parse(jsonPart);
                    const newItems = parsedItems.map((item: any, index: number) => ({
                        id: Date.now() + index,
                        task: item.task,
                        department: item.department,
                        dueDate: item.dueDate,
                        completed: false,
                        completionDate: null,
                        assigneeId: businessData.employees.find(e => e.name === item.assigneeName)?.id
                    }));
                    onBusinessDataUpdate({ ...businessData, actionItems: [...businessData.actionItems, ...newItems] });
                    setNewItemIds(new Set(newItems.map((it: any) => it.id)));
                    setTimeout(() => setNewItemIds(new Set()), 3000);
                } catch (e) { console.error("JSON Error", e); }
            }

            const historyItem: UploadHistoryItem = {
                id: Date.now(),
                fileName: file.name,
                fileSize: file.size,
                uploadDate: new Date().toLocaleDateString('fa-IR') + ', ' + new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
            };
            onBusinessDataUpdate({ ...businessData, uploadHistory: [historyItem, ...businessData.uploadHistory]});

        } catch (error) {
            setSummary("خطا در پردازش. دوباره تلاش کنید.");
        } finally {
            setIsLoading(false);
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [businessData, ai, audioUrl, onBusinessDataUpdate]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = businessData.actionItems.filter(item => !item.completed && new Date(item.dueDate) < today);
        const newNotifs = overdue.filter(item => !notifications.some(n => n.actionItemId === item.id))
            .map(item => ({ id: Date.now() + item.id, message: `تاخیر در: ${item.task}`, actionItemId: item.id, read: false }));
        if (newNotifs.length > 0) setNotifications(prev => [...prev, ...newNotifs]);
    }, [businessData.actionItems, notifications]);

    const handleToggleCompletion = (id: number) => {
        const updated = businessData.actionItems.map(item =>
            item.id === id ? { ...item, completed: !item.completed, completionDate: !item.completed ? new Date().toISOString().split('T')[0] : null } : item
        );
        onBusinessDataUpdate({...businessData, actionItems: updated });
    };

    const handleAddItem = (item: any) => {
        const newItem = { id: Date.now(), ...item, completed: false, completionDate: null };
        onBusinessDataUpdate({ ...businessData, actionItems: [...businessData.actionItems, newItem] });
        setNewItemIds(new Set([newItem.id]));
        setTimeout(() => setNewItemIds(new Set()), 3000);
    };

    const NavSidebar = () => (
        <>
            <div className="p-4 space-y-2 border-b border-slate-100 dark:border-slate-700">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-indigo-200 dark:shadow-none shadow-lg transition-all">
                    <i className="fa-solid fa-chart-line"></i>
                    <span>داشبورد اصلی</span>
                </button>
                <button 
                    onClick={() => setIsEmployeeModalOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl font-medium transition-colors"
                >
                    <i className="fa-solid fa-users"></i>
                    <span>تیم و کارمندان</span>
                </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col p-2">
                <UploadHistory history={businessData.uploadHistory} isLoading={isLoading && !isUploading} className="h-full shadow-none bg-transparent" />
            </div>
        </>
    );

    const ProfileSidebar = () => (
        <>
            <div className="flex flex-col items-center text-center p-6 border-b border-slate-100 dark:border-slate-700">
                <div className="relative mb-4 group">
                    <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-2xl ring-4 ring-white dark:ring-slate-800 shadow-xl object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-slate-800 rounded-full"></div>
                </div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{user.name}</h3>
                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mt-1">مدیر سیستم</span>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col p-3">
                <SidebarAIAssistant user={user} actionItems={businessData.actionItems} employees={businessData.employees} />
            </div>
        </>
    );

    return (
        <div className="bg-[#f8fafc] dark:bg-[#0f172a] min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans-fa flex flex-col h-screen overflow-hidden">
            <Header user={user} onLogout={onLogout} businessName={businessData.businessName} notifications={notifications} onMarkAsRead={() => setNotifications(n => n.map(it => ({...it, read: true})))} onNotificationClick={id => setHighlightedItemId(id)} />
            
            <div className="flex flex-1 overflow-hidden relative">
                <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-800/50 backdrop-blur-md border-l border-slate-200 dark:border-slate-700 flex-col z-20 shadow-sm h-full">
                    <NavSidebar />
                </aside>

                <main className="flex-1 min-w-0 p-4 lg:p-8 overflow-y-auto scroll-smooth custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8 pb-24 lg:pb-0">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <MeetingInput onFileUpload={handleFileUpload} isLoading={isLoading} isUploading={isUploading} uploadProgress={uploadProgress} className="h-full min-h-[400px]" />
                            <SummaryDisplay summary={summary} transcriptSegments={transcriptSegments} rawTranscript={rawTranscript} isLoading={isLoading && !isUploading} className="h-full min-h-[400px]" audioUrl={audioUrl} />
                        </div>
                        <div className="pb-8">
                            <ActionItemsDashboard actionItems={businessData.actionItems} onToggleCompletion={handleToggleCompletion} onAddItem={handleAddItem} highlightedItemId={highlightedItemId} onClearHighlight={() => setHighlightedItemId(null)} newItemIds={newItemIds} departments={businessData.departments} employees={businessData.employees} onUpdateEmployee={emp => onBusinessDataUpdate({...businessData, employees: businessData.employees.map(e => e.id === emp.id ? emp : e)})} loggedInUser={user} onManageEmployees={() => setIsEmployeeModalOpen(true)} />
                        </div>
                    </div>
                </main>

                <aside className="hidden xl:flex w-72 bg-white dark:bg-slate-800/50 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 flex-col z-20 shadow-sm h-full">
                    <ProfileSidebar />
                </aside>
                
                {/* Mobile FAB and Drawers */}
                <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-5 rounded-2xl shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all">
                    <i className="fa-solid fa-grip text-2xl"></i>
                </button>
                
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                        <div className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-white dark:bg-slate-800 shadow-2xl flex flex-col animate-fade-in-slide-up">
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                                <h2 className="font-bold text-xl">مدیریت هوشمند</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
                                    <i className="fa-solid fa-xmark text-2xl"></i>
                                </button>
                            </div>
                            <div className="flex p-2 bg-slate-100 dark:bg-slate-900 m-4 rounded-xl">
                                <button onClick={() => setMobileTab('nav')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mobileTab === 'nav' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg' : 'text-slate-500'}`}>تاریخچه و منو</button>
                                <button onClick={() => setMobileTab('assistant')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mobileTab === 'assistant' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-lg' : 'text-slate-500'}`}>دستیار و پروفایل</button>
                            </div>
                            <div className="flex-1 overflow-hidden flex flex-col">
                                {mobileTab === 'nav' ? <NavSidebar /> : <ProfileSidebar />}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AIConversationalModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} actionItems={businessData.actionItems} employees={businessData.employees} />
            <ManageEmployeesModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} employees={businessData.employees} onUpdateEmployee={emp => onBusinessDataUpdate({...businessData, employees: businessData.employees.map(e => e.id === emp.id ? emp : e)})} departments={businessData.departments} loggedInUserId={user.id} />
        </div>
    );
};
