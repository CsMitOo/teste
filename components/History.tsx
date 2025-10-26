import React from 'react';
import type { HistoryEntry } from '../types';

interface HistoryProps {
    history: HistoryEntry[];
    onClose: () => void;
    onView: (item: HistoryEntry) => void;
    onReuse: (item: HistoryEntry) => void;
    onDelete: (id: number) => void;
    onClear: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onClose, onView, onReuse, onDelete, onClear }) => {
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200/80 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Histórico de Gerações</h2>
                    <button onClick={onClose} className="text-gray-500 text-3xl font-bold hover:text-gray-700 transition">&times;</button>
                </div>

                {history.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        <p className="text-lg">Seu histórico está vazio.</p>
                        <p className="text-sm">Crie um novo SEO para vê-lo aqui.</p>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
                        {history.map(item => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-start space-x-4 transition-shadow hover:shadow-md hover:ring-1 hover:ring-purple-500/50 border border-gray-200">
                                <img src={item.thumbnailDataUrl} alt="Thumbnail Preview" className="w-32 h-auto object-cover rounded-md" />
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-gray-800 break-all">{item.title}</p>
                                    <p className="text-sm text-gray-500">{formatDate(item.date)}</p>
                                    <div className="flex space-x-2 mt-3">
                                        <button onClick={() => onView(item)} className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition">Visualizar</button>
                                        <button onClick={() => onReuse(item)} className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-md hover:bg-green-700 transition">Reutilizar</button>
                                        <button onClick={() => onDelete(item.id)} className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-md hover:bg-red-700 transition">Excluir</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                    <button 
                        onClick={onClear} 
                        disabled={history.length === 0}
                        className="px-6 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                    >
                        Limpar todo o histórico
                    </button>
                </div>
            </div>
        </div>
    );
};

export default History;