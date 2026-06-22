
import React, { useState, useMemo, useEffect } from 'react';
import type { ActionItem, Department, Employee } from '../types';
import { getDepartmentConfig } from '../constants';
import { PerformanceChart } from './PerformanceChart';
import { NewActionItemModal } from './NewActionItemModal';
import { ReminderModal } from './ReminderModal';

interface ActionItemsDashboardProps {
    actionItems: ActionItem[];
    onToggleCompletion: (id: number) => void;
    onAddItem: (item: Omit<ActionItem, 'id' | 'completed' | 'completionDate'>) => void;
    highlightedItemId: number | null;
    onClearHighlight: () => void;
    newItemIds: Set<number>;
    className?: string;
    style?: React.CSSProperties;
    departments: Department[];
    employees: Employee[];
    onUpdateEmployee: (employee: Employee) => void;
    loggedInUser: Employee;
    onManageEmployees: () => void;
}

const getStatus = (item: ActionItem): { text: string; color: string; icon: string; pulse: boolean; bg: string } => {
    if (item.completed) {
        return { text: 'تکمیل شده', color: 'text-emerald-600 dark:text-emerald-400', icon: 'fa-solid fa-circle-check', pulse: false, bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(item.dueDate);
    if (dueDate < today) {
        return { text: 'تاخیر دارد', color: 'text-rose-600 dark:text-rose-400', icon: 'fa-solid fa-circle-exclamation', pulse: true, bg: 'bg-rose-50 dark:bg-rose-900/20' };
    }
    return { text: 'در جریان', color: 'text-amber-600 dark:text-amber-400', icon: 'fa-solid fa-circle-dot', pulse: false, bg: 'bg-amber-50 dark:bg-amber-900/20' };
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const ActionItemsDashboard: React.FC<ActionItemsDashboardProps> = ({ 
    actionItems, 
    onToggleCompletion, 
    onAddItem, 
    highlightedItemId, 
    onClearHighlight, 
    newItemIds, 
    className, 
    style, 
    departments, 
    employees, 
    onUpdateEmployee, 
    loggedInUser,
    onManageEmployees
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [selectedItemForReminder, setSelectedItemForReminder] = useState<ActionItem | null>(null);
    const [filter, setFilter] = useState<Department | 'all'>('all');
    const [sortBy, setSortBy] = useState<'dueDate' | 'department'>('dueDate');
    const [chartType, setChartType] = useState<'progress' | 'pie'>('progress');
    const [searchQuery, setSearchQuery] = useState('');
    const [justCompletedId, setJustCompletedId] = useState<number | null>(null);

    useEffect(() => {
        if (highlightedItemId !== null) {
            const element = document.getElementById(`action-item-${highlightedItemId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('highlight');
                setTimeout(() => {
                    element.classList.remove('highlight');
                    onClearHighlight();
                }, 2000);
            } else {
                onClearHighlight();
            }
        }
    }, [highlightedItemId, onClearHighlight]);

    const filteredAndSortedItems = useMemo(() => {
        let items = [...actionItems];
        if (searchQuery.trim() !== '') {
            items = items.filter(item => item.task.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (filter !== 'all') {
            items = items.filter(item => item.department === filter);
        }
        items.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (sortBy === 'department') return a.department.localeCompare(b.department);
            return 0;
        });
        return items;
    }, [actionItems, filter, sortBy, searchQuery]);
    
    const handleToggle = (id: number) => {
        const item = actionItems.find(i => i.id === id);
        if (item && !item.completed) {
            setJustCompletedId(id);
            setTimeout(() => setJustCompletedId(null), 800);
        }
        onToggleCompletion(id);
    };

    return (
        <>
            <div className={`bg-white dark:bg-slate-800 p-6 lg:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all ${className}`} style={style}>
                <div className="flex flex-wrap justify-between items-center mb-8 gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <i className="fa-solid fa-list-check"></i>
                            </div>
                            برنامه اقدامات
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">مدیریت و پیگیری وظایف استخراج شده از جلسات</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onManageEmployees} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center gap-2">
                            <i className="fa-solid fa-user-gear"></i>
                            <span className="hidden sm:inline">مدیریت اعضا</span>
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                            <i className="fa-solid fa-plus"></i>
                            <span>افزودن کار جدید</span>
                        </button>
                    </div>
                </div>
                
                <PerformanceChart actionItems={actionItems} departments={departments} chartType={chartType} onChartTypeChange={setChartType} onDepartmentSelect={setFilter} />
                
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="md:col-span-1 relative">
                        <i className="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="جستجوی اقدام..." />
                    </div>
                    <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm">
                        <option value="all">همه دپارتمان‌ها</option>
                        {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                    </select>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm">
                        <option value="dueDate">مرتب‌سازی: تاریخ سررسید</option>
                        <option value="department">مرتب‌سازی: دپارتمان</option>
                    </select>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredAndSortedItems.length > 0 ? filteredAndSortedItems.map(item => {
                        const status = getStatus(item);
                        const isJustCompleted = justCompletedId === item.id;
                        const assignee = employees.find(e => e.id === item.assigneeId);
                        const deptConfig = getDepartmentConfig(item.department);
                        return (
                            <div id={`action-item-${item.id}`} key={item.id} className={`group relative flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${item.completed ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg'} ${isJustCompleted ? 'just-completed' : ''}`}>
                                <div className="flex-shrink-0 pt-1">
                                    <input type="checkbox" checked={item.completed} onChange={() => handleToggle(item.id)} className="h-6 w-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-bold text-slate-800 dark:text-slate-200 mb-2 truncate ${item.completed ? 'line-through decoration-emerald-500' : ''}`}>
                                        {item.task}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs">
                                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full font-bold ${status.bg} ${status.color}`}>
                                            <i className={`${status.icon} ${status.pulse ? 'animate-pulse' : ''}`}></i>
                                            <span>{status.text}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                            <i className="fa-solid fa-layer-group"></i>
                                            <span className="font-bold" style={{ color: deptConfig.colorHex }}>{item.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                            <i className="fa-solid fa-calendar-day"></i>
                                            <span>{formatDate(item.dueDate)}</span>
                                        </div>
                                        {assignee && (
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                                                <img src={assignee.avatarUrl} alt={assignee.name} className="w-5 h-5 rounded-full ring-1 ring-slate-200" />
                                                <span>{assignee.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!item.completed && assignee && (
                                    <button onClick={() => { setSelectedItemForReminder(item); setIsReminderModalOpen(true); }} className="opacity-0 group-hover:opacity-100 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                        <i className="fa-solid fa-paper-plane"></i>
                                    </button>
                                )}
                            </div>
                        )
                    }) : (
                         <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                 <i className="fa-solid fa-folder-open text-3xl text-slate-300"></i>
                             </div>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">موردی یافت نشد</p>
                        </div>
                    )}
                </div>
            </div>
            <NewActionItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddItem={onAddItem} employees={employees} departments={departments} />
            <ReminderModal isOpen={isReminderModalOpen} onClose={() => setIsReminderModalOpen(false)} item={selectedItemForReminder} assignee={selectedItemForReminder ? employees.find(e => e.id === selectedItemForReminder.assigneeId) || null : null} />
        </>
    );
};
