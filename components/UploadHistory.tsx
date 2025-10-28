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
    // Use Number.toLocaleString for Farsi numerals
    return `${size.toLocaleString('fa-IR')} ${sizes[i]}`;
};


export const UploadHistory: React.FC<UploadHistoryProps> = ({ history, isLoading, className, style }) => {
    return (
        <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-300 ${className}`} style={style}>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-indigo-500"></i>
                تاریخچه آپلودها
            </h2>
            <div className="max-h-48 overflow-y-auto pr-2">
                {history.length > 0 ? (
                    <ul className="space-y-3">
                        {history.map((item, index) => (
                            <li key={item.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                     {isLoading && index === 0 ? (
                                        <svg className="animate-spin h-5 w-5 text-indigo-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <i className="fa-solid fa-file-audio text-slate-400 flex-shrink-0"></i>
                                    )}
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate" title={item.fileName}>{item.fileName}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(item.fileSize)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 text-right">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.uploadDate.split(',')[1]}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.uploadDate.split(',')[0]}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                         <i className="fa-solid fa-history text-4xl mb-3"></i>
                        <p>هنوز فایلی آپلود نشده است.</p>
                    </div>
                )}
            </div>
        </div>
    );
};