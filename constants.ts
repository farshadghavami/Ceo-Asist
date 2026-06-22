
import type { Department, ActionItem, Employee } from './types';

export const DEPARTMENTS: Department[] = ['فروش', 'بازاریابی', 'فنی', 'پشتیبانی', 'منابع انسانی', 'عمومی'];

// Fix: Updated DEPARTMENTS_CONFIG type to use a string index signature. This is required because the Department type was changed to a general string to support custom departments.
export const DEPARTMENTS_CONFIG: { [key: string]: { colorHex: string, borderClass: string } } = {
    'فروش':       { colorHex: '#3b82f6', borderClass: 'border-blue-500' },
    'بازاریابی':  { colorHex: '#8b5cf6', borderClass: 'border-violet-500' },
    'فنی':         { colorHex: '#10b981', borderClass: 'border-emerald-500' },
    'پشتیبانی':   { colorHex: '#f97316', borderClass: 'border-orange-500' },
    'منابع انسانی':{ colorHex: '#ec4899', borderClass: 'border-pink-500' },
    'عمومی':      { colorHex: '#6b7280', borderClass: 'border-gray-500' },
};

// Color palette for custom departments
const CUSTOM_DEPARTMENT_COLORS = [
    { colorHex: '#ef4444', borderClass: 'border-red-500' },   // red
    { colorHex: '#f59e0b', borderClass: 'border-amber-500' }, // amber
    { colorHex: '#84cc16', borderClass: 'border-lime-500' },  // lime
    { colorHex: '#22c55e', borderClass: 'border-green-500' }, // green
    { colorHex: '#14b8a6', borderClass: 'border-teal-500' },  // teal
    { colorHex: '#06b6d4', borderClass: 'border-cyan-500' },  // cyan
    { colorHex: '#6366f1', borderClass: 'border-indigo-500' },// indigo
    { colorHex: '#d946ef', borderClass: 'border-fuchsia-500' }// fuchsia
];

let colorIndex = 0;
const assignedCustomColors: { [key: string]: { colorHex: string, borderClass: string } } = {};

export const getDepartmentConfig = (department: Department): { colorHex: string, borderClass: string } => {
    // Check if it's a default department
    if (DEPARTMENTS_CONFIG[department]) {
        return DEPARTMENTS_CONFIG[department];
    }
    
    // Check if a color has already been assigned to this custom department
    if (assignedCustomColors[department]) {
        return assignedCustomColors[department];
    }
    
    // Assign a new color from the palette
    const newColor = CUSTOM_DEPARTMENT_COLORS[colorIndex % CUSTOM_DEPARTMENT_COLORS.length];
    assignedCustomColors[department] = newColor;
    colorIndex++;
    
    return newColor;
};


// FIX: Add missing 'email' and 'role' properties to Employee objects to match the Employee type definition.
export const INITIAL_EMPLOYEES: Employee[] = [
    { id: 101, name: 'سارا احمدی', email: 'sara.ahmadi@example.com', role: 'employee', phone: '989120000001', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: 102, name: 'رضا قاسمی', email: 'reza.ghasemi@example.com', role: 'employee', phone: '989120000002', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: 103, name: 'مریم حسینی', email: 'maryam.hosseini@example.com', role: 'employee', phone: '989120000003', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: 104, name: 'علی مرادی', email: 'ali.moradi@example.com', role: 'employee', phone: '989120000004', avatarUrl: 'https://i.pravatar.cc/150?img=4' },
];

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
    // FIX: Add missing 'comments' property to satisfy the ActionItem type.
    { id: 1, task: 'پیگیری مشتریان بالقوه از نمایشگاه اخیر', department: 'فروش', dueDate: '2024-07-25', completed: false, completionDate: null, assigneeId: 101, comments: [] },
    // FIX: Add missing 'comments' property to satisfy the ActionItem type.
    { id: 2, task: 'طراحی کمپین تبلیغاتی برای محصول جدید', department: 'بازاریابی', dueDate: '2024-07-20', completed: true, completionDate: '2024-07-19', assigneeId: 103, comments: [] },
    // FIX: Add missing 'comments' property to satisfy the ActionItem type.
    { id: 3, task: 'رفع باگ گزارش شده در ماژول پرداخت', department: 'فنی', dueDate: '2024-07-22', completed: false, completionDate: null, assigneeId: 102, comments: [] },
    // FIX: Add missing 'comments' property to satisfy the ActionItem type.
    { id: 4, task: 'آماده‌سازی گزارش هفتگی تیکت‌های پشتیبانی', department: 'پشتیبانی', dueDate: '2024-07-21', completed: false, completionDate: null, assigneeId: 104, comments: [] },
    // FIX: Add missing 'comments' property to satisfy the ActionItem type.
    { id: 5, task: 'برنامه‌ریزی مصاحبه‌های استخدامی برای موقعیت توسعه‌دهنده', department: 'منابع انسانی', dueDate: '2024-07-28', completed: false, completionDate: null, assigneeId: 101, comments: [] },
];