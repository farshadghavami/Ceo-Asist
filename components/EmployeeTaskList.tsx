import React, { useState, useEffect, useRef } from 'react';
import type { ActionItem } from '../types';
import { getDepartmentConfig } from '../constants';

interface EmployeeTaskListProps {
    actionItems: ActionItem[];
    onToggleCompletion: (id: number) => void;
    selectedTaskId: number | null;
    onTaskSelect: (id: number) => void;
}

const getStatus = (item: ActionItem): { text: string; color: string; icon: string; pulse: boolean } => {
    if (item.completed) {
        return { text: 'تکمیل شده', color: 'text-emerald-500', icon: 'fa-solid fa-check-circle', pulse: false };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(item.dueDate);
    if (dueDate < today) {
        return { text: 'تاخیر دارد', color: 'text-red-500', icon: 'fa-solid fa-exclamation-circle', pulse: true };
    }
    return { text: 'در حال انجام', color: 'text-amber-500', icon: 'fa-solid fa-spinner', pulse: false };
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fa-IR', {
        month: 'long',
        day: 'numeric',
    });
};

export const EmployeeTaskList: React.FC<EmployeeTaskListProps> = ({ actionItems, onToggleCompletion, selectedTaskId, onTaskSelect }) => {
    const [justCompletedId, setJustCompletedId] = useState<number | null>(null);
    const selectedTaskRef = useRef<HTMLDivElement>(null);

    const sortedItems = [...actionItems].sort((a, b) => {
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    useEffect(() => {
        if (selectedTaskRef.current) {
            selectedTaskRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedTaskId]);

    const handleToggle = (id: number) => {
        const item = actionItems.find(i => i.id === id);
        if (item && !item.completed) {
            setJustCompletedId(id);
            setTimeout(() => setJustCompletedId(null), 800);
        }
        onToggleCompletion(id);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">لیست وظایف شما</h2>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2 -mr-2">
                {sortedItems.length > 0 ? sortedItems.map(item => {
                    const status = getStatus(item);
                    const isJustCompleted = justCompletedId === item.id;
                    const isSelected = item.id === selectedTaskId;
                    const departmentConfig = getDepartmentConfig(item.department);
                    
                    return (
                        <div 
                            ref={isSelected ? selectedTaskRef : null}
                            key={item.id} 
                            onClick={() => onTaskSelect(item.id)}
                            className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 cursor-pointer ${item.completed ? 'completed bg-slate-100 dark:bg-slate-700/50 opacity-70' : 'bg-slate-50 dark:bg-slate-700'} ${isJustCompleted ? 'just-completed' : ''} ${isSelected ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                           <div className="flex-shrink-0 pt-1" onClick={(e) => { e.stopPropagation(); handleToggle(item.id); }}>
                                <input
                                    type="checkbox"
                                    checked={item.completed}
                                    readOnly
                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                                    aria-label={`Mark task as ${item.completed ? 'incomplete' : 'complete'}`}
                                />
                            </div>
                            <div className="flex-1">
                                <p className={`font-medium text-slate-800 dark:text-slate-200 ${item.completed ? 'line-through' : ''}`}>{item.task}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    <div className="flex items-center gap-1.5 font-semibold" style={{ color: departmentConfig.colorHex }}>
                                        <i className="fa-solid fa-users text-xs"></i>
                                        <span>{item.department}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <i className="fa-solid fa-calendar-alt text-xs"></i>
                                        <span>{formatDate(item.dueDate)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }) : (
                     <div className="text-center py-10 text-slate-500 dark:text-slate-400 h-full flex flex-col justify-center">
                         <i className="fa-solid fa-check-double text-4xl mb-3 text-emerald-500"></i>
                        <p>شما هیچ وظیفه‌ی فعالی ندارید. عالیه!</p>
                    </div>
                )}
            </div>
        </div>
    );
};