
import React, { useEffect } from 'react';
import { SalesChatbot } from '../components/SalesChatbot';

interface LandingPageProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
}

const FeatureShowcase: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
    reverse?: boolean;
}> = ({ title, description, children, reverse = false }) => (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
        <div className={`lg:order-${reverse ? 'last' : 'first'}`}>
            <h3 className="text-3xl font-bold mb-4 text-slate-800 dark:text-white">{title}</h3>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
        <div>{children}</div>
    </div>
);

const PricingCard: React.FC<{ plan: string; price: string; description: string; features: string[]; popular?: boolean; onSelect: () => void; }> = ({ plan, price, description, features, popular, onSelect }) => (
    <div className={`border rounded-2xl p-8 flex flex-col relative transition-all duration-300 ${popular ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-2xl transform lg:-translate-y-4' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
        {popular && (
            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                محبوب‌ترین
            </div>
        )}
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{plan}</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6 h-10">{description}</p>
        <div className="mb-6">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{price}</span>
            {plan !== 'سازمانی' && <span className="text-slate-500 dark:text-slate-400"> / کاربر / ماه</span>}
        </div>
        <ul className="space-y-4 text-slate-600 dark:text-slate-300 mb-8 flex-grow">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                    <i className="fa-solid fa-check-circle text-emerald-500 mt-1"></i>
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button 
            onClick={onSelect}
            className={`w-full font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white dark:bg-slate-700 text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'}`}
        >
            {plan === 'سازمانی' ? 'تماس با ما' : 'انتخاب پلن'}
        </button>
    </div>
);

const FAQItem: React.FC<{ q: string; a: string; }> = ({ q, a }) => (
    <details className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 group">
        <summary className="font-semibold text-slate-800 dark:text-white cursor-pointer flex justify-between items-center list-none">
            {q}
            <i className="fa-solid fa-chevron-down transition-transform duration-300 group-open:rotate-180"></i>
        </summary>
        <p className="text-slate-600 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            {a}
        </p>
    </details>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onSignUpClick }) => {
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-visible');
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll('.animate-fade-in');
        elements.forEach(el => observer.observe(el));

        return () => elements.forEach(el => observer.unobserve(el));
    }, []);

    const scrollTo = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans-fa transition-colors duration-300 overflow-x-hidden">
            <style>{`
                .animate-fade-in {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }
                .animate-fade-in-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
            
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
                <div className="p-4 md:p-6 max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                            <span className="font-black text-white text-xl tracking-tighter">1001</span>
                        </div>
                        <h1 className="text-xl font-bold hidden sm:block">1001</h1>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 font-semibold text-slate-600 dark:text-slate-300">
                        <button onClick={() => scrollTo('how-it-works')} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">چگونه کار می‌کند؟</button>
                        <button onClick={() => scrollTo('features')} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">امکانات</button>
                        <button onClick={() => scrollTo('pricing')} className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">قیمت‌گذاری</button>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button onClick={onLoginClick} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline hidden sm:block">ورود</button>
                        <button onClick={onSignUpClick} className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">شروع کنید</button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section id="hero" className="relative max-w-7xl mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
                    
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Right Side: Professional Dashboard Visual */}
                        <div className="order-1 animate-fade-in" style={{ animationDelay: '200ms' }}>
                             <div className="relative mx-auto w-full max-w-lg lg:max-w-full">
                                <div className="relative rounded-2xl bg-slate-900/5 dark:bg-slate-100/5 p-2 ring-1 ring-inset ring-slate-900/10 dark:ring-white/10 lg:rounded-3xl lg:p-4 backdrop-blur-sm transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                    <div className="rounded-xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-900/10 dark:ring-white/10 aspect-[4/3] flex relative">
                                        
                                        {/* Dashboard Sidebar (Simulated) */}
                                        <div className="w-16 md:w-20 border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col items-center py-6 gap-6">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-600"></div>
                                            <div className="flex flex-col gap-4 w-full px-4">
                                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full opacity-50"></div>
                                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full opacity-50"></div>
                                                <div className="h-2 w-full bg-indigo-100 dark:bg-indigo-900 rounded-full"></div>
                                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full opacity-50"></div>
                                            </div>
                                        </div>

                                        {/* Dashboard Content */}
                                        <div className="flex-1 p-6 bg-white dark:bg-slate-900 flex flex-col gap-6">
                                            {/* Header */}
                                            <div className="flex justify-between items-center">
                                                <div className="h-4 w-32 bg-slate-800 dark:bg-slate-200 rounded-md"></div>
                                                <div className="flex gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800"></div>
                                                    <div className="h-8 w-8 rounded-full bg-indigo-500"></div>
                                                </div>
                                            </div>

                                            {/* Charts Area */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-slate-800/50 border border-indigo-100 dark:border-slate-700">
                                                    <div className="h-3 w-16 bg-indigo-200 dark:bg-indigo-900 rounded mb-2"></div>
                                                    <div className="h-8 w-12 bg-indigo-500 rounded"></div>
                                                </div>
                                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-slate-800/50 border border-emerald-100 dark:border-slate-700">
                                                    <div className="h-3 w-16 bg-emerald-200 dark:bg-emerald-900 rounded mb-2"></div>
                                                    <div className="h-8 w-12 bg-emerald-500 rounded"></div>
                                                </div>
                                            </div>

                                            {/* List Area */}
                                            <div className="flex-1 rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-3">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                                        <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                        <div className="flex-1"></div>
                                                        <div className="h-5 w-12 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Floating Notification */}
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-bounce">
                                            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                            </div>
                                            <div>
                                                <div className="h-2 w-20 bg-slate-800 dark:bg-slate-200 rounded mb-1"></div>
                                                <div className="h-2 w-12 bg-slate-400 rounded"></div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                {/* Decorative Blur Behind */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-2xl -z-10 rounded-full"></div>
                             </div>
                        </div>

                        {/* Left Side: Text Content */}
                        <div className="order-2 text-right">
                             <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight animate-fade-in text-slate-900 dark:text-white" style={{ animationDelay: '100ms' }}>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-transparent bg-clip-text">
                                    جلسات خود را به نتایج عملی تبدیل کنید
                                </span>
                            </h2>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
                                با 1001، به طور خودکار از جلسات صوتی خود خلاصه، وظایف و اقدامات کلیدی استخراج کرده و بهره‌وری تیم خود را به سطح جدیدی برسانید.
                            </p>
                            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
                                <button 
                                    onClick={onSignUpClick}
                                    className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                >
                                    <span>شروع رایگان</span>
                                    <i className="fa-solid fa-arrow-left"></i>
                                </button>
                                <button 
                                    onClick={() => scrollTo('how-it-works')}
                                    className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-4 px-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300"
                                >
                                    چطور کار می‌کند؟
                                </button>
                            </div>
                            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800 animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">مورد اعتماد تیم‌های پیشرو</p>
                                <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                                    <i className="fa-brands fa-google text-2xl"></i>
                                    <i className="fa-brands fa-microsoft text-2xl"></i>
                                    <i className="fa-brands fa-spotify text-2xl"></i>
                                    <i className="fa-brands fa-slack text-2xl"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* How It Works Section */}
                <section id="how-it-works" className="py-24 md:py-32">
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white animate-fade-in">فقط در ۳ مرحله ساده</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
                                فرآیند پیچیده تحلیل جلسات را به یک تجربه سریع و لذت‌بخش تبدیل کنید.
                            </p>
                        </div>
                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                            <div className="absolute top-12 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                            <div className="relative animate-fade-in" style={{ animationDelay: '200ms' }}>
                                <div className="w-24 h-24 mx-auto rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700 shadow-lg mb-4">
                                    <i className="fa-solid fa-arrow-up-from-bracket text-3xl text-indigo-500"></i>
                                </div>
                                <h3 className="text-xl font-bold mb-2">۱. بارگذاری یا ضبط</h3>
                                <p className="text-slate-500 dark:text-slate-400">فایل صوتی جلسه را آپلود کنید یا مستقیماً در اپلیکیشن ضبط کنید.</p>
                            </div>
                            <div className="relative animate-fade-in" style={{ animationDelay: '300ms' }}>
                                <div className="w-24 h-24 mx-auto rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700 shadow-lg mb-4">
                                    <i className="fa-solid fa-wand-magic-sparkles text-3xl text-purple-500"></i>
                                </div>
                                <h3 className="text-xl font-bold mb-2">۲. تحلیل هوشمند</h3>
                                <p className="text-slate-500 dark:text-slate-400">هوش مصنوعی 1001 محتوای جلسه را پردازش و نکات کلیدی را استخراج می‌کند.</p>
                            </div>
                            <div className="relative animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <div className="w-24 h-24 mx-auto rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700 shadow-lg mb-4">
                                    <i className="fa-solid fa-bullseye text-3xl text-pink-500"></i>
                                </div>
                                <h3 className="text-xl font-bold mb-2">۳. دریافت نتایج</h3>
                                <p className="text-slate-500 dark:text-slate-400">خلاصه مدیریتی و لیست اقدامات قابل پیگیری را فورا دریافت کنید.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="bg-white dark:bg-slate-800 py-24 md:py-32">
                    <div className="max-w-7xl mx-auto px-4 space-y-24">
                        <FeatureShowcase 
                            title="داشبورد اقدامات هوشمند"
                            description="تمام وظایف استخراج شده از جلسات را در یک مکان مشاهده کنید. وظایف را به افراد و دپارتمان‌ها تخصیص دهید، مهلت‌ها را تعیین کرده و پیشرفت را به سادگی پیگیری کنید."
                        >
                           <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in space-y-3">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                                    <i className="fa-solid fa-check-circle text-emerald-500 mt-1"></i>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 dark:text-slate-200 line-through">طراحی کمپین تبلیغاتی</p>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">بازاریابی • ۲۹ تیر ۱۴۰۳</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700 shadow-inner">
                                    <i className="fa-regular fa-circle text-yellow-500 mt-1"></i>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">پیگیری مشتریان بالقوه</p>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">فروش • ۴ مرداد ۱۴۰۳</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700">
                                    <i className="fa-solid fa-exclamation-circle text-red-500 mt-1 animate-pulse"></i>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">رفع باگ گزارش شده</p>
                                        <div className="text-sm text-slate-500 dark:text-slate-400">فنی • ۱ مرداد ۱۴۰۳ (تاخیر دارد)</div>
                                    </div>
                                </div>
                            </div>
                        </FeatureShowcase>
                        <FeatureShowcase 
                            title="خلاصه‌های مدیریتی دقیق"
                            description="دیگر نیازی به یادداشت‌برداری نیست. 1001 خلاصه‌ای دقیق و متمرکز از مهم‌ترین بحث‌ها و تصمیمات جلسه را برای شما آماده می‌کند تا همیشه در جریان باشید."
                            reverse
                        >
                            <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 animate-fade-in">
                                <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                    <i className="fa-solid fa-file-lines text-indigo-500"></i>
                                    خلاصه جلسه ۳ ماهه فروش
                                </h4>
                                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                                    <p>• <span className="font-semibold">عملکرد فروش:</span> تیم فروش در ۳ ماهه گذشته به ۹۵٪ از هدف تعیین شده دست یافت که یک موفقیت بزرگ محسوب می‌شود.</p>
                                    <p>• <span className="font-semibold">چالش اصلی:</span> طولانی شدن چرخه فروش برای مشتریان بزرگ به عنوان چالش اصلی شناسایی شد.</p>
                                    <p>• <span className="font-semibold">تصمیم کلیدی:</span> مقرر شد تا یک برنامه آموزشی جدید برای تیم فروش در زمینه مذاکرات پیچیده برگزار شود.</p>
                                </div>
                            </div>
                        </FeatureShowcase>
                    </div>
                </section>
                
                {/* Pricing Section */}
                <section id="pricing" className="py-24 md:py-32">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white animate-fade-in">پلن‌های متناسب با نیاز شما</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
                                با پلن رایگان شروع کنید و هر زمان که تیم شما رشد کرد، به سادگی ارتقا دهید.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                                <PricingCard
                                    plan="شخصی"
                                    price="رایگان"
                                    description="برای افراد و فریلنسرها جهت شروع کار"
                                    features={[
                                        '۳ تحلیل صوتی در ماه',
                                        'حداکثر ۱۰ دقیقه برای هر فایل',
                                        '۱ کاربر',
                                        'پشتیبانی از طریق ایمیل'
                                    ]}
                                    onSelect={onSignUpClick}
                                />
                            </div>
                             <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                                <PricingCard
                                    plan="حرفه‌ای"
                                    price="۹۹۰,۰۰۰"
                                    description="برای تیم‌ها و کسب‌وکارهای در حال رشد"
                                    features={[
                                        '۳۰ تحلیل صوتی در ماه',
                                        'حداکثر ۶۰ دقیقه برای هر فایل',
                                        'تا ۵ کاربر در تیم',
                                        'داشبورد تحلیلی عملکرد',
                                        'ارسال یادآوری هوشمند',
                                        'پشتیبانی ویژه'
                                    ]}
                                    popular
                                    onSelect={onSignUpClick}
                                />
                             </div>
                              <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
                                <PricingCard
                                    plan="سازمانی"
                                    price="تماس"
                                    description="برای شرکت‌های بزرگ با نیازهای خاص"
                                    features={[
                                        'تحلیل صوتی نامحدود',
                                        'کاربران نامحدود',
                                        'امنیت پیشرفته (SSO)',
                                        'یکپارچه‌سازی سفارشی',
                                        'پشتیبانی اختصاصی ۲۴/۷'
                                    ]}
                                    onSelect={() => alert('برای اطلاعات بیشتر با ایمیل sales@1001.com تماس بگیرید.')}
                                />
                             </div>
                        </div>
                    </div>
                </section>
                
                {/* FAQ Section */}
                <section id="faq" className="bg-white dark:bg-slate-800 py-24 md:py-32">
                    <div className="max-w-3xl mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white animate-fade-in">سوالات متداول</h2>
                        </div>
                        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
                            <FAQItem q="آیا داده‌های من امن هستند؟" a="بله، ما از به‌روزترین استانداردهای امنیتی و رمزنگاری برای حفاظت از داده‌های شما استفاده می‌کنیم. حریم خصوصی شما اولویت اصلی ماست." />
                            <FAQItem q="آیا می‌توانم اشتراک خود را لغو کنم؟" a="البته! شما می‌توانید در هر زمان و بدون هیچ سوالی اشتراک خود را از طریق پنل کاربری لغو کنید." />
                            <FAQItem q="چه فرمت‌های صوتی پشتیبانی می‌شوند؟" a="1001 از اکثر فرمت‌های صوتی رایج مانند MP3, WAV, M4A و WEBM پشتیبانی می‌کند." />
                            <FAQItem q="آیا می‌توانم پلن خود را بعداً تغییر دهم؟" a="بله، شما به راحتی می‌توانید هر زمان که نیاز داشتید پلن خود را ارتقا یا کاهش دهید تا کاملاً با نیازهای کسب‌وکار شما هماهنگ باشد." />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="text-center p-8 border-t border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <p>&copy; {new Date().getFullYear()} 1001. تمام حقوق محفوظ است.</p>
            </footer>
             
            <SalesChatbot />
        </div>
    );
};
