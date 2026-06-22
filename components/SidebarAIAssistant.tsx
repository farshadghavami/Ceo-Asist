
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { ActionItem, Employee } from '../types';

interface SidebarAIAssistantProps {
    user: Employee;
    actionItems: ActionItem[];
    employees: Employee[];
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const QUICK_PROMPTS = [
    "وضعیت تاخیرها",
    "خلاصه کارهای امروز",
    "عملکرد تیم",
    "پیشنهاد مدیریتی"
];

export const SidebarAIAssistant: React.FC<SidebarAIAssistantProps> = ({ user, actionItems, employees }) => {
    const [chat, setChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        const contextData = `
        Current Manager: ${user.name}
        Total Action Items: ${actionItems.length}
        Overdue Items: ${actionItems.filter(i => !i.completed && new Date(i.dueDate) < new Date()).length}
        Completed Items: ${actionItems.filter(i => i.completed).length}
        Employees: ${employees.map(e => e.name).join(', ')}
        Action Items List: ${JSON.stringify(actionItems.map(i => ({ task: i.task, assignee: employees.find(e => e.id === i.assigneeId)?.name, due: i.dueDate, status: i.completed ? 'Done' : 'Pending' })))}
        `;

        const systemInstruction = `You are a concise business assistant located in a sidebar. 
        You speak Persian. 
        Keep answers very short and brief (max 2-3 sentences) because space is limited.
        Use emojis.
        
        Context:
        ${contextData}
        `;

        const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });
        setChat(newChat);
        setMessages([{ role: 'model', text: 'سلام! چطور میتونم کمکت کنم؟ 👋' }]);
    }, [actionItems, employees, user.name]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim() || !chat || isTyping) return;

        const userMsg: Message = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const result = await chat.sendMessageStream({ message: textToSend });
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
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'model', text: 'خطا در ارتباط ❌' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-3 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                    <i className="fa-solid fa-wand-magic-sparkles text-white text-xs"></i>
                </div>
                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-200">دستیار هوشمند</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-2 rounded-lg text-xs leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-bl-none shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-lg rounded-bl-none border border-slate-200 dark:border-slate-600 shadow-sm">
                            <div className="typing-indicator scale-75 origin-left">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-2 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                {/* Quick Prompts */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-2 pb-1">
                    {QUICK_PROMPTS.map((prompt, i) => (
                        <button 
                            key={i}
                            onClick={() => handleSend(prompt)}
                            disabled={isTyping}
                            className="flex-shrink-0 px-2 py-1 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 text-[10px] font-medium rounded-md hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors border border-indigo-100 dark:border-slate-600 whitespace-nowrap"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="سوال بپرسید..."
                        className="w-full text-xs p-2 pr-8 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        disabled={isTyping}
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600 rounded-full transition-colors"
                    >
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};
