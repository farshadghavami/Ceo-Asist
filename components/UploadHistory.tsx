
import React from 'react';
import type { UploadHistoryItem } from '../types';

interface UploadHistoryProps {
    history: UploadHistoryItem[];
    isLoading: boolean;
    className?: string;
    style?: React.CSSProperties;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    return `${size.toLocaleString('fa-IR')} ${sizes[i]}`;
};

export const UploadHistory: React.FC<UploadHistoryProps> = ({ history, isLoading, className, style }) => {
    // If className contains 'bg-transparent', we remove the default white background
    const defaultClasses = className?.includes('bg-transparent') 
        ? "flex flex-col h-full" 
        : "bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-full";

    return (
        <div className={`${defaultClasses} transition-colors duration-300 ${className || ''}`} style={style}>
            <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2 flex-shrink-0 px-2">
                <i className="fa-solid fa-clock-rotate-left text-indigo-500"></i>
                تاریخچه جلسات
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar px-2">
                {history.length > 0 ? (
                    <ul className="space-y-3">
                        {history.map((item, index) => (
                            <li key={item.id} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                     {isLoading && index === 0 ? (
                                        <svg className="animate-spin h-5 w-5 text-indigo-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <i className="fa-solid fa-file-audio text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0"></i>
                                    )}
                                    <div className="flex flex-col overflow-hidden w-full">
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={item.fileName}>{item.fileName}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-1 border-t border-slate-200 dark:border-slate-600 pt-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                     <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatFileSize(item.fileSize)}</span>
                                    <div className="flex flex-col items-end flex-shrink-0 text-right">
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.uploadDate.split(',')[1]}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center h-full">
                         <i className="fa-solid fa-history text-3xl mb-3 opacity-30"></i>
                        <p className="text-sm">هنوز جلسه‌ای ثبت نشده است.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
