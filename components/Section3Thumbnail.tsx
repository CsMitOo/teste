import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { VideoInfo, GeneratedHeadline } from '../types';
import { generateThumbnailPrompt, generateImage } from '../services/geminiService';
import Loader from './Loader';

interface Section3ThumbnailProps {
    videoInfo: VideoInfo;
    initialHeadline: GeneratedHeadline | null;
    onBack: () => void;
    onNext: (dataUrl: string) => void;
}

type AspectRatio = '16:9' | '9:16' | '1:1';
type GenerationOption = 'upload-headline' | 'generate';
type TextPosition = 'top' | 'center' | 'bottom';
type TextAlign = 'left' | 'center' | 'right';

const FONT_OPTIONS = ['Poppins', 'Montserrat', 'Roboto', 'Impact'];
const FONT_WEIGHT_OPTIONS = [
    { label: 'Normal', value: '400' },
    { label: 'Semi-Negrito', value: '600' },
    { label: 'Negrito', value: '700' },
    { label: 'Extra Negrito', value: '800' },
    { label: 'Preto', value: '900' },
];

const IMAGE_STYLES = [
    'Ultra Realista',
    'Fotorrealista',
    'Cinematográfico',
    'Animação 3D',
    'Anime/Mangá',
    'Arte Fantasia',
    'Cyberpunk Neon',
    'Pixel Art',
];

interface HeadlineControlsProps {
    line: 1 | 2;
    headline: string; setHeadline: (v: string) => void;
    color: string; setColor: (v: string) => void;
    opacity: number; setOpacity: (v: number) => void;
    fontFamily: string; setFontFamily: (v: string) => void;
    fontWeight: string; setFontWeight: (v: string) => void;
    fontSize: number; setFontSize: (v: number) => void;
    strokeColor: string; setStrokeColor: (v: string) => void;
    strokeWidth: number; setStrokeWidth: (v: number) => void;
    strokeOpacity: number; setStrokeOpacity: (v: number) => void;
    onFontFileChange: (file: File) => void;
    customFontFileName: string | null;
}

const HeadlineControls: React.FC<HeadlineControlsProps> = ({
    line, headline, setHeadline, color, setColor, opacity, setOpacity, fontFamily, setFontFamily,
    fontWeight, setFontWeight, fontSize, setFontSize, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth, strokeOpacity, setStrokeOpacity,
    onFontFileChange, customFontFileName
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        onFontFileChange(e.target.files[0]);
      }
    };
    
    return (
    <div className="space-y-3">
        <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} placeholder={`HEADLINE LINHA ${line}`} className="w-full bg-white p-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 border border-gray-300"/>
        
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-xs font-medium text-gray-500">Cor do Texto</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 p-0 border border-gray-300 rounded bg-white cursor-pointer"/>
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500">Cor do Contorno</label>
                <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-full h-8 p-0 border border-gray-300 rounded bg-white cursor-pointer"/>
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
             <div>
                <label className="text-xs font-medium text-gray-500">Fonte</label>
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-gray-100 p-2 rounded-md mt-1 text-gray-800 border-gray-300 border text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
                    {customFontFileName && !FONT_OPTIONS.includes(fontFamily) && (
                         <option value={fontFamily}>{customFontFileName}</option>
                    )}
                </select>
                 <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".ttf,.otf,.woff,.woff2"
                    className="hidden"
                 />
                 <button onClick={() => fileInputRef.current?.click()} className="w-full text-xs text-purple-600 hover:text-purple-800 mt-2 text-center">
                    Carregar Fonte
                 </button>
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500">Peso</label>
                <select value={fontWeight} onChange={e => setFontWeight(e.target.value)} className="w-full bg-gray-100 p-2 rounded-md mt-1 text-gray-800 border-gray-300 border text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                    {FONT_WEIGHT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
             <div>
                <label className="text-xs font-medium text-gray-500">Tamanho ({fontSize})</label>
                <input type="range" min="4" max="20" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 accent-purple-600"/>
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500">Contorno ({strokeWidth}%)</label>
                <input type="range" min="0" max="20" value={strokeWidth} onChange={e => setStrokeWidth(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 accent-purple-600"/>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
                <label className="text-xs font-medium text-gray-500">Opacidade ({opacity}%)</label>
                <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 accent-purple-600"/>
            </div>
            <div>
                <label className="text-xs font-medium text-gray-500">Opacidade Contorno ({strokeOpacity}%)</label>
                <input type="range" min="0" max="100" value={strokeOpacity} onChange={e => setStrokeOpacity(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 accent-purple-600"/>
            </div>
        </div>
    </div>
    );
};


const Section3Thumbnail: React.FC<Section3ThumbnailProps> = ({ videoInfo, initialHeadline, onBack, onNext }) => {
    const [generationOption, setGenerationOption] = useState<GenerationOption>('generate');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    
    const [headline1, setHeadline1] = useState('');
    const [headline2, setHeadline2] = useState('');
    const [color1, setColor1] = useState('#FFFFFF');
    const [opacity1, setOpacity1] = useState(100);
    const [color2, setColor2] = useState('#FFFF00');
    const [opacity2, setOpacity2] = useState(100);
    const [strokeColor1, setStrokeColor1] = useState('#000000');
    const [strokeOpacity1, setStrokeOpacity1] = useState(100);
    const [strokeColor2, setStrokeColor2] = useState('#000000');
    const [strokeOpacity2, setStrokeOpacity2] = useState(100);
    const [position, setPosition] = useState<TextPosition>('bottom');
    const [textAlign, setTextAlign] = useState<TextAlign>('center');
    const [lineSpacing, setLineSpacing] = useState(2);
    
    const [fontSize1, setFontSize1] = useState(10);
    const [strokeWidth1, setStrokeWidth1] = useState(10);
    const [fontSize2, setFontSize2] = useState(8);
    const [strokeWidth2, setStrokeWidth2] = useState(10);

    const [fontFamily1, setFontFamily1] = useState('Poppins');
    const [fontWeight1, setFontWeight1] = useState('900');
    const [fontFamily2, setFontFamily2] = useState('Poppins');
    const [fontWeight2, setFontWeight2] = useState('900');
    
    const [customFontFileName1, setCustomFontFileName1] = useState<string | null>(null);
    const [customFontFileName2, setCustomFontFileName2] = useState<string | null>(null);

    const [imageStyle, setImageStyle] = useState<string>('Fotorrealista');
    
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());

    useEffect(() => {
        if (initialHeadline) {
            setHeadline1(initialHeadline.line1);
            setHeadline2(initialHeadline.line2);
        }
    }, [initialHeadline]);

    const getCanvasDimensions = useCallback(() => {
        const baseWidth = 1280;
        switch (aspectRatio) {
            case '16:9': return { width: baseWidth, height: 720 };
            case '9:16': return { width: 720, height: baseWidth };
            case '1:1': return { width: 1080, height: 1080 };
            default: return { width: baseWidth, height: 720 };
        }
    }, [aspectRatio]);

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { width, height } = getCanvasDimensions();
        canvas.width = width;
        canvas.height = height;
        
        const currentImageSrc = (generationOption === 'generate' && generatedImage) || uploadedImage;
        if (currentImageSrc) {
            const img = imageRef.current;
            if (img.src !== currentImageSrc) {
                img.onload = () => drawCanvas();
                img.src = currentImageSrc;
                return;
            }

            if (img.complete && img.naturalWidth > 0) {
                const canvasAspect = width / height;
                const imageAspect = img.naturalWidth / img.naturalHeight;
                let sx = 0, sy = 0, sWidth = img.naturalWidth, sHeight = img.naturalHeight;

                if (imageAspect > canvasAspect) {
                    sWidth = img.naturalHeight * canvasAspect;
                    sx = (img.naturalWidth - sWidth) / 2;
                } else {
                    sHeight = img.naturalWidth / canvasAspect;
                    sy = (img.naturalHeight - sHeight) / 2;
                }
                
                ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
            }
        } else {
            ctx.fillStyle = '#E5E7EB';
            ctx.fillRect(0, 0, width, height);
        }

        const hexToRgba = (hex: string, opacity: number): string => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (!result) return `rgba(0,0,0,${opacity / 100})`;
            const r = parseInt(result[1], 16);
            const g = parseInt(result[2], 16);
            const b = parseInt(result[3], 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
        };

        if (headline1 || headline2) {
            const baseDimension = Math.min(width, height);
            const line1Size = fontSize1 * baseDimension / 100;
            const line2Size = fontSize2 * baseDimension / 100;
            const spacing = lineSpacing * baseDimension / 100;

            const measureTextHeight = (text: string, size: number, fontWeight: string, fontFamily: string): { height: number; lines: string[] } => {
                if (!text) return { height: 0, lines: [] };
                ctx.font = `${fontWeight} ${size}px "${fontFamily}", Impact, sans-serif`;
                const maxWidth = width * 0.9;
                const words = text.toUpperCase().split(' ');
                let line = '';
                const lines: string[] = [];
                const lineHeight = size * 1.2;

                for (const word of words) {
                    const testLine = line ? `${line} ${word}` : word;
                    if (ctx.measureText(testLine).width > maxWidth && line) {
                        lines.push(line);
                        line = word;
                    } else {
                        line = testLine;
                    }
                }
                if (line) lines.push(line);
                return { height: lines.length * lineHeight, lines };
            };

            const measured1 = measureTextHeight(headline1, line1Size, fontWeight1, fontFamily1);
            const measured2 = measureTextHeight(headline2, line2Size, fontWeight2, fontFamily2);

            const totalTextHeight = measured1.height + (measured1.height > 0 && measured2.height > 0 ? spacing : 0) + measured2.height;

            let startY;
            switch(position) {
                case 'top':
                    startY = height * 0.1;
                    break;
                case 'center':
                    startY = height / 2 - totalTextHeight / 2;
                    break;
                case 'bottom':
                default:
                    startY = height * 0.9 - totalTextHeight;
                    break;
            }

            const drawTextBlock = (lines: string[], y: number, size: number, color: string, currentOpacity: number, fontFamily: string, fontWeight: string, currentStrokeWidth: number, strokeColor: string, currentStrokeOpacity: number) => {
                ctx.font = `${fontWeight} ${size}px "${fontFamily}", Impact, sans-serif`;
                ctx.textAlign = textAlign;
                ctx.textBaseline = 'top';
                
                let x;
                switch (textAlign) {
                    case 'left': x = width * 0.05; break;
                    case 'right': x = width * 0.95; break;
                    case 'center': default: x = width / 2; break;
                }

                const lineHeight = size * 1.2;
                let currentY = y;

                for (const line of lines) {
                    if (currentStrokeWidth > 0) {
                        ctx.strokeStyle = hexToRgba(strokeColor, currentStrokeOpacity);
                        ctx.lineWidth = Math.max(1, size * (currentStrokeWidth / 100));
                        ctx.strokeText(line, x, currentY);
                    }
                    
                    ctx.fillStyle = hexToRgba(color, currentOpacity);
                    ctx.fillText(line, x, currentY);
                    currentY += lineHeight;
                }
            };
            
            if (measured1.height > 0) {
                drawTextBlock(measured1.lines, startY, line1Size, color1, opacity1, fontFamily1, fontWeight1, strokeWidth1, strokeColor1, strokeOpacity1);
            }
            if(measured2.height > 0) {
                const y2 = startY + measured1.height + (measured1.height > 0 ? spacing : 0);
                drawTextBlock(measured2.lines, y2, line2Size, color2, opacity2, fontFamily2, fontWeight2, strokeWidth2, strokeColor2, strokeOpacity2);
            }
        }
    }, [canvasRef, generationOption, generatedImage, uploadedImage, headline1, headline2, color1, opacity1, color2, opacity2, strokeColor1, strokeOpacity1, strokeColor2, strokeOpacity2, position, textAlign, lineSpacing, getCanvasDimensions, fontFamily1, fontWeight1, fontFamily2, fontWeight2, fontSize1, strokeWidth1, fontSize2, strokeWidth2]);

    useEffect(() => {
        drawCanvas();
    }, [drawCanvas]);
    
    const handleFontFileChange = async (file: File, line: 1 | 2) => {
        if (!file) return;

        const uniqueFontName = `custom-font-line${line}-${Date.now()}`;
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const fontDataUrl = event.target?.result as string;
                const fontFace = new FontFace(uniqueFontName, `url(${fontDataUrl})`);
                await fontFace.load();
                document.fonts.add(fontFace);

                if (line === 1) {
                    setFontFamily1(uniqueFontName);
                    setCustomFontFileName1(file.name);
                } else {
                    setFontFamily2(uniqueFontName);
                    setCustomFontFileName2(file.name);
                }
            } catch (e) {
                console.error("Failed to load font:", e);
                setError("Falha ao carregar o arquivo de fonte.");
            }
        };

        reader.onerror = (e) => {
            console.error("FileReader error:", e);
            setError("Falha ao ler o arquivo de fonte.");
        };

        reader.readAsDataURL(file);
    };

    const handleGeneratePromptAndImage = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        try {
            const prompt = await generateThumbnailPrompt(videoInfo, imageStyle);
            setGeneratedPrompt(prompt);
            const imageBase64 = await generateImage(prompt, aspectRatio);
            setGeneratedImage(`data:image/jpeg;base64,${imageBase64}`);
        } catch (e) {
            setError('Falha ao gerar imagem. Tente novamente.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target?.result as string);
                setGeneratedImage(null);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleNext = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        onNext(canvas.toDataURL('image/png'));
    };
    
    const AlignLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="15" y2="6" /><line x1="3" y1="18" x2="15" y2="18" /></svg>;
    const AlignCenterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="6" y1="6" x2="18" y2="6" /><line x1="6" y1="18" x2="18" y2="18" /></svg>;
    const AlignRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="9" y1="6" x2="21" y2="6" /><line x1="9" y1="18" x2="21" y2="18" /></svg>;

    return (
        <div className="bg-white rounded-xl p-6 sm:p-8 animate-fade-in shadow-lg border border-gray-200/80">
            <h2 className="text-xl font-bold mb-6 text-gray-900">3. Thumbnail e Headline</h2>

            <div className="flex flex-col gap-8">
                {/* Preview Area (Full Width) */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Preview <span className="text-sm text-gray-500 font-normal">(Clique para ampliar)</span></h3>
                     <div 
                        className="relative bg-gray-200 rounded-lg overflow-hidden w-full shadow-md cursor-pointer group border border-gray-200 flex items-center justify-center p-1" 
                        style={{ aspectRatio: '16 / 9' }} 
                        onClick={() => !isLoading && setIsModalOpen(true)}
                    >
                        {isLoading ? (
                            <Loader message="Gerando imagem..."/>
                        ) : (
                            <canvas ref={canvasRef} className="block max-w-full max-h-full rounded-md shadow-inner" />
                        )}
                       <div className="absolute inset-0 z-10 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all pointer-events-none rounded-lg"></div>
                    </div>
                    {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                    {generationOption === 'generate' && generatedPrompt && 
                        <div className="mt-4">
                            <label className="text-sm font-semibold text-gray-600">Prompt Gerado</label>
                             <div className="relative mt-1">
                                <textarea readOnly value={generatedPrompt} className="w-full bg-gray-100 p-3 rounded-md text-gray-600 text-sm italic pr-10 resize-none border-gray-200 border focus:ring-2 focus:ring-purple-500" rows={3}></textarea>
                                <button onClick={() => navigator.clipboard.writeText(generatedPrompt)} title="Copiar prompt" className="absolute top-2 right-2 p-2 bg-gray-200 rounded-md hover:bg-gray-300 transition text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                </button>
                            </div>
                        </div>
                    }
                </div>

                {/* Controls Area (Below Preview) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                    {/* Column 1: Headline 1 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">Headline (Linha 1)</h3>
                        <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50 h-full">
                            <HeadlineControls 
                                line={1} 
                                headline={headline1} setHeadline={setHeadline1} 
                                color={color1} setColor={setColor1} 
                                opacity={opacity1} setOpacity={setOpacity1}
                                fontFamily={fontFamily1} setFontFamily={setFontFamily1} 
                                fontWeight={fontWeight1} setFontWeight={setFontWeight1} 
                                fontSize={fontSize1} setFontSize={setFontSize1} 
                                strokeColor={strokeColor1} setStrokeColor={setStrokeColor1} 
                                strokeWidth={strokeWidth1} setStrokeWidth={setStrokeWidth1}
                                strokeOpacity={strokeOpacity1} setStrokeOpacity={setStrokeOpacity1}
                                onFontFileChange={(file) => handleFontFileChange(file, 1)}
                                customFontFileName={customFontFileName1}
                            />
                        </div>
                    </div>
                     {/* Column 2: Headline 2 */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-gray-800">Headline (Linha 2)</h3>
                         <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50 h-full">
                           <HeadlineControls 
                                line={2} 
                                headline={headline2} setHeadline={setHeadline2} 
                                color={color2} setColor={setColor2} 
                                opacity={opacity2} setOpacity={setOpacity2}
                                fontFamily={fontFamily2} setFontFamily={setFontFamily2} 
                                fontWeight={fontWeight2} setFontWeight={setFontWeight2} 
                                fontSize={fontSize2} setFontSize={setFontSize2} 
                                strokeColor={strokeColor2} setStrokeColor={setStrokeColor2} 
                                strokeWidth={strokeWidth2} setStrokeWidth={setStrokeWidth2}
                                strokeOpacity={strokeOpacity2} setStrokeOpacity={setStrokeOpacity2}
                                onFontFileChange={(file) => handleFontFileChange(file, 2)}
                                customFontFileName={customFontFileName2}
                            />
                        </div>
                    </div>
                    {/* Column 3: General Settings */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Configurações Gerais</h3>
                         <div>
                            <label className="text-sm font-medium text-gray-700">Opção de Geração</label>
                            <div className="flex space-x-2 mt-1">
                                {(['generate', 'upload-headline'] as GenerationOption[]).map(opt => (
                                    <button key={opt} onClick={() => setGenerationOption(opt)} className={`flex-1 text-center p-2 text-sm rounded-md transition ${generationOption === opt ? 'bg-purple-600 text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                        {opt === 'generate' ? 'Gerar com IA' : 'Fazer Upload'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {generationOption === 'generate' && (
                            <div>
                                <label className="text-sm font-medium text-gray-700">Estilo da Imagem</label>
                                 <select value={imageStyle} onChange={e => setImageStyle(e.target.value)} className="w-full mt-1 bg-gray-100 border-gray-300 border p-2 rounded-md text-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm">
                                    {IMAGE_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-200 space-y-2">
                            <label className="text-sm font-medium text-gray-700">Posição Vertical do Texto</label>
                            <div className="flex space-x-2">
                                {(['top', 'center', 'bottom'] as TextPosition[]).map(p => (
                                    <button key={p} onClick={() => setPosition(p)} className={`flex-1 p-2 rounded-md transition text-sm capitalize ${position === p ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 hover:bg-gray-300'}`}>{p === 'top' ? 'Topo' : p === 'center' ? 'Centro' : 'Base'}</button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="text-sm font-medium text-gray-700">Alinhamento Horizontal</label>
                            <div className="flex space-x-2 mt-1">
                                {(['left', 'center', 'right'] as TextAlign[]).map(p => (
                                    <button key={p} onClick={() => setTextAlign(p)} title={`Alinhar à ${p === 'left' ? 'Esquerda' : p === 'center' ? 'Centro' : 'Direita'}`} className={`flex-1 p-2 rounded-md transition flex justify-center ${textAlign === p ? 'bg-purple-600 text-white font-bold' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                       {p === 'left' && <AlignLeftIcon />}
                                       {p === 'center' && <AlignCenterIcon />}
                                       {p === 'right' && <AlignRightIcon />}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-medium text-gray-500">Espaçamento entre Linhas ({lineSpacing}%)</label>
                            <input type="range" min="-5" max="15" value={lineSpacing} onChange={e => setLineSpacing(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1 accent-purple-600"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Proporção</label>
                            <div className="flex space-x-2 mt-1">
                               {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ar => (
                                    <button key={ar} onClick={() => setAspectRatio(ar)} className={`flex-1 p-2 rounded-md transition ${aspectRatio === ar ? 'bg-purple-600 text-white font-bold' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                        {ar}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {generationOption.startsWith('upload') && (
                            <div>
                                 <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer"/>
                            </div>
                        )}
                        {generationOption === 'generate' && (
                            <button onClick={handleGeneratePromptAndImage} disabled={isLoading} className="w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:text-gray-500 transition-transform transform hover:scale-105 shadow-md">
                                {isLoading ? 'Gerando...' : 'Gerar Imagem com IA'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

             <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button onClick={onBack} className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition-colors">Voltar</button>
                <button onClick={handleNext} className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md">Avançar para Resultado Final</button>
             </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
                    <div 
                        className="relative bg-white/5 p-2 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl animate-zoom-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <img 
                            src={canvasRef.current?.toDataURL()} 
                            alt="Thumbnail Preview" 
                            className="rounded-lg block max-w-[85vw] max-h-[85vh]"
                        />
                        <button 
                            onClick={() => setIsModalOpen(false)} 
                            className="absolute -top-4 -right-4 bg-gray-800 rounded-full p-2 text-white hover:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label="Fechar preview"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Section3Thumbnail;