
import React, { useState } from 'react';
import type { Department } from '../types';

interface ReferralModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (department: Department, reason: string) => void;
    departments: Department[];
    currentDepartment: Department;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, onSubmit, departments, currentDepartment }) => {
    const [selectedDept, setSelectedDept] = useState<Department | ''>('');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedDept) {
            onSubmit(selectedDept, reason);
            setSelectedDept('');
            setReason('');
            onClose();
        }
    };

    if (!isOpen) return null;

    // Filter out the current department from the list
    const availableDepartments = departments.filter(d => d !== currentDepartment);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-share-from-square text-indigo-500"></i>
                            ارجاع به واحد دیگر
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            با ارجاع این وظیفه، مسئولیت آن از شما سلب شده و به دپارتمان انتخاب شده منتقل می‌شود.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    واحد مقصد
                                </label>
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value as Department)}
                                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    required
                                >
                                    <option value="" disabled>انتخاب کنید...</option>
                                    {availableDepartments.map(dep => (
                                        <option key={dep} value={dep}>{dep}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    توضیحات ارجاع (اختیاری)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    placeholder="علت ارجاع به واحد دیگر..."
                                />
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-3 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">لغو</button>
                        <button type="submit" disabled={!selectedDept} className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed">
                            تایید و ارجاع
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
