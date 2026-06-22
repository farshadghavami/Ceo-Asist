
import React, { useState, useRef, useCallback, useEffect } from 'react';

interface MeetingInputProps {
    onFileUpload: (file: File) => void;
    isLoading: boolean;
    isUploading: boolean;
    uploadProgress: number;
    className?: string;
    style?: React.CSSProperties;
}

// Helper to encode AudioBuffer to WAV
const bufferToWav = (abuffer: AudioBuffer, len: number) => {
    let numOfChan = abuffer.numberOfChannels;
    let length = len * numOfChan * 2 + 44;
    let buffer = new ArrayBuffer(length);
    let view = new DataView(buffer);
    let channels = [], i, sample, offset = 0, pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this example)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for(i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while(pos < len) {
        for(i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(44 + offset, sample, true);
            offset += 2;
        }
        pos++;
    }

    return new Blob([buffer], { type: "audio/wav" });

    function setUint16(data: any) {
        view.setUint16(pos, data, true);
        pos += 2;
    }
    function setUint32(data: any) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}

export const MeetingInput: React.FC<MeetingInputProps> = ({ onFileUpload, isLoading, isUploading, uploadProgress, className, style }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Trimming State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isTrimMode, setIsTrimMode] = useState(false);
    const [audioDuration, setAudioDuration] = useState(0);
    const [trimStart, setTrimStart] = useState(0);
    const [trimEnd, setTrimEnd] = useState(0);
    const [isProcessingTrim, setIsProcessingTrim] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const originalAudioBufferRef = useRef<AudioBuffer | null>(null);

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
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        setSelectedFile(file);
        // Reset Trim State
        setIsTrimMode(false);
        setTrimStart(0);
        setTrimEnd(0);
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
                    handleFileSelection(audioFile);
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

    // Trim Logic
    const initTrimMode = async () => {
        if (!selectedFile) return;
        setIsProcessingTrim(true);
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const arrayBuffer = await selectedFile.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            originalAudioBufferRef.current = audioBuffer;
            setAudioDuration(audioBuffer.duration);
            setTrimStart(0);
            setTrimEnd(audioBuffer.duration);
            setIsTrimMode(true);
        } catch (error) {
            console.error("Error decoding audio for trim:", error);
            alert("خطا در پردازش فایل صوتی. لطفا فایل دیگری امتحان کنید.");
        } finally {
            setIsProcessingTrim(false);
        }
    };

    const applyTrim = async () => {
        if (!originalAudioBufferRef.current || !audioContextRef.current) return;
        setIsProcessingTrim(true);
        
        try {
            const buffer = originalAudioBufferRef.current;
            const ctx = audioContextRef.current;
            const startFrame = Math.floor(trimStart * buffer.sampleRate);
            const endFrame = Math.floor(trimEnd * buffer.sampleRate);
            const frameCount = endFrame - startFrame;
            
            if (frameCount <= 0) {
                alert("بازه زمانی نامعتبر است.");
                setIsProcessingTrim(false);
                return;
            }

            const newBuffer = ctx.createBuffer(buffer.numberOfChannels, frameCount, buffer.sampleRate);

            for (let i = 0; i < buffer.numberOfChannels; i++) {
                const channelData = buffer.getChannelData(i);
                const newChannelData = newBuffer.getChannelData(i);
                for (let j = 0; j < frameCount; j++) {
                    newChannelData[j] = channelData[startFrame + j];
                }
            }

            const wavBlob = bufferToWav(newBuffer, frameCount);
            const newFile = new File([wavBlob], "trimmed_" + selectedFile?.name, { type: "audio/wav" });
            
            setSelectedFile(newFile);
            setIsTrimMode(false);
        } catch (error) {
            console.error("Error trimming audio:", error);
            alert("خطا در برش فایل صوتی.");
        } finally {
            setIsProcessingTrim(false);
        }
    };

    const handleAnalyze = () => {
        if (selectedFile) {
            onFileUpload(selectedFile);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    return (
        <div className={`bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg transition-colors duration-300 flex flex-col ${className}`} style={style}>
            <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white flex-shrink-0">مدیر کسب و کار</h2>
            
            {!selectedFile ? (
                 <div className="flex-1 flex flex-col justify-center">
                     <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm text-center">فایل صوتی جلسه را آپلود یا ضبط کنید.</p>
                     
                     <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()} className="relative w-full text-center flex-1 min-h-[150px]">
                        <input 
                            ref={inputRef} 
                            type="file" 
                            id="input-file-upload" 
                            accept="audio/*, .mp3, .wav, .m4a, .ogg, .aac, .flac, .wma, .mp4, .webm, .amr" 
                            multiple={false} 
                            onChange={handleChange} 
                            className="hidden" 
                        />
                        <label 
                            id="label-file-upload" 
                            htmlFor="input-file-upload" 
                            className={`h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 relative z-10 ${dragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/50 aurora-bg" : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50 dark:bg-slate-700/50"}`}
                        >
                            <div className="relative z-10 p-4">
                                <i className={`fa-solid fa-cloud-arrow-up text-3xl mb-3 transition-colors ${dragActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}></i>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">فایل صوتی را اینجا رها کنید</p>
                                <button type="button" onClick={onButtonClick} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-2">
                                    انتخاب فایل
                                </button>
                            </div>
                        </label>
                    </form>

                     <button
                        onClick={toggleRecording}
                        disabled={isLoading}
                        className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg ${
                            isRecording 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isRecording ? (
                            <>
                                <span className="animate-pulse relative flex h-3 w-3 bg-white rounded-full"></span>
                                <span>توقف ضبط</span>
                            </>
                        ) : (
                            <>
                            <i className="fa-solid fa-microphone"></i>
                                <span>ضبط صدا</span>
                            </>
                        )}
                    </button>
                 </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="mb-4 p-4 bg-indigo-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                 <i className="fa-solid fa-file-audio text-xl"></i>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="font-bold text-slate-700 dark:text-slate-200 truncate text-sm">{selectedFile.name}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 transition-colors px-2">
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    {isTrimMode && (
                        <div className="mb-4 p-4 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900/50 animate-fade-in-subtle flex-1 overflow-y-auto">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 text-sm">
                                <i className="fa-solid fa-scissors"></i>
                                برش فایل صوتی
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>شروع: {formatTime(trimStart)}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max={trimEnd - 1} 
                                        step="0.1"
                                        value={trimStart} 
                                        onChange={(e) => setTrimStart(Number(e.target.value))}
                                        className="w-full accent-indigo-600"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                         <span>پایان: {formatTime(trimEnd)}</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min={trimStart + 1} 
                                        max={audioDuration} 
                                        step="0.1"
                                        value={trimEnd} 
                                        onChange={(e) => setTrimEnd(Number(e.target.value))}
                                        className="w-full accent-indigo-600"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex gap-2 justify-end mt-4">
                                <button 
                                    onClick={() => setIsTrimMode(false)}
                                    className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50"
                                >
                                    انصراف
                                </button>
                                <button 
                                    onClick={applyTrim}
                                    disabled={isProcessingTrim}
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs font-bold disabled:opacity-50"
                                >
                                    {isProcessingTrim ? '...' : 'اعمال'}
                                </button>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                         <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <div className="relative h-16 w-16 mb-4">
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
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
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                    {isUploading ? `${Math.round(uploadProgress)}%` : <i className="fa-solid fa-brain fa-spin"></i>}
                                </div>
                            </div>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                                {isUploading ? 'آپلود...' : 'تحلیل هوشمند...'}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-auto flex flex-col sm:flex-row gap-3">
                            {!isTrimMode && (
                                <button 
                                    onClick={initTrimMode}
                                    className="flex-1 py-3 px-4 rounded-lg font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <i className="fa-solid fa-scissors"></i>
                                    ویرایش
                                </button>
                            )}
                            <button
                                onClick={handleAnalyze}
                                className="flex-[2] py-3 px-4 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2 text-sm"
                            >
                                <i className="fa-solid fa-wand-magic-sparkles"></i>
                                تحلیل هوشمند
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
