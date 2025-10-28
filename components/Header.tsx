import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Notification } from '../types';

interface HeaderProps {
    notifications: Notification[];
    onMarkAsRead: () => void;
    onNotificationClick: (actionItemId: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ notifications, onMarkAsRead, onNotificationClick }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const handleToggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
        if (!isDropdownOpen) {
            onMarkAsRead();
        }
    };
    
    const handleNotificationItemClick = (actionItemId: number) => {
        onNotificationClick(actionItemId);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center transition-colors duration-300 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                    <i className="fa-solid fa-brain text-white text-xl"></i>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                    دستیار کسب و کار هوشمند
                </h1>
            </div>
            <div className="relative" ref={dropdownRef}>
                <button 
                    onClick={handleToggleDropdown}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label="نمایش اعلانات"
                >
                    <i className="fa-solid fa-bell text-xl text-slate-600 dark:text-slate-300"></i>
                    {unreadCount > 0 && (
                         <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 text-white text-xs flex items-center justify-center font-bold">
                            {unreadCount.toLocaleString('fa-IR')}
                         </span>
                    )}
                </button>
                {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-slide-up origin-top-left">
                        <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-800 dark:text-white">اعلانات</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        onClick={() => handleNotificationItemClick(notification.actionItemId)}
                                        className="p-3 flex items-start gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                                    >
                                        <div className="w-5 h-5 flex-shrink-0 mt-1 flex items-center justify-center bg-red-100 dark:bg-red-900/50 rounded-full">
                                           <i className="fa-solid fa-exclamation-circle text-red-500 text-xs"></i>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{notification.message}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center p-6">
                                    هیچ اعلان جدیدی وجود ندارد.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};