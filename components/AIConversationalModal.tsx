import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ActionItem, Employee } from '../types';

interface Message {
    role: 'user' | 'model';
    text: string;
}

interface AIConversationalModalProps {
    isOpen: boolean;
    onClose: () => void;
    actionItems: ActionItem[];
    employees: Employee[];
}

export const AIConversationalModal: React.FC<AIConversationalModalProps> = ({ isOpen, onClose, actionItems, employees }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // FIX: Initialize GoogleGenAI with API Key from environment variables.
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const actionItemsContext = actionItems.map(item =>
                `- ${item.task} (Due: ${item.dueDate}, Status: ${item.completed ? 'Completed' : 'Pending'}, Department: ${item.department}, Assignee: ${employees.find(e => e.id === item.assigneeId)?.name || 'None'})`
            ).join('\n');
            const employeesContext = employees.map(emp => `- ${emp.name}`).join('\n');

            const systemInstruction = `You are a helpful business assistant speaking in Persian. You have access to the current list of action items and employees.
            
            Current Action Items:
            ${actionItemsContext}
            
            Current Employees:
            ${employeesContext}
            
            Answer questions based on this data. Be concise and helpful.`;

            // FIX: Create a chat session using ai.chats.create
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: systemInstruction,
                },
            });
            setChat(newChat);
            setMessages([{
                role: 'model',
                text: 'سلام! چطور می‌توانم به شما در مدیریت کسب و کارتان کمک کنم؟ می‌توانید در مورد اقدامات، کارمندان یا هر موضوع دیگری از من بپرسید.'
            }]);
        } else {
            setChat(null);
            setMessages([]);
            setInput('');
        }
    }, [isOpen, actionItems, employees]);

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
            // FIX: Use sendMessageStream for a streaming response.
            const result = await chat.sendMessageStream({ message: input });

            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);

            for await (const chunk of result) {
                // FIX: Access chunk.text to get the streaming text.
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                if (newMessages[newMessages.length - 1].role === 'model') {
                     newMessages[newMessages.length - 1].text = "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید.";
                } else {
                    newMessages.push({ role: 'model', text: "متاسفانه خطایی رخ داد. لطفا دوباره تلاش کنید." });
                }
                return newMessages;
            });
        } finally {
            setIsTyping(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <i className="fa-solid fa-brain text-indigo-500"></i>
                        <span>مشاور هوش مصنوعی</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <i className="fa-solid fa-times text-slate-600 dark:text-slate-300"></i>
                    </button>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-solid fa-brain text-white text-sm"></i>
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
                                 <i className="fa-solid fa-brain text-white text-sm"></i>
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
        </div>
    );
};
