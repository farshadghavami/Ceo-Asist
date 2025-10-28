import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { ActionItem, Department } from '../types';
import { DEPARTMENTS_CONFIG } from '../constants';

interface PerformanceChartProps {
    actionItems: ActionItem[];
    chartType: 'progress' | 'pie';
    onChartTypeChange: (type: 'progress' | 'pie') => void;
    onDepartmentSelect: (department: Department) => void;
}

interface PieData {
    name: string;
    value: number;
    color: string;
    percentage: number;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ actionItems, chartType, onChartTypeChange, onDepartmentSelect }) => {
    const [hoveredData, setHoveredData] = useState<PieData | null>(null);

    const stats = useMemo(() => {
        const total = actionItems.length;
        if (total === 0) return null;

        const completed = actionItems.filter(item => item.completed).length;
        const pending = total - completed;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = actionItems.filter(item => !item.completed && new Date(item.dueDate) < today).length;
        
        const completionRate = Math.round((completed / total) * 100);

        const tasksByDept = Object.keys(DEPARTMENTS_CONFIG).reduce((acc, dept) => {
            acc[dept as Department] = {
                total: actionItems.filter(item => item.department === dept).length,
                completed: actionItems.filter(item => item.department === dept && item.completed).length,
            };
            return acc;
        }, {} as Record<Department, { total: number; completed: number }>);
        
        return { total, completed, pending, overdue, completionRate, tasksByDept };
    }, [actionItems]);

    const pieData = useMemo<PieData[]>(() => {
        if (!stats || stats.completed === 0) return [];
        return Object.entries(stats.tasksByDept)
            .filter(([, data]) => data.completed > 0)
            .map(([dept, data]) => ({
                name: dept,
                value: data.completed,
                color: DEPARTMENTS_CONFIG[dept as Department].colorHex,
                percentage: Math.round((data.completed / stats.completed) * 100)
            }));
    }, [stats]);


    if (!stats) {
        return (
            <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-center text-slate-500 dark:text-slate-400">
                <p>داده‌ای برای نمایش عملکرد وجود ندارد. یک اقدام اضافه کنید.</p>
            </div>
        );
    }
    
    const onPieEnter = (_: any, index: number) => setHoveredData(pieData[index]);
    const onPieLeave = () => setHoveredData(null);
    const onPieClick = (_: any, index: number) => onDepartmentSelect(pieData[index].name as Department);

    return (
        <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">نمای کلی عملکرد</h3>
                <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-600 rounded-lg">
                    <button
                        onClick={() => onChartTypeChange('progress')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartType === 'progress' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-300'}`}
                        aria-label="نمایش نمودار پیشرفت"
                    >
                        <i className="fa-solid fa-chart-simple"></i>
                    </button>
                    <button
                        onClick={() => onChartTypeChange('pie')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${chartType === 'pie' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-300'}`}
                        aria-label="نمایش نمودار دایره‌ای"
                    >
                        <i className="fa-solid fa-chart-pie"></i>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">کل اقدامات</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-emerald-500">{stats.completed.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">تکمیل شده</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-yellow-500">{stats.pending.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">در حال انجام</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-red-500">{stats.overdue.toLocaleString('fa-IR')}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">تاخیر خورده</p>
                </div>
            </div>

            {chartType === 'progress' ? (
                 <div className="w-full">
                    <h4 className="text-md font-semibold mb-3 text-slate-700 dark:text-slate-200">پیشرفت تکمیل اقدامات بر اساس دپارتمان</h4>
                    <div className="space-y-3">
                        {Object.entries(stats.tasksByDept).filter(([, data]) => data.total > 0).map(([dept, data]) => (
                            <div key={dept}>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-medium" style={{ color: DEPARTMENTS_CONFIG[dept as Department].colorHex }}>{dept}</span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {data.completed.toLocaleString('fa-IR')} / {data.total.toLocaleString('fa-IR')}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                                    <div
                                        className="h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%`, backgroundColor: DEPARTMENTS_CONFIG[dept as Department].colorHex }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="w-full">
                    <h4 className="text-md font-semibold mb-3 text-slate-700 dark:text-slate-200">سهم دپارتمان‌ها از اقدامات تکمیل شده</h4>
                     {pieData.length > 0 ? (
                        <>
                        <div className="relative h-56 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                        onMouseLeave={onPieLeave}
                                        onClick={onPieClick}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer focus:outline-none" />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                                {hoveredData ? (
                                     <div className="text-center">
                                        <div className="text-2xl font-bold" style={{color: hoveredData.color}}>{hoveredData.percentage.toLocaleString('fa-IR')}%</div>
                                        <div className="text-sm text-slate-600 dark:text-slate-300 font-semibold">{hoveredData.name}</div>
                                     </div>
                                ) : (
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-emerald-500">{stats.completed.toLocaleString('fa-IR')}</div>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">تکمیل شده</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                            {pieData.map((entry) => (
                                <div key={`legend-${entry.name}`} onClick={() => onDepartmentSelect(entry.name as Department)} className="flex items-center gap-2 cursor-pointer p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                    <span className="text-sm text-slate-600 dark:text-slate-300">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                        </>
                     ) : (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                             <i className="fa-solid fa-check-circle text-4xl mb-3"></i>
                            <p>هیچ اقدام تکمیل شده‌ای برای نمایش در نمودار وجود ندارد.</p>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
};