import React, { useState, FormEvent } from 'react';
import type { Employee, Department } from '../types';
import { DEPARTMENTS as SUGGESTED_DEPARTMENTS, getDepartmentConfig } from '../constants';

type OnboardingEmployee = Omit<Employee, 'id' | 'role'>;

interface OnboardingData {
    businessName: string;
    departments: Department[];
    employees: OnboardingEmployee[];
}

interface OnboardingPageProps {
    user: { name: string, email: string };
    onOnboardingComplete: (data: OnboardingData) => void;
}

const ProgressIndicator: React.FC<{ currentStep: number; totalSteps: number; }> = ({ currentStep, totalSteps }) => {
    return (
        <div className="flex justify-center items-center gap-4 mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;
                return (
                    <React.Fragment key={step}>
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                {isCompleted ? <i className="fa-solid fa-check"></i> : step.toLocaleString('fa-IR')}
                            </div>
                        </div>
                        {step < totalSteps && <div className={`h-1 w-16 transition-all duration-300 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ user, onOnboardingComplete }) => {
    const [step, setStep] = useState(1);
    const [businessName, setBusinessName] = useState('');
    const [departments, setDepartments] = useState<Department[]>([...SUGGESTED_DEPARTMENTS]);
    const [newDepartment, setNewDepartment] = useState('');
    const [employees, setEmployees] = useState<OnboardingEmployee[]>([]);
    const [newEmployee, setNewEmployee] = useState({ name: '', email: '', phone: '', department: departments[0] || '' });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleAddDepartment = () => {
        if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
            setDepartments([...departments, newDepartment.trim()]);
            setNewDepartment('');
        }
    };
    const handleRemoveDepartment = (depToRemove: Department) => {
        setDepartments(departments.filter(d => d !== depToRemove));
    };

    const handleAddEmployee = (e: FormEvent) => {
        e.preventDefault();
        if (newEmployee.name.trim() && newEmployee.email.trim() && newEmployee.phone.trim()) {
            setEmployees([...employees, { ...newEmployee, avatarUrl: `https://i.pravatar.cc/150?u=${newEmployee.email}`, password: 'password' }]); // Add default password
            setNewEmployee({ name: '', email: '', phone: '', department: departments[0] || '' });
        }
    };
    
    const handleRemoveEmployee = (empToRemove: OnboardingEmployee) => {
        setEmployees(employees.filter(e => e.email !== empToRemove.email));
    };
    
    const handleFinish = () => {
        onOnboardingComplete({
            businessName,
            departments,
            employees
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center">به ۱۰۰۱ خوش آمدید، {user.name}!</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-center mt-2 mb-8">بیایید با تنظیم کسب و کارتان شروع کنیم.</p>
                        <label htmlFor="businessName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">نام کسب و کار شما</label>
                        <input
                            id="businessName"
                            type="text"
                            value={businessName}
                            onChange={e => setBusinessName(e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                            placeholder="مثال: شرکت نوآوران فردا"
                        />
                        <button onClick={handleNext} disabled={!businessName.trim()} className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed">
                            ادامه
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center">دپارتمان‌های خود را تعریف کنید</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-center mt-2 mb-8">می‌توانید موارد پیش‌فرض را حذف کرده یا موارد جدید اضافه کنید.</p>
                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                             {departments.map(dep => (
                                <div key={dep} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dep}</span>
                                    <button onClick={() => handleRemoveDepartment(dep)} className="p-1 w-6 h-6 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                             ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newDepartment}
                                onChange={e => setNewDepartment(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddDepartment()}
                                className="flex-grow p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                placeholder="نام دپارتمان جدید..."
                            />
                            <button onClick={handleAddDepartment} className="bg-indigo-500 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-600 transition-colors">
                                افزودن
                            </button>
                        </div>
                         <div className="flex gap-4 mt-8">
                            <button onClick={handleBack} className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                                بازگشت
                            </button>
                            <button onClick={handleNext} disabled={departments.length === 0} className="w-full bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:bg-slate-400 disabled:cursor-not-allowed">
                                ادامه
                            </button>
                        </div>
                    </div>
                );
            case 3:
                 return (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center">اعضای تیم خود را اضافه کنید</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-center mt-2 mb-8">بعداً می‌توانید وظایف را به این افراد تخصیص دهید.</p>
                         <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                             {employees.map(emp => {
                                const deptConfig = getDepartmentConfig(emp.department!);
                                return (
                                <div key={emp.email} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-slate-200">{emp.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                             {emp.email} • <span className="font-medium" style={{ color: deptConfig.colorHex }}>{emp.department}</span>
                                        </p>
                                    </div>
                                    <button onClick={() => handleRemoveEmployee(emp)} className="p-1 w-6 h-6 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                             )})}
                        </div>
                        <form onSubmit={handleAddEmployee} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input type="text" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="نام کارمند" required/>
                                <input type="email" value={newEmployee.email} onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="ایمیل کارمند" required/>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <input type="tel" value={newEmployee.phone} onChange={e => setNewEmployee({ ...newEmployee, phone: e.target.value })} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" placeholder="شماره تماس" required/>
                                <select value={newEmployee.department} onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value as Department })} className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white" required>
                                    {departments.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-600 transition-colors">
                                افزودن کارمند
                            </button>
                        </form>
                         <div className="flex gap-4 mt-8">
                            <button onClick={handleBack} className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">
                                بازگشت
                            </button>
                            <button onClick={handleFinish} className="w-full bg-emerald-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg">
                                تکمیل و ورود به داشبورد
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 relative font-sans-fa">
            <div className="aurora-bg"></div>
            <div className="w-full max-w-lg z-10">
                <ProgressIndicator currentStep={step} totalSteps={3} />
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 animate-fade-in-slide-up">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};