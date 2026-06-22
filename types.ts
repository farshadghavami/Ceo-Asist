
// Fix: Changed Department to string to allow for user-defined departments from onboarding. This resolves type conflicts when adding new department names.
export type Department = string;

export interface Employee {
    id: number;
    name: string;
    email: string; // For login
    password?: string; // For mock login
    phone: string; // For SMS/WhatsApp/Telegram integration
    avatarUrl: string;
    department?: Department;
    role: 'manager' | 'employee';
}

export interface Comment {
    id: number;
    authorId: number;
    text: string;
    timestamp: string;
}

export interface ActionItem {
    id: number;
    task: string;
    department: Department;
    dueDate: string;
    completed: boolean;
    completionDate: string | null;
    assigneeId?: number; // Optional: ID of the employee assigned to the task
    comments: Comment[];
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

export interface Request {
    id: number;
    employeeId: number;
    type: 'financial' | 'leave_hourly' | 'leave_daily';
    value: string; // Amount for financial, Hours for hourly, Date for daily
    requestDate: string;
    status: 'approved' | 'rejected';
    reason: string; // Explanation for the decision
    performanceRateAtTime: number; // The logic score at the time of request
}

export interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
}
