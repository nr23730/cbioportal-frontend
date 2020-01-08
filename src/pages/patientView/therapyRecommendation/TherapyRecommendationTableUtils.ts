import { ITherapyRecommendation, EvidenceLevel, Modified, IRecommender } from "shared/model/TherapyRecommendation";
import AppConfig from "appConfig";

export function truncate( s: String, n: number, useWordBoundary: boolean ){
    if (s.length <= n) { return s; }
    var subString = s.substr(0, n-1);
    return (useWordBoundary 
       ? subString.substr(0, subString.lastIndexOf(' ')) 
       : subString) + " [...]";
};

export function getNewTherapyRecommendation(): ITherapyRecommendation {
    let therapyRecommendation: ITherapyRecommendation = {
        id: (new Date()).toISOString(), 
        comment: "",
        reasoning: {},
        evidenceLevel: EvidenceLevel.NA,
        modifications: [
            {
                modified: Modified.CREATED,
                recommender: {
                    credentials: AppConfig.serverConfig.user_email_address
                },
                timestamp: (new Date()).toISOString()
            }
        ],
        references: [],
        treatments: []
    };
    return therapyRecommendation;
}

export function addModificationToTherapyRecommendation(therapyRecommendation: ITherapyRecommendation) : ITherapyRecommendation {
    therapyRecommendation.modifications.push(
        {
            modified: Modified.MODIFIED,
            recommender: {
                credentials: AppConfig.serverConfig.user_email_address
            },
            timestamp: (new Date()).toISOString()
        }
    );
    return therapyRecommendation;
}
