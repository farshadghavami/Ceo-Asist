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
                <section id="hero" className="relative max-w-7xl mx-auto px-4 pt-20 pb-24 md:pt-28 md:pb-32 text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-400/20 dark:bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
                            جلسات خود را به نتایج عملی تبدیل کنید
                        </span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        با 1001، به طور خودکار از جلسات صوتی خود خلاصه، وظایف و اقدامات کلیدی استخراج کرده و بهره‌وری تیم خود را به سطح جدیدی برسانید.
                    </p>
                    <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <button 
                            onClick={onSignUpClick}
                            className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            ۷ روز استفاده رایگان از پلن حرفه‌ای
                        </button>
                         <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">بدون نیاز به کارت اعتباری</p>
                    </div>
                    <div className="mt-20 animate-fade-in" style={{ animationDelay: '400ms' }}>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">مورد اعتماد برترین شرکت‌ها</p>
                        <div className="flex justify-center items-center gap-8 opacity-60">
                            <i className="fa-brands fa-microsoft text-3xl"></i>
                            <i className="fa-brands fa-google text-3xl"></i>
                            <i className="fa-brands fa-spotify text-3xl"></i>
                            <i className="fa-brands fa-slack text-3xl"></i>
                            <i className="fa-brands fa-airbnb text-3xl"></i>
                        </div>
                    </div>
                </section>

                {/* App Preview Section */}
                <section className="px-4 animate-fade-in" style={{ animationDelay: '500ms' }}>
                    <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 border border-slate-200 dark:border-slate-700 transform -rotate-1">
                        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden aspect-video p-4 md:p-6 flex gap-4 md:gap-6 items-stretch">
                            <div className="w-1/3 bg-white dark:bg-slate-800 rounded-lg p-4 flex flex-col gap-4 shadow-sm">
                                <div className="h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-md flex items-center p-2">
                                    <div className="w-4 h-4 bg-indigo-300 dark:bg-indigo-700 rounded-full"></div>
                                    <div className="w-1/2 h-3 bg-indigo-300 dark:bg-indigo-700 rounded-full ml-2"></div>
                                </div>
                                <div className="flex-grow space-y-2">
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2"></div>
                                </div>
                                <div className="h-10 bg-indigo-500 rounded-lg"></div>
                            </div>
                            <div className="w-2/3 bg-white dark:bg-slate-800 rounded-lg p-4 flex flex-col gap-4 shadow-sm">
                                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                                <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-md flex-grow"></div>
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