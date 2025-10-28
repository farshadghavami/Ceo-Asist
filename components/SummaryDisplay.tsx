import React from 'react';

interface SummaryDisplayProps {
    summary: string;
    isLoading: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, isLoading, className, style }) => {
    return (
        <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-300 h-full ${className}`} style={style}>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-file-lines text-indigo-500"></i>
                خلاصه مدیریتی
            </h2>
            {isLoading ? (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
                </div>
            ) : (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {summary}
                </p>
            )}
        </div>
    );
};