import React, { useState, useEffect, useRef } from 'react';
import type { VideoInfo } from '../types';
import { generateSummaryForTitle } from '../services/geminiService';


interface Section1FormProps {
    onNext: (info: VideoInfo) => void;
}

const Section1Form: React.FC<Section1FormProps> = ({ onNext }) => {
    const [summary, setSummary] = useState('');
    const [title, setTitle] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    const debounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (title.trim().length > 10) { // Only trigger if title is reasonably long
            setIsGeneratingSummary(true);
            setSummaryError(null);
            
            debounceTimeout.current = window.setTimeout(async () => {
                try {
                    const generatedSummary = await generateSummaryForTitle(title);
                    setSummary(generatedSummary);
                } catch (error) {
                    console.error(error);
                    setSummaryError('Falha ao gerar resumo.');
                } finally {
                    setIsGeneratingSummary(false);
                }
            }, 800); // 800ms delay
        } else {
            setIsGeneratingSummary(false);
        }

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [title]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (summary.trim() && title.trim()) {
            onNext({ summary, keyword: title, niche: '', audience: '' });
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 sm:p-8 animate-fade-in shadow-lg border border-gray-200/80">
            <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="m22 8-6 4 6 4V8Z"/><path d="M16 12H2"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Informações do Vídeo</h2>
                    <p className="text-gray-500">Digite o título e resumo para gerar conteúdo otimizado</p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Título do Vídeo
                    </label>
                    <input
                        id="title"
                        type="text"
                        className="w-full bg-white border-gray-300 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 p-3 transition"
                        placeholder="Ex: Como ganhar dinheiro na internet em 2024"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                         <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                            Resumo do Conteúdo
                        </label>
                        {isGeneratingSummary && (
                           <span className="text-xs text-purple-600 flex items-center space-x-1">
                               <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                               <span>Gerando...</span>
                           </span>
                        )}
                        {summaryError && <span className="text-xs text-red-500">{summaryError}</span>}
                    </div>
                    <textarea
                        id="summary"
                        rows={5}
                        className="w-full bg-white border-gray-300 border rounded-md shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 p-3 transition disabled:bg-gray-50"
                        placeholder="Descreva brevemente o que será abordado no vídeo, principais tópicos, dicas que serão compartilhadas, etc."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        required
                        disabled={isGeneratingSummary}
                    />
                </div>
                
                <div className="flex justify-center pt-4">
                    <button
                        type="submit"
                        disabled={!summary.trim() || !title.trim() || isGeneratingSummary}
                        className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:text-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-md"
                    >
                        <span className="flex items-center justify-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2.13a2.4 2.4 0 0 1 3.38 0L22 5.5l-3.38 3.38a2.4 2.4 0 0 1-3.37 0l-.5-.5a2.4 2.4 0 0 1 0-3.38l.5-.5Z"/><path d="m8.5 11.5.5.5a2.4 2.4 0 0 0 3.38 0l3.38-3.38L12.5 5.5l-3.38 3.38a2.4 2.4 0 0 0 0 3.38Z"/><path d="M5.5 22l3.38-3.38a2.4 2.4 0 0 0 0-3.37l-.5-.5a2.4 2.4 0 0 0-3.38 0L2 18.13a2.4 2.4 0 0 0 0 3.38l.5.5Z"/><path d="m11.5 8.5-.5-.5a2.4 2.4 0 0 1 0-3.38L14.5 2l3.38 3.38a2.4 2.4 0 0 1 0 3.37l-.5.5Z"/></svg>
                             <span>Gerar Conteúdo Otimizado</span>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Section1Form;