import React, { useState, useRef, useCallback } from 'react';

interface MeetingInputProps {
    onFileUpload: (file: File) => void;
    isLoading: boolean;
    isUploading: boolean;
    uploadProgress: number;
    className?: string;
    style?: React.CSSProperties;
}

export const MeetingInput: React.FC<MeetingInputProps> = ({ onFileUpload, isLoading, isUploading, uploadProgress, className, style }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
                    onFileUpload(audioFile);
                    audioChunksRef.current = [];
                    stream.getTracks().forEach(track => track.stop());
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("دسترسی به میکروفون امکان‌پذیر نیست. لطفا مجوز لازم را بدهید.");
            }
        }
    };
    
    return (
        <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-300 ${className}`} style={style}>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">تحلیل جلسه</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">فایل صوتی جلسه را آپلود کنید یا یک جلسه جدید ضبط کنید تا خلاصه‌ و اقدامات آن استخراج شود.</p>

            {isLoading ? (
                 <div className="mt-8 mb-4 text-center transition-opacity duration-300">
                    <div className="relative h-20 w-20 mx-auto mb-4">
                        <svg className="absolute inset-0" viewBox="0 0 36 36">
                            <path className="text-slate-200 dark:text-slate-700" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path 
                                className="text-indigo-600 transition-all duration-300" 
                                strokeWidth="3" 
                                strokeDasharray={`${uploadProgress}, 100`} 
                                strokeLinecap="round" 
                                stroke="currentColor" 
                                fill="none" 
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            {isUploading ? `${Math.round(uploadProgress)}%` : <i className="fa-solid fa-brain fa-spin"></i>}
                        </div>
                    </div>
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                        {isUploading ? 'در حال آپلود فایل...' : 'در حال تحلیل هوشمند...'}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">این فرآیند ممکن است چند لحظه طول بکشد.</p>
                </div>
            ) : (
                <>
                    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="relative w-full text-center">
                        <input ref={inputRef} type="file" id="input-file-upload" accept="audio/*" multiple={false} onChange={handleChange} className="hidden" />
                        <label 
                            id="label-file-upload" 
                            htmlFor="input-file-upload" 
                            className={`h-48 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 relative z-10 ${dragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/50 aurora-bg" : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-700/50"}`}
                        >
                            <div className="relative z-10">
                                <i className={`fa-solid fa-cloud-arrow-up text-4xl mb-3 transition-colors ${dragActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}></i>
                                <p className="text-slate-500 dark:text-slate-400">فایل صوتی را بکشید و رها کنید</p>
                                <p className="text-sm text-slate-400 dark:text-slate-500">یا</p>
                                <button type="button" onClick={onButtonClick} className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-1">
                                    فایل خود را انتخاب کنید
                                </button>
                            </div>
                            {dragActive && <div className="aurora-bg"></div>}
                        </label>
                        {dragActive && <div className="absolute w-full h-full top-0 right-0" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
                    </form>

                    <div className="mt-6 flex items-center justify-center">
                        <span className="h-px bg-slate-300 dark:bg-slate-600 w-full"></span>
                        <span className="mx-4 text-slate-500 dark:text-slate-400 text-sm">یا</span>
                        <span className="h-px bg-slate-300 dark:bg-slate-600 w-full"></span>
                    </div>

                    <button
                        onClick={toggleRecording}
                        disabled={isLoading}
                        className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl ${
                            isRecording 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        } disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none`}
                    >
                        {isRecording ? (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                                <span>توقف ضبط</span>
                            </>
                        ) : (
                            <>
                            <i className="fa-solid fa-microphone"></i>
                                <span>شروع ضبط جدید</span>
                            </>
                        )}
                    </button>
                </>
            )}
        </div>
    );
};