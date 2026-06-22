
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import type { ActionItem } from '../types';

interface Message {
    role: 'user' | 'model';
    text: string;
}

// --- Speech Recognition Interfaces ---
interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}
interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
}
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

// --- Audio Decoding Helper Functions ---
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

// --- Hooks ---
const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'fa-IR';
        recognition.interimResults = false;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const currentTranscript = event.results[0][0].transcript;
            setTranscript(currentTranscript);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            recognitionRef.current.start();
            setIsListening(true);
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { transcript, isListening, startListening, stopListening, setTranscript };
};

interface EmployeeAIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTask: ActionItem | null;
}

export const EmployeeAIAssistantModal: React.FC<EmployeeAIAssistantModalProps> = ({ isOpen, onClose, selectedTask }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Voice Interaction State
    const { transcript, isListening, startListening, stopListening, setTranscript } = useSpeechRecognition();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const suggestions = selectedTask 
        ? ["مراحل انجام این کار", "پیش‌نویس گزارش وضعیت", "نوشتن ایمیل پیگیری", "چالش‌های احتمالی"]
        : ["وظایف امروز من", "نکاتی برای افزایش تمرکز", "چطور اولویت‌بندی کنم؟", "خلاصه عملکرد"];

    useEffect(() => {
        if (isOpen) {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const taskContext = selectedTask 
                ? `Current Task Context:
                    - Title: "${selectedTask.task}"
                    - Department: ${selectedTask.department}
                    - Due Date: ${selectedTask.dueDate}
                    - Status: ${selectedTask.completed ? 'Completed' : 'Pending'}`
                : "No specific task selected.";

            const systemInstruction = `You are a highly efficient and concise AI assistant for an employee using the '1001' business app. 
            
            ${taskContext}
            
            STRICT RULES FOR RESPONSE:
            1. **BE EXTREMELY CONCISE:** Give short, direct answers. Bullet points are best.
            2. **NO FLUFF:** Do not say "Hello", "Sure", "I can help with that", or "Here is the answer". Just give the answer.
            3. **LANGUAGE:** Speak only in Persian.
            4. **GOAL:** Provide actionable steps or text drafts immediately.
            
            Example:
            User: "Draft an email."
            You: "موضوع: گزارش وضعیت\nمتن: سلام، پروژه طبق برنامه پیش می‌رود." (Do not add "Here is your draft").`;

            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
            });

            setChat(newChat);
            // No initial greeting message to keep it clean, or a very short one.
            setMessages([{ role: 'model', text: selectedTask ? `در مورد «${selectedTask.task}» چه کمکی لازم دارید؟` : 'چه کمکی لازم دارید؟' }]);
        } else {
            setChat(null); 
            setMessages([]); 
            setInput('');
            stopAudio();
        }
    }, [isOpen, selectedTask]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (transcript) {
            setInput(transcript);
            setAutoSpeak(true);
        }
    }, [transcript]);
    
    useEffect(() => {
        if (transcript && !isListening) {
             handleSend(transcript);
             setTranscript('');
        }
    }, [isListening, transcript]);

    const stopAudio = () => {
        if (activeSourceRef.current) {
            try {
                activeSourceRef.current.stop();
            } catch (e) {
                // Ignore error
            }
            activeSourceRef.current = null;
        }
        setIsSpeaking(false);
    };

    const speakMessage = async (text: string) => {
        stopAudio();
        setIsSpeaking(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-preview-tts",
                contents: [{ parts: [{ text: text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: { voiceName: 'Kore' },
                        },
                    },
                },
            });

            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                if (!audioContextRef.current) {
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
                }
                const ctx = audioContextRef.current;
                
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }

                const audioBuffer = await decodeAudioData(
                    decode(base64Audio),
                    ctx,
                    24000,
                    1,
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);
                source.onended = () => setIsSpeaking(false);
                source.start();
                activeSourceRef.current = source;
            } else {
                console.warn("No audio data received from Gemini TTS");
                setIsSpeaking(false);
            }
        } catch (error) {
            console.error("TTS Error:", error);
            setIsSpeaking(false);
        }
    };

    const handleSend = async (manualInput?: string) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim() || !chat || isTyping) return;

        const userMessage: Message = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        stopAudio();
        
        try {
            const result = await chat.sendMessageStream({ message: textToSend });

            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', text: modelResponse }]);

            for await (const chunk of result) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = modelResponse;
                    return newMessages;
                });
            }

            if (autoSpeak) {
                speakMessage(modelResponse);
                setAutoSpeak(false);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                const errorMessage = "خطا در ارتباط.";
                if (newMessages[newMessages.length - 1].role === 'model') {
                     newMessages[newMessages.length - 1].text = errorMessage;
                } else {
                    newMessages.push({ role: 'model', text: errorMessage });
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
                        <i className="fa-solid fa-robot text-indigo-500"></i>
                        <span>دستیار هوش مصنوعی</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        {isSpeaking && (
                             <div className="flex items-center gap-1 mr-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                            </div>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <i className="fa-solid fa-times text-slate-600 dark:text-slate-300"></i>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && (
                                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-solid fa-robot text-white text-sm"></i>
                                </div>
                            )}
                            <div className={`max-w-[85%] p-3 rounded-2xl group relative ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-lg'}`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                {msg.role === 'model' && !isTyping && (
                                    <button 
                                        onClick={() => speakMessage(msg.text)}
                                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="پخش صوتی"
                                    >
                                        <i className="fa-solid fa-volume-high"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                                 <i className="fa-solid fa-robot text-white text-sm"></i>
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
                
                {/* Suggestions Chips */}
                {!isTyping && (
                    <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-slate-100 dark:border-slate-800">
                        {suggestions.map((suggestion, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                className="flex-shrink-0 whitespace-nowrap px-3 py-1.5 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 text-xs font-medium rounded-full border border-indigo-100 dark:border-slate-600 hover:bg-indigo-100 dark:hover:bg-slate-600 transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
                    <div className="relative flex items-center gap-2">
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                isListening 
                                    ? 'bg-red-500 text-white animate-pulse shadow-lg ring-4 ring-red-200 dark:ring-red-900' 
                                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 shadow-sm'
                            }`}
                            title="ورود صوتی"
                        >
                            <i className={`fa-solid ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i>
                        </button>
                        
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="سوال خود را بپرسید..."
                                className="w-full p-2.5 pl-10 border border-slate-300 dark:border-slate-600 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-shadow text-sm"
                                disabled={isTyping || isListening}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center transition-all hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                aria-label="ارسال پیام"
                            >
                                <i className="fa-solid fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </div>
                     {isListening && (
                        <p className="text-center text-[10px] text-indigo-500 mt-1 font-medium animate-pulse">
                            در حال شنیدن...
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
