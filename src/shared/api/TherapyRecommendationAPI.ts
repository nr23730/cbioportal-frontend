import { IRecommendation } from "shared/model/TherapyRecommendation";
import * as request from 'superagent';



function getJsonStoreUrl() {
    return 'http://' + window.location.hostname + ':3001/patients/';
}

function flattenArray(x: Array<any>) : string {
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



export async function fetchTherapyRecommendationUsingGET(id: string) : Promise<IRecommendation> {
    return request.get(getJsonStoreUrl() + encodeURIComponent(id))
    .then((res)=>{
        // if (!err && res.ok) {
            console.group("Success GETting " + this.patientId);
            console.log(JSON.parse(res.text));
            console.groupEnd();
            let patient = JSON.parse(res.text);
            let geneticCounselingRecommended = patient.geneticCounselingRecommendation;
            let rebiopsyRecommended = patient.rebiopsyRecommendation;
            let commentRecommendation = patient.generalRecommendation;
            var therapyRecommendations = Object.keys(patient.therapyRecommendations).map(function(index){
                return patient.therapyRecommendations[index];
            });
            return {
                geneticCounselingRecommendation: geneticCounselingRecommended,
                rebiopsyRecommendation: rebiopsyRecommended,
                generalRecommendation: commentRecommendation,
                therapyRecommendations: therapyRecommendations
            } as IRecommendation;
            
        // } else {
        //     return null;// {} as IRecommendation;
        // }
    });
}


export async function writeTherapyRecommendation(id:string, recommendation: IRecommendation) {
    request.put(getJsonStoreUrl() + encodeURIComponent(id))
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(
        ({
            id: encodeURIComponent(id), 
            geneticCounselingRecommendation: recommendation.geneticCounselingRecommendation,
            rebiopsyRecommendation: recommendation.rebiopsyRecommendation,
            generalRecommendation: recommendation.generalRecommendation,
            therapyRecommendations: recommendation.therapyRecommendations
        })))
    .end((err, res)=>{
        if (!err && res.ok) {
            console.log("Success PUTting " + id);
        } else {
            console.log("Error PUTting " + id + "... trying POST");
            request.post(getJsonStoreUrl())
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(
                ({
                    id: encodeURIComponent(id), 
                    geneticCounselingRecommendation: recommendation.geneticCounselingRecommendation,
                    rebiopsyRecommendation: recommendation.rebiopsyRecommendation,
                    generalRecommendation: recommendation.generalRecommendation,
                    therapyRecommendations: recommendation.therapyRecommendations
                })))
            .end((err, res)=>{
                if (!err && res.ok) {
                    console.log("Success POSTing " + id);
                } else {
                    console.log("Error POSTing " + id);
                }
            });
        }
    });
}
