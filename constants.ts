import type { Department, ActionItem, Employee } from './types';

export const DEPARTMENTS: Department[] = ['فروش', 'بازاریابی', 'فنی', 'پشتیبانی', 'منابع انسانی', 'عمومی'];

export const DEPARTMENTS_CONFIG: { [key in Department]: { colorHex: string, borderClass: string } } = {
    'فروش':       { colorHex: '#3b82f6', borderClass: 'border-blue-500' },
    'بازاریابی':  { colorHex: '#8b5cf6', borderClass: 'border-violet-500' },
    'فنی':         { colorHex: '#10b981', borderClass: 'border-emerald-500' },
    'پشتیبانی':   { colorHex: '#f97316', borderClass: 'border-orange-500' },
    'منابع انسانی':{ colorHex: '#ec4899', borderClass: 'border-pink-500' },
    'عمومی':      { colorHex: '#6b7280', borderClass: 'border-gray-500' },
};

export const INITIAL_EMPLOYEES: Employee[] = [
    { id: 101, name: 'سارا احمدی', phone: '989120000001', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: 102, name: 'رضا قاسمی', phone: '989120000002', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: 103, name: 'مریم حسینی', phone: '989120000003', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: 104, name: 'علی مرادی', phone: '989120000004', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
];

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
    { id: 1, task: 'پیگیری مشتریان بالقوه از نمایشگاه اخیر', department: 'فروش', dueDate: '2024-07-25', completed: false, completionDate: null, assigneeId: 101 },
    { id: 2, task: 'طراحی کمپین تبلیغاتی برای محصول جدید', department: 'بازاریابی', dueDate: '2024-07-20', completed: true, completionDate: '2024-07-19', assigneeId: 103 },
    { id: 3, task: 'رفع باگ گزارش شده در ماژول پرداخت', department: 'فنی', dueDate: '2024-07-22', completed: false, completionDate: null, assigneeId: 102 },
    { id: 4, task: 'آماده‌سازی گزارش هفتگی تیکت‌های پشتیبانی', department: 'پشتیبانی', dueDate: '2024-07-21', completed: false, completionDate: null, assigneeId: 104 },
    { id: 5, task: 'برنامه‌ریزی مصاحبه‌های استخدامی برای موقعیت توسعه‌دهنده', department: 'منابع انسانی', dueDate: '2024-07-28', completed: false, completionDate: null, assigneeId: 101 },
];