
import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import type { Department, Employee, ActionItem, UploadHistoryItem, Notification, Request } from './types';
import { INITIAL_EMPLOYEES, INITIAL_ACTION_ITEMS, DEPARTMENTS } from './constants';

export interface BusinessData {
    businessName: string;
    departments: Department[];
    employees: Employee[];
    actionItems: ActionItem[];
    uploadHistory: UploadHistoryItem[];
    requests: Request[]; // Added requests array
}

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'auth' | 'onboarding' | 'app'>('landing');
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [pendingUser, setPendingUser] = useState<{ name: string; email: string; password?: string; } | null>(null);
    const [loggedInUser, setLoggedInUser] = useState<Employee | null>(null);
    const [businessData, setBusinessData] = useState<BusinessData | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        // Check for existing session
        try {
            const storedBusinessData = localStorage.getItem('1001-business-data');
            // const storedUserEmail = localStorage.getItem('1001-logged-in-email'); // Disable auto-login from storage
            
            if (storedBusinessData) {
                const data: BusinessData = JSON.parse(storedBusinessData);
                // Migration: Ensure requests array exists if loading old data
                if (!data.requests) {
                    data.requests = [];
                }
                
                setBusinessData(data);
                
                // Show Landing Page by default
                setView('landing');
                
                /* 
                // Optional: Check for logged in user if we wanted auto-login behavior
                if (storedUserEmail) {
                    const user = data.employees.find(e => e.email === storedUserEmail);
                    if (user) {
                        setLoggedInUser(user);
                        setView('app');
                    } else {
                        localStorage.removeItem('1001-logged-in-email');
                        setView('landing');
                    }
                } else {
                    setView('landing');
                }
                */
            } else {
                // Initialize default data for demo purposes
                const managerUser: Employee = {
                    id: 100,
                    name: 'مدیر سیستم',
                    email: 'admin@1001.com',
                    role: 'manager',
                    phone: '09120000000',
                    avatarUrl: 'https://i.pravatar.cc/150?u=admin'
                };

                const defaultBusinessData: BusinessData = {
                    businessName: 'شرکت پیشگامان',
                    departments: DEPARTMENTS,
                    employees: [managerUser, ...INITIAL_EMPLOYEES],
                    actionItems: INITIAL_ACTION_ITEMS,
                    uploadHistory: [],
                    requests: []
                };
                
                setBusinessData(defaultBusinessData);
                
                // Show Landing Page by default
                setView('landing');
            }
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
            localStorage.clear();
            setView('landing');
        }
        setIsInitializing(false);
    }, []);

    const handleLoginRequest = () => {
        setAuthMode('login');
        setView('auth');
    };
    
    const handleSignupRequest = () => {
        setAuthMode('signup');
        setView('auth');
    };

    const handleAuthSuccess = (userData: Partial<Employee>, isNewUser: boolean) => {
        if (isNewUser) {
            setPendingUser({ name: userData.name!, email: userData.email!, password: userData.password! });
            setView('onboarding');
        } else {
            const storedData = localStorage.getItem('1001-business-data');
            const business: BusinessData = storedData ? JSON.parse(storedData) : (businessData || {
                businessName: 'شرکت پیشگامان',
                departments: DEPARTMENTS,
                employees: INITIAL_EMPLOYEES,
                actionItems: INITIAL_ACTION_ITEMS,
                uploadHistory: [],
                requests: []
            });
            
            // Migration: Ensure requests array exists
            if (business && !business.requests) {
                business.requests = [];
            }

            const user = business?.employees.find(e => e.email === userData.email);

            if (user && business) {
                localStorage.setItem('1001-logged-in-email', user.email);
                // Also save business data if it was the default mock data
                if (!storedData) {
                    localStorage.setItem('1001-business-data', JSON.stringify(business));
                }
                
                setLoggedInUser(user);
                setBusinessData(business);
                setView('app');
            } else {
                alert("اطلاعات ورود نادرست است یا کاربری یافت نشد.");
            }
        }
    };
    
    const handleOnboardingComplete = (data: Omit<BusinessData, 'employees' | 'actionItems' | 'uploadHistory' | 'requests'> & { employees: Omit<Employee, 'id' | 'role'>[] }) => {
        if (!pendingUser) return;
        
        const manager: Employee = {
            id: 100, // Fixed ID for manager
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            phone: 'N/A',
            avatarUrl: `https://i.pravatar.cc/150?u=${pendingUser.email}`,
            role: 'manager',
            department: data.departments.length > 0 ? data.departments[0] : 'عمومی'
        };

        // Create Employees with IDs and Roles
        const employees: Employee[] = [
            manager,
            ...data.employees.map((emp, index) => ({
                ...emp,
                id: 101 + index,
                role: 'employee' as const,
                avatarUrl: `https://i.pravatar.cc/150?u=${emp.email}`,
                password: 'password' // Default password for employees
            }))
        ];

        const finalData: BusinessData = {
            businessName: data.businessName,
            departments: data.departments,
            employees: employees,
            actionItems: [],
            uploadHistory: [],
            requests: []
        };
        
        localStorage.setItem(`1001-business-data`, JSON.stringify(finalData));
        localStorage.setItem('1001-logged-in-email', pendingUser.email);
        
        setBusinessData(finalData);
        setLoggedInUser(manager);
        setView('app');
        setPendingUser(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('1001-logged-in-email');
        setLoggedInUser(null);
        setView('landing');
    };

    const handleBackToLanding = () => {
        setView('landing');
    };
    
    const handleBusinessDataUpdate = (updatedData: BusinessData) => {
        setBusinessData(updatedData);
        localStorage.setItem(`1001-business-data`, JSON.stringify(updatedData));
    }

    if (isInitializing) {
        return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"></div>;
    }
    
    if (view === 'app' && loggedInUser && businessData) {
        if (loggedInUser.role === 'manager') {
            return <ManagerDashboard
                user={loggedInUser}
                businessData={businessData}
                onLogout={handleLogout}
                onBusinessDataUpdate={handleBusinessDataUpdate}
            />;
        } else {
            return <EmployeeDashboard 
                user={loggedInUser}
                businessData={businessData}
                onLogout={handleLogout}
                onBusinessDataUpdate={handleBusinessDataUpdate}
            />
        }
    }

    if (view === 'onboarding' && pendingUser) {
        return <OnboardingPage user={pendingUser} onOnboardingComplete={handleOnboardingComplete} />;
    }

    if (view === 'auth') {
        return <AuthPage 
            mode={authMode} 
            onAuthSuccess={handleAuthSuccess} 
            onSwitchMode={() => setAuthMode(m => m === 'login' ? 'signup' : 'login')} 
            onBack={handleBackToLanding} 
        />;
    }
    
    return <LandingPage onLoginClick={handleLoginRequest} onSignUpClick={handleSignupRequest} />;
};

export default App;
