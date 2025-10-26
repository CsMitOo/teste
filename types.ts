// FIX: Removed self-import of SEOData which was causing a conflict with the local declaration.
export interface VideoInfo {
    summary: string;
    keyword?: string;
    niche?: string;
    audience?: string;
}

export interface StructuredDescription {
    opening: string;
    mainMessage: string;
    paragraphs: string[];
    benefitsList?: string[];
    callToAction: string;
    hashtags: string;
}

export interface SEOData {
    title: string;
    seoScore: number;
    scoreJustification: string;
    description: StructuredDescription;
    keywords: string[];
}

export interface GeneratedHeadline {
    line1: string;
    line2: string;
}

export interface HistoryEntry {
    id: number;
    date: string;
    title: string;
    videoInfo: VideoInfo;
    seoData: SEOData;
    thumbnailDataUrl: string;
}