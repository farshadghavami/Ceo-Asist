import React, { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { EmployeeTaskList } from '../components/EmployeeTaskList';
import type { Employee, ActionItem } from '../types';
import type { BusinessData } from '../App';

interface EmployeeDashboardProps {
    user: Employee;
    businessData: BusinessData;
    onLogout: () => void;
    onBusinessDataUpdate: (data: BusinessData) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, businessData, onLogout, onBusinessDataUpdate }) => {
    
    const myActionItems = useMemo(() => {
        return businessData.actionItems.filter(item => item.assigneeId === user.id);
    }, [businessData.actionItems, user.id]);

    const handleToggleCompletion = (id: number) => {
        const newActionItems = businessData.actionItems.map(item =>
            item.id === id
                ? { ...item, completed: !item.completed, completionDate: !item.completed ? new Date().toISOString().split('T')[0] : null }
                : item
        );
        onBusinessDataUpdate({...businessData, actionItems: newActionItems });
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans-fa">
            <Header
                user={user}
                onLogout={onLogout}
                businessName={businessData.businessName}
                notifications={[]} // Employees don't see notifications in this simplified view
                onMarkAsRead={() => {}}
                onNotificationClick={() => {}}
            />
            <main className="p-4 md:p-8 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                    <h1 className="text-2xl font-bold mb-2">سلام، {user.name}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">اینجا لیست وظایف محول شده به شما آمده است. موفق باشید!</p>
                    <EmployeeTaskList
                        actionItems={myActionItems}
                        onToggleCompletion={handleToggleCompletion}
                        employees={businessData.employees}
                    />
                </div>
            </main>
        </div>
    );
};
