import React, { useState } from 'react';
import type { Employee } from '../types';

interface AuthPageProps {
    mode: 'login' | 'signup';
    onAuthSuccess: (user: Partial<Employee>, isNewUser: boolean) => void;
    onSwitchMode: () => void;
    onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuthSuccess, onSwitchMode, onBack }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [selectedRole, setSelectedRole] = useState<'manager' | 'employee'>('employee');
    
    const isLogin = mode === 'login';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || (!isLogin && !name)) {
            setError('لطفا تمام فیلدها را پر کنید.');
            return;
        }
        setError('');
        
        if (isLogin) {
            const storedData = localStorage.getItem('1001-business-data');
            if (storedData) {
                const businessData = JSON.parse(storedData);
                const user = businessData.employees.find((emp: Employee) => 
                    emp.email === email && 
                    emp.password === password &&
                    emp.role === selectedRole
                );
                if (user) {
                    onAuthSuccess(user, false);
                } else {
                    setError('ایمیل، رمز عبور یا نقش انتخاب شده اشتباه است.');
                }
            } else {
                setError('هیچ کسب و کاری یافت نشد. لطفا ابتدا ثبت نام کنید.');
            }
        } else {
            // In a real app, you'd check if the email is already taken.
            // For this mock, we assume signup overwrites any existing data.
            localStorage.removeItem('1001-business-data');
            localStorage.removeItem('1001-logged-in-email');
            onAuthSuccess({ name, email, password }, true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center p-4 relative font-sans-fa">
            <div className="aurora-bg"></div>
            <button onClick={onBack} className="absolute top-6 left-6 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 z-20 transition-colors">
                <i className="fa-solid fa-arrow-left text-xl"></i>
                <span className="sr-only">بازگشت به صفحه اصلی</span>
            </button>
            <div className="w-full max-w-md bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg rounded-2xl shadow-xl p-8 z-10 animate-fade-in-slide-up">
                <div className="text-center mb-6">
                    <div className="inline-block w-12 h-12 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg mb-3">
                        <span className="font-black text-white text-2xl tracking-tighter">1001</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {isLogin ? 'ورود به حساب کاربری' : 'ایجاد کسب و کار جدید'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                     {isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 text-center">ورود به عنوان:</label>
                            <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1 transition-colors">
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('employee')}
                                    className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${selectedRole === 'employee' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <i className="fa-solid fa-user"></i>
                                    <span>کارمند</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedRole('manager')}
                                    className={`w-1/2 py-2 rounded-md text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${selectedRole === 'manager' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    <i className="fa-solid fa-user-tie"></i>
                                    <span>مدیر</span>
                                </button>
                            </div>
                        </div>
                    )}
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">نام شما (مدیر)</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                                placeholder="نام خود را وارد کنید"
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">ایمیل</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">رمز عبور</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg">
                        {isLogin ? 'ورود' : 'ثبت نام و ساخت کسب و کار'}
                    </button>
                </form>
                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                    {isLogin ? 'کسب و کار جدید دارید؟' : 'قبلا ثبت نام کرده‌اید؟'}
                    <button onClick={onSwitchMode} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mr-1">
                        {isLogin ? 'ثبت نام کنید' : 'وارد شوید'}
                    </button>
                </p>
            </div>
        </div>
    );
};
