import React, { useState, useEffect } from 'react';
import type { Employee } from '../types';

interface ManageEmployeesModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    onAddEmployee: (employee: Omit<Employee, 'id'>) => void;
    onUpdateEmployee: (employee: Employee) => void;
    onDeleteEmployee: (employeeId: number) => void;
}

export const ManageEmployeesModal: React.FC<ManageEmployeesModalProps> = ({
    isOpen,
    onClose,
    employees,
    onAddEmployee,
    onUpdateEmployee,
    onDeleteEmployee
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        if (editingEmployee) {
            setName(editingEmployee.name);
            setPhone(editingEmployee.phone);
            setAvatarUrl(editingEmployee.avatarUrl);
        } else {
            setName('');
            setPhone('');
            setAvatarUrl('');
        }
    }, [editingEmployee]);
    
    useEffect(() => {
        // Reset form when modal is closed
        if (!isOpen) {
            setEditingEmployee(null);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone) {
            alert('نام و شماره تلفن الزامی هستند.');
            return;
        }

        const employeeData = { name, phone, avatarUrl: avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}` };

        if (editingEmployee) {
            onUpdateEmployee({ ...employeeData, id: editingEmployee.id });
        } else {
            onAddEmployee(employeeData);
        }
        setEditingEmployee(null);
    };

    const handleCancelEdit = () => {
        setEditingEmployee(null);
    };
    
    const handleDelete = (id: number) => {
        if(window.confirm('آیا از حذف این کارمند مطمئن هستید؟ اقدامات تخصیص داده شده به او بدون مسئول خواهند شد.')) {
            onDeleteEmployee(id);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">مدیریت کارمندان</h2>
                    
                    {/* Form for adding/editing */}
                    <form onSubmit={handleSubmit} className="p-4 mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-4">
                         <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{editingEmployee ? 'ویرایش کارمند' : 'افزودن کارمند جدید'}</h3>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="نام" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required />
                            <input type="tel" placeholder="شماره تلفن (با کد کشور)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" required />
                            <input type="url" placeholder="URL آواتار (اختیاری)" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white" />
                         </div>
                         <div className="flex justify-end gap-2">
                            {editingEmployee && <button type="button" onClick={handleCancelEdit} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">لغو ویرایش</button>}
                            <button type="submit" className="py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">{editingEmployee ? 'ذخیره تغییرات' : 'افزودن کارمند'}</button>
                         </div>
                    </form>

                    {/* List of employees */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {employees.map(emp => (
                            <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400" dir="ltr">{emp.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingEmployee(emp)} className="p-2 w-10 h-10 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600 transition-colors" title="ویرایش">
                                        <i className="fa-solid fa-pencil"></i>
                                    </button>
                                    <button onClick={() => handleDelete(emp.id)} className="p-2 w-10 h-10 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="حذف">
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end">
                    <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">بستن</button>
                </div>
            </div>
        </div>
    );
};