export enum EvidenceLevel {
    NA,
    m1A,
    m1B,
    m1C,
    m2A,
    m2B,
    m2C,
    m3,
    m4,
}

export enum MtbState {
    DRAFT = 'Draft',
    COMPLETED = 'Completed',
    ARCHIVED = 'Archived',
}

export interface IRecommender {
    credentials: string;
    full_name?: string;
    email?: string;
}

export interface IMtb {
    id: string;
    therapyRecommendations: ITherapyRecommendation[];
    geneticCounselingRecommendation: boolean;
    rebiopsyRecommendation: boolean;
    generalRecommendation: string;
    date: string;
    mtbState: MtbState;
    samples: string[];
    author: string;
}

export interface ITherapyRecommendation {
    id: string;
    comment: string[];
    reasoning: IReasoning;
    evidenceLevel: EvidenceLevel;
    author: string;
    treatments: ITreatment[];
    references: IReference[];
}

export interface IReference {
    name: string;
    pmid?: number;
    comment?: string;
}

export interface ITreatment {
    name: string;
    ncit_code?: string;
    synonyms?: string;
}

export interface IClinicalData {
    attributeId?: string;
    attributeName?: string;
    value: string;
}

export interface IReasoning {
    geneticAlterations?: IGeneticAlteration[];
    clinicalData?: IClinicalData[];
    tmb?: number;
    other?: string;
}

export interface IGeneticAlteration {
    entrezGeneId?: number;
    hugoSymbol: string;
    alteration?: string;
    chromosome?: string;
}
