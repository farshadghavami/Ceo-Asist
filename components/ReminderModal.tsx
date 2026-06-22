import React, { useState, useEffect } from 'react';
import type { ActionItem, Employee } from '../types';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: ActionItem | null;
    assignee: Employee | null;
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, item, assignee }) => {
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        if (isOpen && item && assignee) {
            const template = `سلام {assigneeName} عزیز،\n\nاین یک یادآوری برای اقدام زیر است:\n"{task}"\n\nتاریخ سررسید این اقدام {dueDate} می‌باشد.\n\nلطفا پیگیری بفرمایید.`;
            const populatedMessage = template
                .replace('{assigneeName}', assignee.name)
                .replace('{task}', item.task)
                .replace('{dueDate}', formatDate(item.dueDate));
            setCustomMessage(populatedMessage);
        }
    }, [isOpen, item, assignee]);


    if (!isOpen || !item || !assignee) return null;

    const handleSend = (platform: 'whatsapp' | 'telegram' | 'sms') => {
        const encodedMessage = encodeURIComponent(customMessage);
        let url = '';
        switch (platform) {
            case 'whatsapp':
                url = `https://wa.me/${assignee.phone}?text=${encodedMessage}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=&text=${encodedMessage}`;
                break;
            case 'sms':
                url = `sms:${assignee.phone}?&body=${encodedMessage}`;
                break;
        }
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 flex-shrink-0">
                             <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full rounded-full object-cover"/>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">ارسال یادآوری به {assignee.name}</h2>
                             <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">برای اقدام: "{item.task}"</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <label htmlFor="reminder-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            متن پیام:
                        </label>
                        <textarea
                            id="reminder-message"
                            rows={6}
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm leading-relaxed"
                        />
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            می‌توانید از متغیرهای <code className="bg-gray-200 dark:bg-gray-600 p-0.5 rounded text-xs">{'{assigneeName}'}</code>, <code className="bg-gray-200 dark:bg-gray-600 p-0.5 rounded text-xs">{'{task}'}</code>, و <code className="bg-gray-200 dark:bg-gray-600 p-0.5 rounded text-xs">{'{dueDate}'}</code> استفاده کنید.
                        </p>
                    </div>

                    <div className="mt-6">
                         <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">انتخاب روش ارسال:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button onClick={() => handleSend('whatsapp')} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors">
                                <i className="fab fa-whatsapp"></i>
                                <span>واتس‌اپ</span>
                            </button>
                             <button onClick={() => handleSend('telegram')} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors">
                                <i className="fab fa-telegram"></i>
                                <span>تلگرام</span>
                            </button>
                            <button onClick={() => handleSend('sms')} className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors">
                               <i className="fa-solid fa-comment-sms"></i>
                                <span>پیامک</span>
                            </button>
                        </div>
                    </div>

                </div>
                 <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">بستن</button>
                </div>
            </div>
        </div>
    );
};
