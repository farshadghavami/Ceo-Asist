export type Department = 'فروش' | 'بازاریابی' | 'فنی' | 'پشتیبانی' | 'منابع انسانی' | 'عمومی';

export interface Employee {
    id: number;
    name: string;
    phone: string; // For SMS/WhatsApp/Telegram integration
    avatarUrl: string;
}

export interface ActionItem {
    id: number;
    task: string;
    department: Department;
    dueDate: string;
    completed: boolean;
    completionDate: string | null;
    assigneeId?: number; // Optional: ID of the employee assigned to the task
}

export interface UploadHistoryItem {
    id: number;
    fileName: string;
    fileSize: number;
    uploadDate: string;
}

export interface Notification {
    id: number;
    message: string;
    actionItemId: number;
    read: boolean;
}
