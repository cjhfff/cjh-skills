import { SearchIntent } from './intent';
export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    publishedDate?: string;
    source?: string;
    citationCount?: number;
}
export interface SearchResponse {
    results: SearchResult[];
    query: string;
    timestamp: string;
    type: 'news' | 'papers';
}
/** Serper API 响应中的 organic 项 */
export interface SerperOrganicItem {
    title?: string;
    link?: string;
    url?: string;
    snippet?: string;
    date?: string;
    source?: string;
    position?: number;
}
/** Semantic Scholar API 响应中的 paper 项 */
export interface SemanticScholarPaper {
    paperId?: string;
    title?: string;
    abstract?: string;
    year?: number;
    authors?: Array<{
        name?: string;
        authorId?: string;
    }>;
    citationCount?: number;
    url?: string;
    externalIds?: {
        DOI?: string;
        arXiv?: string;
        CorpusId?: string;
    };
}
/** arXiv API 响应中的 entry 项 (XML 解析后) */
export interface ArxivEntry {
    title?: {
        _?: string;
    } | string;
    id?: {
        _?: string;
    } | string;
    summary?: {
        _?: string;
    } | string;
    published?: {
        _?: string;
    } | string;
    author?: Array<{
        name?: string;
    }>;
}
/** arXiv API 响应接口 */
export interface ArxivResponse {
    feed?: {
        entry?: ArxivEntry | ArxivEntry[];
    };
}
/** OpenAlex API 响应中的 work 项 */
export interface OpenAlexWork {
    id?: string;
    doi?: string;
    display_name?: string;
    title?: string;
    publication_year?: number;
    abstract?: string;
    cited_by_count?: number;
    authorships?: Array<{
        author?: {
            display_name?: string;
        };
    }>;
}
/** OpenAlex API 响应接口 */
export interface OpenAlexResponse {
    results?: OpenAlexWork[];
    meta?: {
        count?: number;
    };
}
/** NewsAPI API 响应中的 article 项 */
export interface NewsApiArticle {
    source?: {
        id?: string;
        name?: string;
    };
    author?: string;
    title?: string;
    description?: string;
    url?: string;
    urlToImage?: string;
    publishedAt?: string;
    content?: string;
}
/** NewsAPI API 响应接口 */
export interface NewsApiResponse {
    status?: string;
    totalResults?: number;
    articles?: NewsApiArticle[];
}
export declare function searchNews(keyword: string): Promise<SearchResponse>;
export declare function searchPapers(keyword: string): Promise<SearchResponse>;
export declare function smartSearch(keyword: string): Promise<SearchResponse & {
    intent: SearchIntent;
}>;
export declare function searchByType(keyword: string, type: 'news' | 'papers'): Promise<SearchResponse>;
