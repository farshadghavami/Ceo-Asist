import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const SalesChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        const systemInstruction = `You are a friendly and enthusiastic sales assistant for a product called '1001'. Your goal is to answer user questions about the product and encourage them to sign up. You must speak in Persian.

        Here is the product information you need:
        
        **Product Name:** 1001
        
        **Core Function:** Turns audio meetings into executive summaries and actionable tasks.
        
        **Key Features:**
        - **Audio Analysis:** Users can upload or record audio files.
        - **AI Summaries:** Generates concise executive summaries of meetings.
        - **Action Item Dashboard:** Automatically extracts tasks, which can be assigned to team members and departments with due dates.
        - **Team Management:** Users can define their business, departments, and team members for a personalized experience.
        
        **Pricing Plans:**
        1.  **Personal (رایگان):**
            - 3 audio analyses per month.
            - 10-minute file limit.
            - 1 user.
            - Perfect for individuals and freelancers.
        2.  **Professional (حرفه‌ای - 990,000 تومان per user/month):**
            - 30 audio analyses per month.
            - 60-minute file limit.
            - Up to 5 users.
            - Includes performance analytics dashboard and smart reminders.
            - This is the most popular plan.
        3.  **Enterprise (سازمانی - Custom Pricing):**
            - Unlimited analyses and users.
            - Advanced security (SSO).
            - Custom integrations.
            - 24/7 dedicated support.
        
        When the chat starts, greet the user warmly and introduce yourself as the sales assistant for 1001. Ask how you can help them. Keep your answers helpful, concise, and friendly. Always try to guide the conversation towards the benefits of the product and how it can solve their problems.`;

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: systemInstruction,
            },
        });
        setChat(newChat);
        setMessages([{
            role: 'model',
            text: 'سلام! 👋 من مشاور فروش هوشمند ۱۰۰۱ هستم. سوالی در مورد امکانات یا پلن‌های ما دارید؟ خوشحال میشم کمکتون کنم!'
        }]);

    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || !chat || isTyping) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        
        try {
            const result = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: '' }]);

            for await (const chunk of result) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید." }]);
        } finally {
            setIsTyping(false);
        }
    };
    
    return (
        <>
            <div className={`fixed bottom-24 left-6 w-full max-w-sm h-[60vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-[90] ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                 <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-headset text-indigo-500"></i>
                        <span>مشاور فروش</span>
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <i className="fa-solid fa-times text-slate-600 dark:text-slate-300"></i>
                    </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-solid fa-headset text-white"></i>
                                </div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                 <i className="fa-solid fa-headset text-white"></i>
                             </div>
                             <div className="max-w-[80%] p-3 rounded-2xl bg-slate-200 dark:bg-slate-700">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="پیام خود را تایپ کنید..."
                            className="w-full p-3 pl-12 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-shadow"
                            disabled={isTyping}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center transition-all hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            aria-label="ارسال پیام"
                        >
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={() => setIsOpen(prev => !prev)}
                className="fixed bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full text-white shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
                aria-label="تماس با فروش"
                title="تماس با فروش"
            >
                {isOpen ? 
                    <i className="fa-solid fa-times text-2xl"></i> : 
                    <i className="fa-solid fa-headset text-2xl"></i>
                }
            </button>
        </>
    );
};