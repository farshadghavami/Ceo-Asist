
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/Header';
import { EmployeeTaskList } from '../components/EmployeeTaskList';
import { EmployeeAIAssistantModal } from '../components/EmployeeAIAssistantModal';
import { RequestModal } from '../components/RequestModal';
import { ReferralModal } from '../components/ReferralModal'; // Import ReferralModal
import type { Employee, ActionItem, Comment, Request, Department } from '../types';
import type { BusinessData } from '../App';
import { getDepartmentConfig } from '../constants';

// NOTE: Duplicating these types and hook from NewActionItemModal to keep this component self-contained for clarity.
interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
    readonly length: number; item(index: number): SpeechRecognitionResult;[index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
    readonly isFinal: boolean; readonly length: number; item(index: number): SpeechRecognitionAlternative;[index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
    readonly transcript: string; readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean; lang: string; interimResults: boolean; onend: (() => void) | null; onerror: ((event: SpeechRecognitionErrorEvent) => void) | null; onresult: ((event: SpeechRecognitionEvent) => void) | null; start(): void; stop(): void;
}
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition; webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) { console.warn("Speech recognition not supported."); return; }
        const recognition = new SpeechRecognition();
        recognition.continuous = false; recognition.lang = 'fa-IR'; recognition.interimResults = false;
        recognition.onresult = (event: SpeechRecognitionEvent) => setTranscript(event.results[0][0].transcript);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => { console.error("Speech recognition error", event.error); setIsListening(false); };
        recognitionRef.current = recognition;
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) { recognitionRef.current.start(); setIsListening(true); }
    }, [isListening]);

    return { transcript, isListening, startListening, setTranscript };
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'تاریخ نامعتبر';
    return date.toLocaleDateString('fa-IR', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
};

const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fa-IR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const getStatus = (item: ActionItem): { text: string; color: string; icon: string; pulse: boolean } => {
    if (item.completed) return { text: 'تکمیل شده', color: 'text-emerald-500', icon: 'fa-solid fa-check-circle', pulse: false };
    const today = new Date(); today.setHours(0, 0, 0, 0); const dueDate = new Date(item.dueDate);
    if (dueDate < today) return { text: 'تاخیر دارد', color: 'text-red-500', icon: 'fa-solid fa-exclamation-circle', pulse: true };
    return { text: 'در حال انجام', color: 'text-amber-500', icon: 'fa-solid fa-spinner', pulse: false };
};


interface EmployeeDashboardProps {
    user: Employee;
    businessData: BusinessData;
    onLogout: () => void;
    onBusinessDataUpdate: (data: BusinessData) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, businessData, onLogout, onBusinessDataUpdate }) => {
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const { transcript, isListening, startListening, setTranscript } = useSpeechRecognition();
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false); // State for Referral Modal
    const commentInputRef = useRef<HTMLTextAreaElement>(null);

    const myActionItems = useMemo(() => {
        return businessData.actionItems.filter(item => item.assigneeId === user.id);
    }, [businessData.actionItems, user.id]);

    const myRequests = useMemo(() => {
        return (businessData.requests || []).filter(req => req.employeeId === user.id).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    }, [businessData.requests, user.id]);
    
    useEffect(() => {
        if(myActionItems.length > 0 && selectedTaskId === null) {
            setSelectedTaskId(myActionItems.sort((a,b) => (a.completed ? 1 : -1) - (b.completed ? 1 : -1) || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].id)
        }
    }, [myActionItems, selectedTaskId])

    const selectedTask = useMemo(() => {
        return myActionItems.find(item => item.id === selectedTaskId) || null;
    }, [myActionItems, selectedTaskId]);

    useEffect(() => {
        if(transcript) {
            setComment(transcript);
            setTranscript('');
        }
    }, [transcript, setTranscript])

    const handleToggleCompletion = (id: number) => {
        const newActionItems = businessData.actionItems.map(item =>
            item.id === id
                ? { ...item, completed: !item.completed, completionDate: !item.completed ? new Date().toISOString().split('T')[0] : null }
                : item
        );
        onBusinessDataUpdate({...businessData, actionItems: newActionItems });
    };
    
    const handleAddComment = () => {
        if (!comment.trim() || !selectedTaskId) return;
        
        const newComment: Comment = {
            id: Date.now(),
            authorId: user.id,
            text: comment,
            timestamp: new Date().toISOString()
        };

        const newActionItems = businessData.actionItems.map(item =>
            item.id === selectedTaskId
                ? { ...item, comments: [...(item.comments || []), newComment] }
                : item
        );
        onBusinessDataUpdate({...businessData, actionItems: newActionItems });
        setComment('');
    }

    const handleAddRequest = (request: Omit<Request, 'id'>) => {
        const newRequest: Request = {
            id: Date.now(),
            ...request
        };
        onBusinessDataUpdate({
            ...businessData,
            requests: [...(businessData.requests || []), newRequest]
        });
    };

    const handleReferTask = (targetDepartment: Department, reason: string) => {
        if (!selectedTaskId || !selectedTask) return;

        const oldDept = selectedTask.department;
        const referralComment: Comment = {
            id: Date.now(),
            authorId: 100, // System ID or create a special system user. Using 100 (Manager) or just user.id for log. Let's use user.id to show who referred it.
            text: `🔴 ارجاع سیستمی: این وظیفه توسط ${user.name} از واحد «${oldDept}» به واحد «${targetDepartment}» ارجاع داده شد.\nعلت: ${reason || 'ذکر نشده'}`,
            timestamp: new Date().toISOString()
        };

        const newActionItems = businessData.actionItems.map(item => 
            item.id === selectedTaskId 
            ? { 
                ...item, 
                department: targetDepartment, 
                assigneeId: undefined, // Unassign the task so it goes to the department pool or manager reassigns it
                comments: [...(item.comments || []), referralComment]
              } 
            : item
        );

        onBusinessDataUpdate({ ...businessData, actionItems: newActionItems });
        setSelectedTaskId(null); // Deselect as it's no longer the user's task
    };

    const TaskDetailView = () => {
        if (!selectedTask) {
            return (
                <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-slate-800 rounded-2xl p-6 text-center">
                    <i className="fa-solid fa-list-check text-5xl text-slate-400 dark:text-slate-500 mb-4"></i>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">وظیفه‌ای انتخاب نشده است</h3>
                    <p className="text-slate-500 dark:text-slate-400">یک وظیفه را از لیست انتخاب کنید تا جزئیات آن را ببینید.</p>
                </div>
            )
        }
        
        const status = getStatus(selectedTask);
        const departmentConfig = getDepartmentConfig(selectedTask.department);

        return (
             <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg h-full flex flex-col">
                {/* Task Header */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             <span className={`px-3 py-1 text-xs font-bold rounded-full ${status.pulse ? 'animate-pulse' : ''}`} style={{ backgroundColor: `${departmentConfig.colorHex}20`, color: departmentConfig.colorHex }}>
                                {selectedTask.department}
                            </span>
                            <div className={`flex items-center gap-1.5 font-semibold text-sm ${status.color}`} title="وضعیت">
                                <i className={`${status.icon} ${status.pulse ? 'animate-pulse' : ''}`}></i>
                                <span>{status.text}</span>
                            </div>
                        </div>
                        {/* Referral Button */}
                        {!selectedTask.completed && (
                            <button 
                                onClick={() => setIsReferralModalOpen(true)}
                                className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors border border-slate-200 dark:border-slate-600 px-2 py-1 rounded hover:bg-slate-50 dark:hover:bg-slate-700"
                                title="ارجاع به واحد دیگر"
                            >
                                <i className="fa-solid fa-share-from-square"></i>
                                ارجاع به واحد دیگر
                            </button>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{selectedTask.task}</h2>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                            <i className="fa-solid fa-calendar-alt"></i>
                            <span>سررسید: {formatDate(selectedTask.dueDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Comments / Process Timeline */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                     <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">روند انجام کار</h3>
                     {(selectedTask.comments || []).length > 0 ? (
                        (selectedTask.comments || []).map(c => {
                            const author = businessData.employees.find(e => e.id === c.authorId);
                            // If authorId is 100 or specific system ID, handle gracefully if employee not found (though manager usually exists)
                            const isSystem = c.text.includes('ارجاع سیستمی');
                            const isCurrentUser = author?.id === user.id;
                            
                            return (
                                <div key={c.id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                    {isSystem ? (
                                         <div className="w-9 h-9 rounded-full mt-1 bg-amber-100 flex items-center justify-center text-amber-600">
                                             <i className="fa-solid fa-bell"></i>
                                         </div>
                                    ) : (
                                        <img src={author?.avatarUrl || `https://ui-avatars.com/api/?name=System`} alt={author?.name} className="w-9 h-9 rounded-full mt-1" />
                                    )}
                                    <div className={`p-3 rounded-lg max-w-sm ${isSystem ? 'bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800' : isCurrentUser ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                        <div className={`flex items-baseline gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{author?.name || 'سیستم'}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatTimestamp(c.timestamp)}</p>
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap text-sm">{c.text}</p>
                                    </div>
                                </div>
                            )
                        })
                     ) : (
                        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                            <i className="fa-solid fa-comments text-3xl mb-3"></i>
                            <p>هنوز هیچ رکوردی برای این وظیفه ثبت نشده است.</p>
                            <p className="text-sm">اولین به‌روزرسانی را شما ثبت کنید!</p>
                        </div>
                     )}
                </div>

                {/* Comment Input */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                    <div className="relative">
                        <textarea
                            ref={commentInputRef}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                            rows={2}
                            className="w-full p-3 pl-24 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-all resize-none"
                            placeholder="گزارش پیشرفت خود را بنویسید..."
                        />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                             <button
                                type="button"
                                onClick={startListening}
                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300'}`}
                                title="ثبت صوتی"
                            >
                                <i className="fa-solid fa-microphone"></i>
                            </button>
                             <button
                                onClick={handleAddComment}
                                disabled={!comment.trim()}
                                className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center transition-all hover:bg-indigo-700 disabled:bg-slate-400"
                                aria-label="ارسال کامنت"
                                title="ارسال"
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        )
    }

    return (
        <>
        <div className="bg-slate-100 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans-fa">
            <Header
                user={user}
                onLogout={onLogout}
                businessName={businessData.businessName}
                notifications={[]}
                onMarkAsRead={() => {}}
                onNotificationClick={() => {}}
            />
            <main className="p-4 md:p-8 max-w-7xl mx-auto">
                 <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">داشبورد کارمند</h1>
                    <button 
                        onClick={() => setIsRequestModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md"
                    >
                        <i className="fa-solid fa-plus-circle"></i>
                        درخواست مرخصی/مساعده
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Tasks */}
                    <div className="lg:col-span-2 flex flex-col gap-6 h-[calc(100vh-180px)]">
                        <TaskDetailView />
                    </div>

                    {/* Sidebar: Requests & Task List */}
                    <div className="lg:col-span-1 flex flex-col gap-6 h-[calc(100vh-180px)] overflow-hidden">
                         
                         {/* Recent Requests Section */}
                         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg max-h-48 overflow-y-auto">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2 text-sm">
                                <i className="fa-solid fa-clock-rotate-left"></i>
                                آخرین درخواست‌ها
                            </h3>
                            {myRequests.length > 0 ? (
                                <div className="space-y-2">
                                    {myRequests.map(req => (
                                        <div key={req.id} className="text-xs p-2 bg-slate-50 dark:bg-slate-700/50 rounded border-r-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex justify-between items-center">
                                            <div>
                                                <span className="font-semibold block">
                                                    {req.type === 'financial' ? 'مساعده' : req.type === 'leave_hourly' ? 'مرخصی ساعتی' : 'مرخصی روزانه'}
                                                </span>
                                                <span className="text-slate-500">{formatDate(req.requestDate)}</span>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-full ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                                {req.status === 'approved' ? 'تایید' : 'رد'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 text-center py-4">هنوز درخواستی ثبت نکرده‌اید.</p>
                            )}
                         </div>

                        {/* Task List */}
                        <div className="flex-1 overflow-hidden">
                            <EmployeeTaskList
                                actionItems={myActionItems}
                                onToggleCompletion={handleToggleCompletion}
                                selectedTaskId={selectedTaskId}
                                onTaskSelect={setSelectedTaskId}
                            />
                        </div>
                    </div>
                </div>
            </main>
             <button
                onClick={() => setIsAiModalOpen(true)}
                className="fixed bottom-8 left-8 w-16 h-16 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
                aria-label="دستیار هوش مصنوعی"
                title="دستیار هوش مصنوعی"
            >
                <i className="fa-solid fa-robot text-2xl"></i>
            </button>
        </div>
        
         <EmployeeAIAssistantModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            selectedTask={selectedTask}
        />
        
        <RequestModal 
            isOpen={isRequestModalOpen}
            onClose={() => setIsRequestModalOpen(false)}
            onSubmit={handleAddRequest}
            employeeActionItems={myActionItems}
            employeeId={user.id}
        />

        <ReferralModal
            isOpen={isReferralModalOpen}
            onClose={() => setIsReferralModalOpen(false)}
            onSubmit={handleReferTask}
            departments={businessData.departments}
            currentDepartment={selectedTask?.department || 'عمومی'}
        />
        </>
    );
};
