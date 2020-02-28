import { ITherapyRecommendation, EvidenceLevel, Modified, IRecommender, IReference } from "shared/model/TherapyRecommendation";
import AppConfig from "appConfig";
import _ from "lodash";
import request from "superagent";


export function truncate( s: string | undefined, n: number, useWordBoundary: boolean ){
    if(!s) return "";
    if (s.length <= n) { return s; }
    var subString = s.substr(0, n-1);
    return (useWordBoundary 
       ? subString.substr(0, subString.lastIndexOf(' ')) 
       : subString) + " [...]";
};

export function getNewTherapyRecommendation(patientId: string): ITherapyRecommendation {
    let now = new Date();
    let timeString = now.toISOString();
    let timeId = now.getTime();
    let therapyRecommendation: ITherapyRecommendation = {
        id: (patientId + "_" + timeId), 
        comment: "",
        reasoning: {},
        evidenceLevel: EvidenceLevel.NA,
        modifications: [
            {
                modified: Modified.CREATED,
                recommender: {
                    credentials: AppConfig.serverConfig.user_email_address
                },
                timestamp: timeString
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


export function isTherapyRecommendationEmpty(therapyRecommendation: ITherapyRecommendation) : boolean {
    if(
    therapyRecommendation.comment === "" &&
    therapyRecommendation.evidenceLevel === EvidenceLevel.NA &&
    _.isEmpty(therapyRecommendation.reasoning) &&
    therapyRecommendation.treatments.length === 0 &&
    therapyRecommendation.references.length === 0) 
    {
        return true;
    } else {
        return false;
    }

}

export function getReferenceName(reference: IReference) : Promise<string> {
    console.log(reference.name);
    return new Promise<string>((resolve, reject) => {
        if(reference.name && reference.name.length !== 0) {
          return name;
        } else {
          const pmid = reference.pmid;
          // TODO better to separate this call to a configurable client
          request.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + pmid + '&retmode=json')
              .end((err, res)=>{
                  if (!err && res.ok) {
                      const response = JSON.parse(res.text);
                      const result = response.result;
                      const uid = result.uids[0];
                      console.log(result[uid].title);
                      resolve(result[uid].title);
                  } else {
                      resolve("");
                  }
              });
          }
      });
      
}

export function flattenStringify(x: Array<any>) : string {
    let y : any = {};
    x.forEach(function(elem, index) {
        let elemY : any = {};
        for(var i in elem) {
            if(!elem.hasOwnProperty(i)) {
                elem[i] = elem[i];
            }
            elemY[i] = elem[i];
        }
        y[index] = elemY;   
    });
    return JSON.stringify(y);
}

export function flattenArray(x: Array<any>) : string {
    let y : any = {};
    x.forEach(function(elem, index) {
        let elemY : any = {};
        for(var i in elem) {
            if(!elem.hasOwnProperty(i)) {
                elem[i] = elem[i];
            }
            elemY[i] = elem[i];
        }
        y[index] = elemY;   
    });
    return y;
}

export function flattenObject(x: any) : any {
    let y : any = {};
    for(var i in x) {
        if(!x.hasOwnProperty(i)) {
            x[i] = x[i];
        }
        y[i] = x[i];
    }
    return y;
}