import React, { useState, useEffect } from 'react';
import type { SEOData, StructuredDescription } from '../types';

interface Section2ResultsProps {
    data: SEOData;
    onNext: () => void;
    onBack: () => void;
    showToast: (message: string) => void;
    onRegenerate: () => void;
}

const CopyButton: React.FC<{ onCopy: () => void, type: string }> = ({ onCopy, type }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (copied) return;
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-2 rounded-md transition-colors ${
                copied
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
            title={copied ? "Copiado!" : `Copiar ${type}`}
            disabled={copied}
        >
            {copied ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            )}
        </button>
    );
};

const SeoScoreGauge: React.FC<{ score: number, justification: string }> = ({ score, justification }) => {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        if (score === 0) {
            setDisplayScore(0);
            return;
        };
        const duration = 1000;
        const startTime = Date.now();

        const animateScore = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentScore = Math.round(progress * score);
            setDisplayScore(currentScore);

            if (progress < 1) {
                requestAnimationFrame(animateScore);
            }
        };
        requestAnimationFrame(animateScore);
    }, [score]);

    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayScore / 100) * circumference;

    const scoreColor = score > 75 ? 'stroke-green-500' : score > 50 ? 'stroke-yellow-500' : 'stroke-red-500';

    return (
        <div className="relative group flex flex-col items-center justify-center space-y-2">
            <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                    <circle className="stroke-current text-gray-200" strokeWidth="10" fill="transparent" r={radius} cx="60" cy="60" />
                    <circle
                        className={`transition-all duration-1000 ease-out ${scoreColor}`}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="60"
                        cy="60"
                        transform="rotate(-90 60 60)"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{displayScore}</span>
                    <span className="text-xs text-gray-500">/100</span>
                </div>
            </div>
            <span className="text-sm font-semibold text-gray-500 text-center">Pontuação VidIQ (Estimada)</span>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
                <p className="font-bold mb-1 border-b border-gray-600 pb-1">Justificativa da Pontuação:</p>
                <p className="mt-1">{justification}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
            </div>
        </div>
    );
};

const StructuredDescriptionDisplay: React.FC<{ description: StructuredDescription }> = ({ description }) => {
    if (!description) return null;

    return (
        <>
            <p className="mb-4">{description.opening}</p>
            <p className="mb-4">
                <strong className="text-purple-600">{description.mainMessage}</strong>
            </p>
            {description.paragraphs.map((p, i) => (
                <p key={i} className="mb-4">{p}</p>
            ))}
            {description.benefitsList && description.benefitsList.length > 0 && (
                <ul className="list-disc list-inside space-y-1 my-4 pl-4">
                    {description.benefitsList.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            )}
            <p className="mb-4">{description.callToAction}</p>
            <p className="text-blue-500 font-medium">{description.hashtags}</p>
        </>
    );
};

const formatDescriptionForClipboard = (description: StructuredDescription): string => {
    if (!description) return '';
    
    let text = `${description.opening}\n\n`;
    text += `**${description.mainMessage}**\n\n`;
    text += `${description.paragraphs.join('\n\n')}\n\n`;

    if (description.benefitsList && description.benefitsList.length > 0) {
        text += `${description.benefitsList.map(item => `- ${item}`).join('\n')}\n\n`;
    }

    text += `${description.callToAction}\n\n`;
    text += `${description.hashtags}`;

    return text;
};


const Section2Results: React.FC<Section2ResultsProps> = ({ data, onNext, onBack, showToast, onRegenerate }) => {
    
    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        showToast(`${type} copiado para a área de transferência!`);
    };

    const descriptionText = formatDescriptionForClipboard(data.description);

    return (
        <div className="bg-white rounded-xl p-6 sm:p-8 animate-fade-in space-y-8 shadow-lg border border-gray-200/80">
            <h2 className="text-xl font-bold text-gray-900">Conteúdo Otimizado Gerado</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {/* Title */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Título Otimizado para YouTube</h3>
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex justify-between items-start gap-4">
                            <p className="font-semibold text-lg text-gray-800 break-all">{data.title}</p>
                            <CopyButton onCopy={() => copyToClipboard(data.title, 'Título')} type="Título" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">Descrição Estratégica</h3>
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg relative h-64 overflow-y-auto">
                            <div className="absolute top-4 right-4"><CopyButton onCopy={() => copyToClipboard(descriptionText, 'Descrição')} type="Descrição" /></div>
                            <div className="text-gray-600 leading-relaxed pr-12"><StructuredDescriptionDisplay description={data.description} /></div>
                        </div>
                    </div>
                </div>
                 {/* Score */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                    <SeoScoreGauge score={data.seoScore} justification={data.scoreJustification} />
                </div>
            </div>

            {/* Keywords */}
            <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">18 Palavras-chave</h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg relative">
                     <div className="absolute top-4 right-4"><CopyButton onCopy={() => copyToClipboard(data.keywords.join(', '), 'Palavras-chave')} type="Palavras-chave" /></div>
                    <p className="text-gray-500 pr-16">{data.keywords.join(', ')}</p>
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition-colors"
                >
                    Voltar
                </button>
                <button
                    onClick={onRegenerate}
                    className="px-6 py-2 bg-purple-100 text-purple-700 font-bold rounded-md hover:bg-purple-200 transition-colors flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                    <span>Gerar outra versão</span>
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md"
                >
                    Avançar para Thumbnail
                </button>
            </div>
        </div>
    );
};

export default Section2Results;