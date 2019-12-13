import { ITherapyRecommendation, EvidenceLevel, Modified, IRecommender } from "shared/model/TherapyRecommendation";

export function truncate( s: String, n: number, useWordBoundary: boolean ){
    if (s.length <= n) { return s; }
    var subString = s.substr(0, n-1);
    return (useWordBoundary 
       ? subString.substr(0, subString.lastIndexOf(' ')) 
       : subString) + " [...]";
};

export function getNewTherapyRecommendation(recommender: IRecommender): ITherapyRecommendation {
    const therapyRecommendation: ITherapyRecommendation = {
        id: "test", 
        comment: "",
        reasoning: {},
        evidenceLevel: EvidenceLevel.NA,
        modifications: [
            {
                modified: Modified.CREATED,
                recommender: {
                    credentials: recommender.credentials
                },
                timestamp: (new Date()).toISOString()
            }
        ],
        references: [],
        treatments: []
    };
    return therapyRecommendation;
}
