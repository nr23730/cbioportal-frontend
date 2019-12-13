export enum EvidenceLevel {
    NA = "NA",
    I = "I",
    II = "II",
    III = "III",
    IV = "IV"
}

export enum Modified {
    CREATED = "Created",
    MODIFIED = "Modified",
    DELETED = "Deleted"
}


export interface IRecommender {
    credentials: string;
    full_name?: string;
    email?: string;
}

interface IModification {
    recommender: IRecommender;
    modified: Modified;
    timestamp: string;
}

export interface ITherapyRecommendation {
    id: string;
    comment: string;
    reasoning: IReasoning;
    evidenceLevel: EvidenceLevel;
    modifications: IModification[];
    treatments: ITreatment[];
    references: IReference[];
}

export interface IReference {
    name: string;
    pmid: number;
    comment?: string;
}

export interface ITreatment {
    name: string;
    ncit_code?: string;
    synonyms?: string;
}

export interface IReasoning {
    geneticAlterations?: IGeneticAlteration[];
    geneticAlterationsMissing?: IGeneticAlteration[];
    tmb?: number;
    other?: string;
}

export interface IGeneticAlteration {
    entrezGeneId: number;
    hugoSymbol: string;
    proteinChange?: string;
};