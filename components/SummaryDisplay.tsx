
import React, { useState, useRef, useEffect } from 'react';
import type { TranscriptSegment } from '../types';

interface SummaryDisplayProps {
    summary: string;
    transcriptSegments: TranscriptSegment[]; 
    rawTranscript?: string;
    isLoading: boolean;
    className?: string;
    style?: React.CSSProperties;
    audioUrl?: string | null; 
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, transcriptSegments, rawTranscript, isLoading, className, style, audioUrl }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const transcriptRef = useRef<HTMLDivElement>(null);
    const activeSegmentRef = useRef<HTMLDivElement>(null);

    const [hasSwitched, setHasSwitched] = useState(false);
    useEffect(() => {
        if (!hasSwitched && !summary && (transcriptSegments.length > 0 || (rawTranscript && rawTranscript.length > 10))) {
            setActiveTab('transcript');
            setHasSwitched(true);
        }
    }, [summary, transcriptSegments, rawTranscript, hasSwitched]);

    useEffect(() => {
        if (activeTab === 'transcript' && activeSegmentRef.current && transcriptRef.current) {
            activeSegmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentTime, activeTab]);

    const handleSegmentClick = (start: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = start;
            audioRef.current.play();
        }
    };
    
    return (
        <div className={`bg-white dark:bg-slate-800 p-6 lg:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 transition-all flex flex-col ${className}`} style={style}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 flex-shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <i className={`fa-solid ${activeTab === 'summary' ? 'fa-file-lines' : 'fa-align-left'}`}></i>
                        </div>
                        {activeTab === 'summary' ? 'خلاصه جلسه' : 'متن کامل'}
                    </h2>
                </div>
                
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl w-full sm:w-auto">
                    <button 
                        onClick={() => setActiveTab('summary')}
                        className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'summary' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        خلاصه
                    </button>
                    <button 
                        onClick={() => setActiveTab('transcript')}
                        className={`px-6 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'transcript' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
                    >
                        متن
                    </button>
                </div>
            </div>

            {audioUrl && (
                <div className="mb-8 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 flex-shrink-0">
                    <audio 
                        ref={audioRef} 
                        src={audioUrl} 
                        controls 
                        className="w-full h-10 accent-indigo-600" 
                        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                    />
                </div>
            )}

            {isLoading && !summary && transcriptSegments.length === 0 ? (
                <div className="space-y-4 animate-pulse flex-1">
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-full"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-5/6"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-4/6"></div>
                    <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-full mt-10"></div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" ref={transcriptRef}>
                    {activeTab === 'summary' ? (
                        <div className="text-slate-700 dark:text-slate-300 leading-[1.8] whitespace-pre-wrap text-lg font-medium h-full">
                            {summary || (isLoading ? 'در حال نگارش خلاصه هوشمند...' : 'خلاصه‌ای در دسترس نیست.')}
                        </div>
                    ) : (
                        <div className="space-y-3">
                             {transcriptSegments.length > 0 ? (
                                transcriptSegments.map((segment, index) => {
                                    const isActive = currentTime >= segment.start && currentTime < segment.end;
                                    return (
                                        <div 
                                            key={index}
                                            ref={isActive ? activeSegmentRef : null}
                                            onClick={() => handleSegmentClick(segment.start)}
                                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                                isActive 
                                                    ? 'bg-indigo-50/50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 shadow-sm scale-[1.01]' 
                                                    : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <p className={`text-base leading-relaxed flex gap-4 ${isActive ? 'text-indigo-900 dark:text-indigo-100 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                                                <span className="text-xs font-mono opacity-50 flex-shrink-0 pt-1">
                                                    {Math.floor(segment.start / 60)}:{(segment.start % 60).toString().padStart(2, '0')}
                                                </span>
                                                <span>{segment.text}</span>
                                            </p>
                                        </div>
                                    );
                                })
                             ) : rawTranscript ? (
                                <div className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap text-base">
                                    {rawTranscript}
                                </div>
                             ) : (
                                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400">
                                    <i className="fa-solid fa-microphone-lines text-5xl mb-6 opacity-20"></i>
                                    <p className="font-bold">{isLoading ? 'در حال پیاده‌سازی متن...' : 'متنی یافت نشد.'}</p>
                                </div>
                             )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
