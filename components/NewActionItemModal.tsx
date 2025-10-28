import React, { useState, useEffect, useCallback } from 'react';
import type { ActionItem, Department, Employee } from '../types';
import { DEPARTMENTS } from '../constants';

// Fix: Add type definitions for Web Speech API
// These definitions are necessary because the Web Speech API is not part of the standard TypeScript DOM library.
interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}


interface NewActionItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddItem: (item: Omit<ActionItem, 'id' | 'completed' | 'completionDate'>) => void;
    employees: Employee[];
}

const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = React.useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'fa-IR';
        recognition.interimResults = false;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { transcript, isListening, startListening, stopListening, setTranscript };
};

export const NewActionItemModal: React.FC<NewActionItemModalProps> = ({ isOpen, onClose, onAddItem, employees }) => {
    const [task, setTask] = useState('');
    const [department, setDepartment] = useState<Department>('عمومی');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState<string>('');
    const { transcript, isListening, startListening, stopListening, setTranscript } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setTask(transcript);
        }
    }, [transcript]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!task || !department || !dueDate) {
            alert('لطفا تمام فیلدهای الزامی را پر کنید.');
            return;
        }
        onAddItem({ task, department, dueDate, assigneeId: assigneeId ? parseInt(assigneeId) : undefined });
        // Reset form
        setTask('');
        setDepartment('عمومی');
        setDueDate('');
        setAssigneeId('');
        setTranscript('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">افزودن اقدام جدید</h2>
                        <div className="space-y-4">
                            <div className="relative">
                                <label htmlFor="task" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شرح اقدام</label>
                                <textarea
                                    id="task"
                                    value={task}
                                    onChange={e => setTask(e.target.value)}
                                    rows={3}
                                    className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="مثال: آماده‌سازی گزارش فروش..."
                                ></textarea>
                                <button
                                    type="button"
                                    onClick={isListening ? stopListening : startListening}
                                    className={`absolute top-9 left-2 p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300'}`}
                                >
                                    <i className="fa-solid fa-microphone"></i>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">دپارتمان</label>
                                    <select
                                        id="department"
                                        value={department}
                                        onChange={e => setDepartment(e.target.value as Department)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        {DEPARTMENTS.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">مسئول</label>
                                    <select
                                        id="assignee"
                                        value={assigneeId}
                                        onChange={e => setAssigneeId(e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">هیچکس</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاریخ سررسید</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">لغو</button>
                        <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">ذخیره</button>
                    </div>
                </form>
            </div>
        </div>
    );
};