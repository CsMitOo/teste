
import { GoogleGenAI, Type } from "@google/genai";
import type { VideoInfo, SEOData, GeneratedHeadline, StructuredDescription } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const descriptionSchema = {
    type: Type.OBJECT,
    properties: {
        opening: { type: Type.STRING, description: "A pergunta envolvente ou afirmação de impacto inicial." },
        mainMessage: { type: Type.STRING, description: "A mensagem principal do vídeo, para ser exibida em negrito." },
        paragraphs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de 2 a 4 parágrafos curtos que detalham o conteúdo."
        },
        benefitsList: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Opcional. Uma lista de 2 a 5 benefícios ou lições chave (bullet points)."
        },
        callToAction: { type: Type.STRING, description: "A chamada para ação final (inscreva-se, curta, etc.)." },
        hashtags: { type: Type.STRING, description: "Uma string única contendo de 3 a 6 hashtags relevantes, separadas por espaços (ex: #tag1 #tag2)." }
    },
    required: ["opening", "mainMessage", "paragraphs", "callToAction", "hashtags"]
};

const seoResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "Um título de vídeo do YouTube otimizado para SEO e CTR, com 50-70 caracteres."
        },
        seoScore: {
            type: Type.INTEGER,
            description: "Uma estimativa da pontuação VidIQ do título em uma escala de 0 a 100, baseada na justificativa."
        },
        scoreJustification: {
            type: Type.STRING,
            description: "Uma breve justificativa (2-3 frases) explicando o porquê da nota de SEO, baseada nos critérios de CTR, relevância e impacto."
        },
        description: descriptionSchema,
        keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Uma lista de exatamente 18 palavras-chave relevantes para o vídeo."
        }
    },
    required: ["title", "seoScore", "scoreJustification", "description", "keywords"],
};

const headlineResponseSchema = {
    type: Type.OBJECT,
    properties: {
        line1: { type: Type.STRING, description: "A primeira linha da headline, curta e impactante." },
        line2: { type: Type.STRING, description: "A segunda linha da headline, complementando a primeira." }
    },
    required: ["line1", "line2"],
};


export const generateSeoContent = async (info: VideoInfo, previousTitle?: string): Promise<SEOData> => {
    
    const regenerationInstruction = previousTitle 
        ? `\n**Instrução Adicional (Regeneração):** A versão anterior do título era "${previousTitle}". Para esta nova versão, adote uma estratégia de copywriting e ângulo COMPLETAMENTE DIFERENTE. Se a anterior foi direta, use curiosidade. Se usou uma pergunta, tente uma afirmação ousada. O objetivo é fornecer uma alternativa criativa e distinta, não uma simples variação.`
        : '';

    const prompt = `
    Aja como um copywriter e estrategista de SEO para YouTube de classe mundial, especialista em otimização de títulos, descrições e palavras-chave para máxima performance, seguindo os princípios de ferramentas como o VidIQ.
    Sua missão é transformar as informações fornecidas em ativos de SEO de alta conversão.

    **Resumo do Vídeo:** ${info.summary}
    ${info.keyword ? `**Título Original (Rascunho):** ${info.keyword}` : ''}
    ${info.niche ? `**Nicho do Canal:** ${info.niche}` : ''}
    ${info.audience ? `**Público-alvo:** ${info.audience}` : ''}
    ${regenerationInstruction}

    **Diretrizes de Geração:**

    1.  **Título (title):**
        - **Tarefa Principal:** Reformule o "Título Original" em uma obra-prima de copywriting para YouTube. Mantenha o tema central, mas eleve-o a um nível profissional.
        - **Estratégias Avançadas:**
            - **Gatilho de Curiosidade:** Crie uma lacuna de informação (Ex: "O Segredo que Ninguém Conta Sobre...").
            - **Benefício Específico e Forte:** Vá além do óbvio (Ex: "Aprenda React" -> "Domine React e Conquiste Vagas de R$15k").
            - **Urgência ou Exclusividade:** "Faça Isso ANTES que Acabe...".
            - **Enquadramento Negativo:** "O ERRO que te Impede de...".
            - **Números e Especificidade:** "7 Passos Infalíveis para...".
        - **Requisitos:** Entre 50 e 70 caracteres. NUNCA use emojis. O título deve ser magnético e prometer uma transformação ou solução clara.

    2.  **Pontuação VidIQ (seoScore & scoreJustification):**
        - **Tarefa Dupla:** Primeiro, você deve criar uma justificativa concisa ('scoreJustification') para a pontuação do título. Em seguida, atribua a pontuação ('seoScore').
        - **Justificativa Crítica:** A justificativa deve analisar o título com base no potencial de CTR, relevância para a busca, competitividade e impacto emocional. Seja honesto e técnico.
        - **Pontuação Realista:** A pontuação DEVE ser uma consequência direta da sua justificativa. NÃO use um número fixo como 88. A pontuação deve variar realisticamente. Um título excelente pode ter 90+, um bom título pode ter entre 70-85, e um título razoável pode ter 60. Seja um avaliador crítico. O valor precisa ser dinâmico.

    3.  **Descrição (description):**
        - **Estrutura de Storytelling:**
            - **opening:** Conecte-se imediatamente com a dor ou o desejo do espectador, relacionado ao título.
            - **mainMessage:** Apresente a GRANDE promessa do vídeo de forma ousada.
            - **paragraphs:** Crie uma narrativa. O que o espectador vai descobrir? Que jornada ele fará?
            - **benefitsList:** (Opcional) Liste os resultados tangíveis que o espectador alcançará.
            - **callToAction:** Crie uma CTA que reforce o valor do canal, não apenas peça para se inscrever.
            - **hashtags:** 5 hashtags estratégicas (2 amplas, 3 de nicho/específicas).
        - **Tom:** Autoridade, confiança e empatia.

    4.  **Palavras-chave (keywords):**
        - Gere uma lista de exatamente 18 termos.
        - **Mix Estratégico:** 5 de cauda curta (alto volume, ex: "emagrecer"), 8 de cauda longa (específicas, ex: "exercícios para perder barriga em casa"), e 5 em formato de pergunta (ex: "como perder peso rápido?").

    Retorne os dados estritamente no formato JSON solicitado, sem exceções.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: seoResponseSchema,
            },
        });

        const jsonString = response.text.trim();
        const parsedData = JSON.parse(jsonString);
        
        if (typeof parsedData.keywords === 'string') {
            parsedData.keywords = parsedData.keywords.split(',').map((k: string) => k.trim());
        }

        return parsedData as SEOData;
    } catch (error) {
        console.error("Error calling Gemini API for SEO content:", error);
        throw new Error("Failed to generate SEO content from Gemini API.");
    }
};

export const generateSummaryForTitle = async (title: string): Promise<string> => {
    const prompt = `Como um roteirista de vídeos para o YouTube, crie um resumo conciso e envolvente (aproximadamente 300 caracteres) baseado no título a seguir. O resumo deve servir como base para o conteúdo do vídeo, capturando a promessa do título e aguçando a curiosidade.
    
    Título do Vídeo: "${title}"
    
    Responda apenas com o texto do resumo gerado.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for summary generation:", error);
        throw new Error("Failed to generate summary from Gemini API.");
    }
};

export const generateThumbnailHeadline = async (videoInfo: VideoInfo, seoData: SEOData): Promise<GeneratedHeadline> => {
    const prompt = `
    Aja como um designer gráfico e psicólogo de marketing, especialista em criar headlines para thumbnails de YouTube que são psicologicamente irresistíveis e geram cliques massivos.
    Baseado no título e resumo, crie uma headline de thumbnail com duas linhas.

    **Título do Vídeo:** ${seoData.title}
    **Resumo do Vídeo:** ${videoInfo.summary}

    **Princípios para uma Headline de Alta Conversão:**
    - **Ultra Conciso:** Máximo de 2-4 palavras por linha. A leitura deve ser instantânea e subconsciente.
    - **Palavras de Poder:** Use termos de alto impacto: "Segredo", "Erro", "Nunca Mais", "O Fim de...", "Isto Muda Tudo".
    - **Contraste e Tensão:** Crie uma relação poderosa entre as linhas. Linha 1 apresenta um problema/ideia; Linha 2 apresenta a solução/reviravolta.
    - **Linha 1 (line1):** O GANCHO. A parte mais forte, intrigante e emocional.
    - **Linha 2 (line2):** O COMPLEMENTO. Contextualiza ou resolve a tensão da Linha 1.
    - **Foco Visual:** O texto deve ser tão impactante quanto a imagem.

    Exemplo Ruim: "Receita Fácil De Bolo"
    Exemplo de Elite: Linha 1: "O BOLO PERFEITO", Linha 2: "EM 5 MINUTOS"
    Exemplo de Elite 2: Linha 1: "NUNCA MAIS ERRE", Linha 2: "NESTA FUNÇÃO"

    Retorne estritamente no formato JSON (line1, line2).
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: headlineResponseSchema,
            },
        });
        const jsonString = response.text.trim();
        return JSON.parse(jsonString) as GeneratedHeadline;
    } catch (error) {
        console.error("Error calling Gemini API for thumbnail headline:", error);
        throw new Error("Failed to generate thumbnail headline from Gemini API.");
    }
};

export const generateThumbnailPrompt = async (videoInfo: VideoInfo, style: string): Promise<string> => {
    const prompt = `
    Aja como um diretor de arte e ilustrador sênior, especializado em criar conceitos visuais para thumbnails do YouTube. Sua tarefa é traduzir a essência de um vídeo em um prompt de imagem (em inglês) para uma IA, garantindo que a imagem seja visualmente impactante, tematicamente correta e otimizada para CTR.

    **Informações do Vídeo:**
    - **Resumo:** ${videoInfo.summary}
    ${videoInfo.keyword ? `- **Tema Central:** ${videoInfo.keyword}` : ''}
    - **Estilo Desejado:** ${style}

    **Requisitos para o Prompt de Imagem (em inglês):**
    1.  **Foco Singular:** A imagem deve ter UM ponto focal claro. Evite cenas complexas ou poluídas. Menos é mais.
    2.  **Emoção Amplificada:** Se houver uma pessoa, a expressão facial deve ser exagerada e clara (choque, alegria extrema, frustração). Ex: "extreme close-up of a man's face, wide-eyed with a look of pure shock".
    3.  **Simbolismo Icônico:** Represente o conceito central com um objeto ou símbolo forte e facilmente reconhecível.
    4.  **Composição de Mestre:** Utilize termos como "dramatic angle", "dynamic composition", "cinematic shot", "rule of thirds".
    5.  **Iluminação e Cor:** A iluminação deve criar drama e profundidade. Use "dramatic lighting", "volumetric light", "rim lighting". As cores devem ser vibrantes e contrastantes. Use "vibrant saturated colors", "high contrast".
    6.  **Estrutura do Prompt (Siga esta ordem):** [Estilo], [Sujeito Principal com Emoção/Ação], [Elemento Simbólico/Contexto], [Composição e Iluminação], [Paleta de Cores e Detalhes].
    7.  **Importante:** NÃO inclua texto na imagem. O prompt deve gerar apenas a ilustração.

    Exemplo: "cinematic photo, extreme close-up of a young developer's face looking shocked at a glowing code on a laptop screen, a single large dollar sign symbol flying out of the screen, dramatic side lighting creating deep shadows, vibrant neon green and purple colors, high contrast."

    Gere apenas o texto do prompt em inglês.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API for thumbnail prompt:", error);
        throw new Error("Failed to generate thumbnail prompt from Gemini API.");
    }
}

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("A API não retornou nenhuma imagem.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for image generation:", error);
        throw new Error("Failed to generate image from Gemini API.");
    }
};