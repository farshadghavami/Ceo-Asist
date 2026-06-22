import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { Notification } from '../types';

interface HeaderProps {
    businessName: string;
    notifications: Notification[];
    onMarkAsRead: () => void;
    onNotificationClick: (actionItemId: number) => void;
    user: { name: string };
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ businessName, notifications, onMarkAsRead, onNotificationClick, user, onLogout }) => {
    const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const userRef = useRef<HTMLDivElement>(null);
    
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const handleToggleNotificationDropdown = () => {
        setIsNotificationDropdownOpen(prev => !prev);
        if (isUserDropdownOpen) setIsUserDropdownOpen(false);
        if (!isNotificationDropdownOpen) {
            onMarkAsRead();
        }
    };

    const handleToggleUserDropdown = () => {
        setIsUserDropdownOpen(prev => !prev);
        if (isNotificationDropdownOpen) setIsNotificationDropdownOpen(false);
    }
    
    const handleNotificationItemClick = (actionItemId: number) => {
        onNotificationClick(actionItemId);
        setIsNotificationDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationDropdownOpen(false);
            }
            if (userRef.current && !userRef.current.contains(event.target as Node)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const userInitials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <header className="bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center transition-colors duration-300 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="font-black text-white text-xl tracking-tighter">1001</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                    {businessName}
                </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                    <button 
                        onClick={handleToggleNotificationDropdown}
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
                    {isNotificationDropdownOpen && (
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

                {/* User Menu */}
                 <div className="relative" ref={userRef}>
                    <button 
                        onClick={handleToggleUserDropdown}
                        className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 border-2 border-transparent hover:border-indigo-500 transition-all"
                        aria-label="منوی کاربر"
                    >
                        {userInitials}
                    </button>
                     {isUserDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-slide-up origin-top-left">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">خوش آمدید، {user.name}</p>
                            </div>
                            <div className="p-1">
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left p-2 flex items-center gap-3 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                >
                                    <i className="fa-solid fa-arrow-right-from-bracket w-4 text-center"></i>
                                    <span>خروج از حساب</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
