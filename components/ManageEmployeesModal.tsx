import React from 'react';
import type { Employee, Department } from '../types';

interface ManageEmployeesModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    onUpdateEmployee: (employee: Employee) => void;
    departments: Department[];
    loggedInUserId: number;
}

export const ManageEmployeesModal: React.FC<ManageEmployeesModalProps> = ({
    isOpen,
    onClose,
    employees,
    onUpdateEmployee,
    departments,
    loggedInUserId
}) => {
    
    const handleEmployeeUpdate = (employeeId: number, field: 'department' | 'role', value: string) => {
        const employeeToUpdate = employees.find(emp => emp.id === employeeId);
        if (employeeToUpdate) {
            onUpdateEmployee({ ...employeeToUpdate, [field]: value });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">مدیریت کارمندان</h2>
                    
                    {/* List of employees */}
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {employees.length > 0 ? employees.map(emp => (
                            <div key={emp.id} className="grid grid-cols-3 items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <div className="col-span-1 flex items-center gap-3">
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                            {emp.email}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-span-1">
                                     <select 
                                        value={emp.department || ''} 
                                        onChange={(e) => handleEmployeeUpdate(emp.id, 'department', e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                        aria-label={`دپارتمان برای ${emp.name}`}
                                    >
                                        <option value="" disabled>انتخاب دپارتمان</option>
                                        {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                                    </select>
                                </div>
                                 <div className="col-span-1">
                                     <select 
                                        value={emp.role}
                                        onChange={(e) => handleEmployeeUpdate(emp.id, 'role', e.target.value)}
                                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                                        aria-label={`نقش برای ${emp.name}`}
                                        disabled={emp.id === loggedInUserId} // Manager can't demote themselves
                                    >
                                        <option value="manager">مدیر</option>
                                        <option value="employee">کارمند</option>
                                    </select>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                                <p>هیچ کارمندی برای نمایش وجود ندارد.</p>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">بستن</button>
                </div>
            </div>
        </div>
    );
};
