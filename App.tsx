import React, { useState, useEffect } from 'react';
import type { VideoInfo, SEOData, GeneratedHeadline, HistoryEntry } from './types';
import { generateSeoContent, generateThumbnailHeadline } from './services/geminiService';
import Section1Form from './components/Section1Form';
import Section2Results from './components/Section2Results';
import Section3Thumbnail from './components/Section3Thumbnail';
import Section4Final from './components/Section4Final';
import Loader from './components/Loader';
import History from './components/History';

const Icons = {
    info: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>,
    seo: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
    thumbnail: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>,
    check: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
    history: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
};

const Toast: React.FC<{ message: string, show: boolean }> = ({ message, show }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-8 right-8 bg-green-100 text-green-800 border border-green-300 py-3 px-5 rounded-lg shadow-lg animate-fade-in z-50 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>{message}</span>
        </div>
    );
};

const App: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
    const [seoData, setSeoData] = useState<SEOData | null>(null);
    const [generatedHeadline, setGeneratedHeadline] = useState<GeneratedHeadline | null>(null);
    const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState({ message: '', show: false });
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [animationClass, setAnimationClass] = useState('animate-fade-in');


    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('ytSeoHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage:", e);
            setHistory([]);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('ytSeoHistory', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to localStorage:", e);
        }
    }, [history]);

    const showToast = (message: string) => {
        setToast({ message, show: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const performTransition = (updateFunction: () => void) => {
        setAnimationClass('animate-fade-out');
        setTimeout(() => {
            updateFunction();
            setAnimationClass('animate-fade-in');
        }, 400); // Duration matches CSS animation
    };
    
    const handleSeoGeneration = async (info: VideoInfo) => {
        performTransition(() => {
            setLoadingMessage("Analisando seu vídeo e criando conteúdo otimizado... Isso pode levar um momento.");
            setIsLoading(true);
            setError(null);
            setVideoInfo(info);
        });

        try {
            const result = await generateSeoContent(info);
            performTransition(() => {
                setSeoData(result);
                setStep(2);
                setIsLoading(false);
            });
        } catch (e) {
            performTransition(() => {
                console.error(e);
                setError('Falha ao gerar conteúdo de SEO. Por favor, tente novamente.');
                setIsLoading(false);
            });
        }
    };

    const handleRegenerateSeo = async () => {
        if (!videoInfo || !seoData) return;

        performTransition(() => {
            setLoadingMessage("Gerando uma nova versão com uma estratégia diferente...");
            setIsLoading(true);
            setError(null);
        });

        try {
            // Pass the current title to get a different version
            const result = await generateSeoContent(videoInfo, seoData.title);
            performTransition(() => {
                setSeoData(result);
                // Stay on step 2
                setStep(2);
                setIsLoading(false);
            });
        } catch (e) {
            performTransition(() => {
                console.error(e);
                setError('Falha ao gerar a nova versão. Por favor, tente novamente.');
                setIsLoading(false);
            });
        }
    };

    const goToThumbnailSection = async () => {
        if (!videoInfo || !seoData) return;
        
        performTransition(() => {
            setLoadingMessage("Criando uma headline profissional para sua thumbnail...");
            setIsLoading(true);
            setError(null);
        });

        try {
            const headline = await generateThumbnailHeadline(videoInfo, seoData);
            performTransition(() => {
                setGeneratedHeadline(headline);
                setStep(3);
                setIsLoading(false);
            });
        } catch (e) {
            performTransition(() => {
                console.error(e);
                setError('Falha ao gerar a headline. Por favor, tente novamente.');
                setIsLoading(false);
            });
        }
    };
    
    const handleFinalize = (dataUrl: string) => {
         performTransition(() => {
            if (videoInfo && seoData) {
                const newEntry: HistoryEntry = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    title: seoData.title,
                    videoInfo,
                    seoData,
                    thumbnailDataUrl: dataUrl
                };
                setHistory(prev => [newEntry, ...prev]);
            }
            setThumbnailDataUrl(dataUrl);
            setStep(4);
        });
    };

    const restart = () => {
        performTransition(() => {
            setStep(1);
            setVideoInfo(null);
            setSeoData(null);
            setGeneratedHeadline(null);
            setThumbnailDataUrl(null);
            setIsLoading(false);
            setLoadingMessage('');
            setError(null);
            setIsHistoryOpen(false);
        });
    };

    const viewHistoryItem = (item: HistoryEntry) => {
        performTransition(() => {
            setVideoInfo(item.videoInfo);
            setSeoData(item.seoData);
            setThumbnailDataUrl(item.thumbnailDataUrl);
            setGeneratedHeadline(null); // Not stored, would need regeneration
            setStep(4);
            setIsHistoryOpen(false);
        });
    };

    const reuseHistoryItem = (item: HistoryEntry) => {
        performTransition(() => {
            setVideoInfo(item.videoInfo);
            setSeoData(item.seoData);
            setThumbnailDataUrl(null);
            setGeneratedHeadline({ line1: 'EDITAR TEXTO', line2: 'MODIFICAR ESTILOS' }); // Placeholder
            setStep(3);
            setIsHistoryOpen(false);
        });
    };

    const deleteHistoryItem = (id: number) => {
        setHistory(prev => prev.filter(item => item.id !== id));
        showToast("Item removido do histórico.");
    };

    const clearHistory = () => {
        if (window.confirm("Você tem certeza que deseja apagar todo o histórico? Essa ação não pode ser desfeita.")) {
            setHistory([]);
            showToast("Histórico apagado com sucesso.");
        }
    };

    const renderStep = () => {
        if (isLoading) {
            return <Loader message={loadingMessage} />;
        }
        
        switch (step) {
            case 1:
                return <Section1Form onNext={handleSeoGeneration} />;
            case 2:
                return seoData && <Section2Results data={seoData} onNext={goToThumbnailSection} onBack={() => performTransition(() => setStep(1))} showToast={showToast} onRegenerate={handleRegenerateSeo} />;
            case 3:
                return videoInfo && <Section3Thumbnail videoInfo={videoInfo} initialHeadline={generatedHeadline} onNext={handleFinalize} onBack={() => performTransition(() => setStep(2))} />;
            case 4:
                return seoData && thumbnailDataUrl && <Section4Final seoData={seoData} thumbnailDataUrl={thumbnailDataUrl} onBack={() => performTransition(() => setStep(3))} onRestart={restart} showToast={showToast} />;
            default:
                return <Section1Form onNext={handleSeoGeneration} />;
        }
    };

    const simplifiedSteps = [
        { name: 'Informações do Vídeo', id: 1 },
        { name: 'Conteúdo Otimizado', id: 2 },
        { name: 'Gerar Thumbnail', id: 3 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 md:p-8">
            <Toast message={toast.message} show={toast.show} />
            {isHistoryOpen && (
                <History 
                    history={history}
                    onClose={() => setIsHistoryOpen(false)}
                    onView={viewHistoryItem}
                    onReuse={reuseHistoryItem}
                    onDelete={deleteHistoryItem}
                    onClear={clearHistory}
                />
            )}
            <div className="max-w-4xl mx-auto">
                 <header className="relative text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 pb-2">
                        Gerador de Conteúdo YouTube
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Transforme suas ideias em conteúdo otimizado para SEO com thumbnails profissionais</p>
                    {history.length > 0 && <button 
                        onClick={() => setIsHistoryOpen(true)}
                        className="absolute top-0 right-0 p-3 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-gray-600"
                        title="Ver Histórico"
                    >
                        {Icons.history}
                    </button>}
                </header>

                 <div className="w-full max-w-lg mx-auto mb-12">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200" style={{ transform: 'translateY(-50%)' }}></div>
                        <div 
                            className="absolute top-1/2 left-0 h-0.5 bg-purple-600 transition-all duration-500" 
                            style={{ 
                                width: `${((step - 1) / (simplifiedSteps.length - 1)) * 100}%`,
                                transform: 'translateY(-50%)' 
                            }}>
                        </div>
                        {simplifiedSteps.map((s, i) => (
                             <div className="relative z-10 flex flex-col items-center" key={s.id}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= s.id ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s.id ? '✔' : s.id}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <main>
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">{error}</div>}
                    <div className={`relative ${animationClass}`}>
                        {renderStep()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;