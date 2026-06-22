
import React, { useState, useMemo, useEffect } from 'react';
import type { ActionItem, Request } from '../types';

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (request: Omit<Request, 'id'>) => void;
    employeeActionItems: ActionItem[];
    employeeId: number;
}

const SHAMSI_MONTHS = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

export const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onSubmit, employeeActionItems, employeeId }) => {
    const [requestType, setRequestType] = useState<'financial' | 'leave_hourly' | 'leave_daily'>('financial');
    
    // Financial Input
    const [amount, setAmount] = useState('');

    // Hourly/Daily Inputs
    const [shamsiDate, setShamsiDate] = useState({ year: 1403, month: 1, day: 1 }); // Start Date
    const [shamsiEndDate, setShamsiEndDate] = useState({ year: 1403, month: 1, day: 1 }); // End Date for daily leave
    
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const [submitted, setSubmitted] = useState(false);
    const [lastResult, setLastResult] = useState<{ status: 'approved' | 'rejected', reason: string } | null>(null);

    // Initialize Date to Today (Jalali)
    useEffect(() => {
        if (isOpen) {
            try {
                // Use Intl to get current Jalali date
                const now = new Date();
                const formatter = new Intl.DateTimeFormat('fa-IR-u-nu-latn', { year: 'numeric', month: 'numeric', day: 'numeric' });
                const parts = formatter.formatToParts(now);
                
                const year = parseInt(parts.find(p => p.type === 'year')?.value || '1403');
                const month = parseInt(parts.find(p => p.type === 'month')?.value || '1');
                const day = parseInt(parts.find(p => p.type === 'day')?.value || '1');

                const initialDate = { year, month, day };
                setShamsiDate(initialDate);
                setShamsiEndDate(initialDate);
            } catch (e) {
                console.error("Error setting default date", e);
            }
        }
    }, [isOpen]);

    // Calculate Performance Logic
    const performanceStats = useMemo(() => {
        const total = employeeActionItems.length;
        const completed = employeeActionItems.filter(item => item.completed).length;
        const rate = total === 0 ? 0 : (completed / total) * 100;
        return { total, completed, rate };
    }, [employeeActionItems]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Construct the final value string based on inputs
        let finalValue = '';
        if (requestType === 'financial') {
            finalValue = `${parseInt(amount).toLocaleString('fa-IR')} تومان`;
        } else {
            const startDateStr = `${shamsiDate.year}/${shamsiDate.month.toString().padStart(2, '0')}/${shamsiDate.day.toString().padStart(2, '0')}`;
            
            if (requestType === 'leave_hourly') {
                finalValue = `${startDateStr} - از ساعت ${startTime} تا ${endTime}`;
            } else {
                const endDateStr = `${shamsiEndDate.year}/${shamsiEndDate.month.toString().padStart(2, '0')}/${shamsiEndDate.day.toString().padStart(2, '0')}`;
                finalValue = `از ${startDateStr} تا ${endDateStr}`;
            }
        }

        // Automated Decision Logic
        const threshold = 70;
        const isApproved = performanceStats.rate >= threshold;
        
        let reason = '';
        if (isApproved) {
            reason = `تایید خودکار سیستم: عملکرد شما (${Math.round(performanceStats.rate)}٪) مطلوب است.`;
        } else {
            reason = `رد خودکار سیستم: عملکرد شما (${Math.round(performanceStats.rate)}٪) کمتر از حد مجاز (${threshold}٪) است. لطفا ابتدا وظایف محوله را تکمیل کنید.`;
        }

        const newRequest: Omit<Request, 'id'> = {
            employeeId,
            type: requestType,
            value: finalValue,
            requestDate: new Date().toISOString(),
            status: isApproved ? 'approved' : 'rejected',
            reason,
            performanceRateAtTime: performanceStats.rate
        };

        onSubmit(newRequest);
        setLastResult({ status: newRequest.status, reason: newRequest.reason });
        setSubmitted(true);
    };

    const resetForm = () => {
        setSubmitted(false);
        setAmount('');
        setStartTime('');
        setEndTime('');
        setLastResult(null);
        onClose();
    };

    const renderJalaliDatePicker = (
        currentDate: { year: number; month: number; day: number },
        setDate: React.Dispatch<React.SetStateAction<{ year: number; month: number; day: number }>>
    ) => (
        <div className="grid grid-cols-3 gap-2">
            <div>
                <label className="block text-xs text-slate-500 mb-1">روز</label>
                <select
                    value={currentDate.day}
                    onChange={e => setDate({ ...currentDate, day: parseInt(e.target.value) })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs text-slate-500 mb-1">ماه</label>
                <select
                    value={currentDate.month}
                    onChange={e => setDate({ ...currentDate, month: parseInt(e.target.value) })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                >
                    {SHAMSI_MONTHS.map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs text-slate-500 mb-1">سال</label>
                <select
                    value={currentDate.year}
                    onChange={e => setDate({ ...currentDate, year: parseInt(e.target.value) })}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                >
                    <option value={1402}>1402</option>
                    <option value={1403}>1403</option>
                    <option value={1404}>1404</option>
                </select>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                
                {!submitted ? (
                    <form onSubmit={handleSubmit}>
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-hand-holding-dollar text-indigo-500"></i>
                                درخواست جدید
                            </h2>
                            
                            {/* Performance Alert */}
                            <div className={`mb-6 p-3 rounded-lg border ${performanceStats.rate >= 70 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-semibold text-sm">وضعیت عملکرد فعلی:</span>
                                    <span className="font-bold">{Math.round(performanceStats.rate)}٪</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                    <div className={`h-1.5 rounded-full ${performanceStats.rate >= 70 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${performanceStats.rate}%` }}></div>
                                </div>
                                <p className="text-xs mt-2 opacity-80">
                                    سیستم تنها در صورتی با درخواست موافقت می‌کند که عملکرد شما بالای ۷۰٪ باشد.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">نوع درخواست</label>
                                    <select
                                        value={requestType}
                                        onChange={(e) => setRequestType(e.target.value as any)}
                                        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                    >
                                        <option value="financial">مساعده مالی</option>
                                        <option value="leave_hourly">مرخصی ساعتی</option>
                                        <option value="leave_daily">مرخصی روزانه</option>
                                    </select>
                                </div>

                                {requestType === 'financial' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            مبلغ درخواستی (تومان)
                                        </label>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                            placeholder="مثال: 5000000"
                                            required
                                        />
                                    </div>
                                )}

                                {requestType !== 'financial' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            {requestType === 'leave_hourly' ? 'تاریخ روز مورد نظر' : 'تاریخ شروع مرخصی'}
                                        </label>
                                        {renderJalaliDatePicker(shamsiDate, setShamsiDate)}
                                    </div>
                                )}

                                {requestType === 'leave_daily' && (
                                     <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            تاریخ پایان مرخصی
                                        </label>
                                        {renderJalaliDatePicker(shamsiEndDate, setShamsiEndDate)}
                                    </div>
                                )}

                                {requestType === 'leave_hourly' && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                ساعت شروع
                                            </label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-center"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                ساعت پایان
                                            </label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-center"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-3 flex justify-end gap-3">
                            <button type="button" onClick={resetForm} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">لغو</button>
                            <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md">
                                بررسی سیستم و ثبت
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 text-center animate-fade-in-slide-up">
                        <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${lastResult?.status === 'approved' ? 'bg-emerald-100 text-emerald-500' : 'bg-red-100 text-red-500'}`}>
                            <i className={`fa-solid ${lastResult?.status === 'approved' ? 'fa-check' : 'fa-xmark'} text-4xl`}></i>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${lastResult?.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {lastResult?.status === 'approved' ? 'درخواست تایید شد' : 'درخواست رد شد'}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg text-sm">
                            {lastResult?.reason}
                        </p>
                        <button onClick={resetForm} className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            متوجه شدم
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
