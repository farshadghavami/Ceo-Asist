import React, { useState, useMemo, useEffect } from 'react';
import type { ActionItem, Department, Employee } from '../types';
import { DEPARTMENTS_CONFIG } from '../constants';
import { PerformanceChart } from './PerformanceChart';
import { NewActionItemModal } from './NewActionItemModal';
import { ReminderModal } from './ReminderModal';
import { ManageEmployeesModal } from './ManageEmployeesModal';

interface ActionItemsDashboardProps {
    actionItems: ActionItem[];
    onToggleCompletion: (id: number) => void;
    onAddItem: (item: Omit<ActionItem, 'id' | 'completed' | 'completionDate'>) => void;
    highlightedItemId: number | null;
    onClearHighlight: () => void;
    newItemIds: Set<number>;
    className?: string;
    style?: React.CSSProperties;
    employees: Employee[];
    onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
    onUpdateEmployee: (employee: Employee) => void;
    onDeleteEmployee: (employeeId: number) => void;
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
    return { text: 'در حال انجام', color: 'text-yellow-500', icon: 'fa-solid fa-spinner', pulse: false };
};

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const ActionItemsDashboard: React.FC<ActionItemsDashboardProps> = ({ actionItems, onToggleCompletion, onAddItem, highlightedItemId, onClearHighlight, newItemIds, className, style, employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
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
            items = items.filter(item =>
                item.task.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (filter !== 'all') {
            items = items.filter(item => item.department === filter);
        }
        
        items.sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            if (sortBy === 'dueDate') {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (sortBy === 'department') {
                return a.department.localeCompare(b.department);
            }
            return 0;
        });
        return items;
    }, [actionItems, filter, sortBy, searchQuery]);
    
    const handleToggle = (id: number) => {
        const item = actionItems.find(i => i.id === id);
        if (item && !item.completed) {
            setJustCompletedId(id);
            setTimeout(() => {
                setJustCompletedId(null);
            }, 800);
        }
        onToggleCompletion(id);
    };

    const handleOpenReminderModal = (item: ActionItem) => {
        setSelectedItemForReminder(item);
        setIsReminderModalOpen(true);
    };

    const selectedAssignee = useMemo(() => {
        if (!selectedItemForReminder || !selectedItemForReminder.assigneeId) return null;
        return employees.find(e => e.id === selectedItemForReminder.assigneeId) || null;
    }, [selectedItemForReminder, employees]);

    return (
        <>
            <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-300 ${className}`} style={style}>
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-list-check text-indigo-500"></i>
                        اقدامات
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEmployeeModalOpen(true)}
                            className="bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <i className="fa-solid fa-users-cog"></i>
                            <span>مدیریت کارمندان</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                            <i className="fa-solid fa-plus"></i>
                            <span>افزودن اقدام</span>
                        </button>
                    </div>
                </div>
                
                <PerformanceChart 
                    actionItems={actionItems}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                    onDepartmentSelect={(dep) => setFilter(dep)} 
                />
                
                 <div className="flex flex-col gap-4 my-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div>
                        <label htmlFor="search-task" className="sr-only">جستجوی اقدام</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                id="search-task"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full p-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                                placeholder="جستجو در اقدامات..."
                            />
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[150px]">
                            <label htmlFor="filter-department" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">فیلتر بر اساس دپارتمان</label>
                            <select
                                id="filter-department"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as Department | 'all')}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                            >
                                <option value="all">همه دپارتمان‌ها</option>
                                {Object.keys(DEPARTMENTS_CONFIG).map(dep => <option key={dep} value={dep}>{dep}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label htmlFor="sort-by" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">مرتب‌سازی بر اساس</label>
                            <select
                                id="sort-by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'department')}
                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                            >
                                <option value="dueDate">تاریخ سررسید</option>
                                <option value="department">دپارتمان</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {filteredAndSortedItems.length > 0 ? filteredAndSortedItems.map(item => {
                        const status = getStatus(item);
                        const isJustCompleted = justCompletedId === item.id;
                        const isNewItem = newItemIds.has(item.id);
                        const assignee = employees.find(e => e.id === item.assigneeId);
                        return (
                            <div 
                                id={`action-item-${item.id}`} 
                                key={item.id} 
                                className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-300 ${item.completed ? 'completed bg-slate-100 dark:bg-slate-700/50 opacity-70' : 'bg-slate-50 dark:bg-slate-700'} ${isJustCompleted ? 'just-completed' : ''} ${isNewItem ? 'new-item-animation' : ''}`}>
                               <div className="flex-shrink-0 pt-1">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        onChange={() => handleToggle(item.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                        <span className="task-text">
                                            {item.task}
                                        </span>
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {assignee && (
                                            <div className="flex items-center gap-1.5" title={`مسئول: ${assignee.name}`}>
                                                <img src={assignee.avatarUrl} alt={assignee.name} className="w-5 h-5 rounded-full" />
                                                <span className="font-medium">{assignee.name.split(' ')[0]}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5" title="دپارتمان">
                                            <i className="fa-solid fa-users"></i>
                                            <span
                                                className="font-semibold"
                                                style={{ color: DEPARTMENTS_CONFIG[item.department].colorHex }}
                                            >{item.department}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5" title="تاریخ سررسید">
                                            <i className="fa-solid fa-calendar-alt"></i>
                                            <span>{formatDate(item.dueDate)}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 font-semibold ${status.color}`} title="وضعیت">
                                           <i className={`${status.icon} ${status.pulse ? 'animate-pulse' : ''}`}></i>
                                            <span>{status.text}</span>
                                        </div>
                                    </div>
                                </div>
                                {!item.completed && assignee && (
                                    <div className="flex-shrink-0 self-center">
                                        <button 
                                            onClick={() => handleOpenReminderModal(item)}
                                            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600 transition-colors"
                                            aria-label="ارسال یادآوری"
                                            title="ارسال یادآوری"
                                        >
                                            <i className="fa-solid fa-paper-plane"></i>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    }) : (
                         <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                             <i className="fa-solid fa-folder-open text-4xl mb-3"></i>
                            <p>هیچ اقدامی برای فیلتر انتخاب شده وجود ندارد.</p>
                        </div>
                    )}
                </div>
            </div>
            <NewActionItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddItem={onAddItem} employees={employees} />
            <ReminderModal
                isOpen={isReminderModalOpen}
                onClose={() => setIsReminderModalOpen(false)}
                item={selectedItemForReminder}
                assignee={selectedAssignee}
            />
            <ManageEmployeesModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                employees={employees}
                onAddEmployee={onAddEmployee}
                onUpdateEmployee={onUpdateEmployee}
                onDeleteEmployee={onDeleteEmployee}
            />
        </>
    );
};