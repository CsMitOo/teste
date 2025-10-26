import React, { useState } from 'react';
import type { SEOData, StructuredDescription } from '../types';

// Declare JSZip for TypeScript since it's loaded from a script tag
declare var JSZip: any;

interface Section4FinalProps {
    seoData: SEOData;
    thumbnailDataUrl: string;
    onBack: () => void;
    onRestart: () => void;
    showToast: (message: string) => void;
}

const CopyButton: React.FC<{ text: string, type: string, showToast: (message: string) => void }> = ({ text, type, showToast }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (copied) return;
        navigator.clipboard.writeText(text);
        showToast(`${type} copiado para a área de transferência!`);
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

const Section4Final: React.FC<Section4FinalProps> = ({ seoData, thumbnailDataUrl, onBack, onRestart, showToast }) => {
    
    const downloadFile = (href: string, filename: string) => {
        const link = document.createElement('a');
        link.href = href;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (href.startsWith('blob:')) {
            URL.revokeObjectURL(href);
        }
    };
    
    const getSanitizedTitle = () => {
        return seoData.title
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-zA-Z0-9\s_-]/g, '') // Remove invalid characters except spaces, underscores, hyphens
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 50) || 'video_seo';
    };

    const handleDownloadThumbnail = () => {
        downloadFile(thumbnailDataUrl, `${getSanitizedTitle()}_thumbnail.png`);
    };

    const handleDownloadPackage = async () => {
        try {
            const zip = new JSZip();
            const sanitizedTitle = getSanitizedTitle();
            
            const descriptionForFile = formatDescriptionForClipboard(seoData.description).replace(/\*\*/g, '');

            const textContent = `
Título do Vídeo:
${seoData.title}

==================================================

Descrição:
${descriptionForFile}

==================================================

Palavras-chave:
${seoData.keywords.join(', ')}

==================================================

Justificativa da Pontuação (${seoData.seoScore}/100):
${seoData.scoreJustification}
            `.trim().replace(/^\s+/gm, '');

            zip.file('info_seo.txt', textContent);

            const base64Data = thumbnailDataUrl.split(',')[1];
            zip.file(`${sanitizedTitle}_thumbnail.png`, base64Data, { base64: true });

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            downloadFile(url, `${sanitizedTitle}_pacote.zip`);

        } catch (error) {
            console.error("Failed to create or download the zip package:", error);
            showToast("Ocorreu um erro ao criar o pacote .zip.");
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 sm:p-8 animate-fade-in shadow-lg border border-gray-200/80">
            <h2 className="text-2xl text-center font-bold mb-8 text-gray-900">Resultado Final</h2>
            
            {/* Thumbnail Section */}
            <div className="mb-12">
                 <div className="max-w-3xl mx-auto bg-gray-100 p-2 rounded-lg shadow-xl border border-gray-200">
                    <img src={thumbnailDataUrl} alt="Thumbnail Final" className="w-full h-auto rounded-md" />
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 max-w-2xl mx-auto">
                    <button onClick={handleDownloadThumbnail} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        <span>Baixar Thumbnail</span>
                    </button>
                    <button onClick={handleDownloadPackage} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        <span>Baixar Pacote (.zip)</span>
                    </button>
                 </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 mb-12"></div>

            {/* SEO Content Section */}
            <div className="space-y-8 max-w-4xl mx-auto">
                {/* Title */}
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Título Otimizado</h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex justify-between items-start gap-4">
                        <p className="font-semibold text-lg text-gray-800 break-all">{seoData.title}</p>
                        <CopyButton text={seoData.title} type="Título" showToast={showToast}/>
                    </div>
                     <div className="mt-2 flex justify-end items-center gap-2">
                        <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${seoData.seoScore > 75 ? 'bg-green-100 text-green-800' : seoData.seoScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            Pontuação VidIQ: {seoData.seoScore}/100 (Estimada)
                        </span>
                        <div className="relative group">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 cursor-help"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            <div className="absolute bottom-full right-0 mb-2 w-72 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
                                <p className="font-bold mb-1 border-b border-gray-600 pb-1">Justificativa da Pontuação:</p>
                                <p className="mt-1">{seoData.scoreJustification}</p>
                                <div className="absolute top-full right-2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Descrição Estratégica</h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg relative h-64 overflow-y-auto">
                        <div className="absolute top-4 right-4"><CopyButton text={formatDescriptionForClipboard(seoData.description)} type="Descrição" showToast={showToast} /></div>
                        <div className="text-gray-600 leading-relaxed pr-12"><StructuredDescriptionDisplay description={seoData.description} /></div>
                    </div>
                </div>

                {/* Keywords */}
                <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-800">Palavras-chave</h3>
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg relative">
                         <div className="absolute top-4 right-4"><CopyButton text={seoData.keywords.join(', ')} type="Palavras-chave" showToast={showToast}/></div>
                        <p className="text-gray-500 pr-16">{seoData.keywords.join(', ')}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition-colors"
                >
                    Voltar
                </button>
                <button
                    onClick={onRestart}
                    className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-purple-100 hover:text-purple-700 transition-all transform hover:scale-105"
                >
                    Começar de Novo
                </button>
            </div>
        </div>
    );
};

export default Section4Final;