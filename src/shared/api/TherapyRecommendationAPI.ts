import {
    IMtb,
    IDeletions,
    IFollowUp,
} from 'shared/model/TherapyRecommendation';
import * as request from 'superagent';

export function flattenArray(x: Array<any>): Array<any> {
    let y: any[] = [];
    x.forEach(function(elem, index) {
        let elemY: any = {};
        for (var i in elem) {
            if (!elem.hasOwnProperty(i)) {
                elem[i] = elem[i];
            }
            elemY[i] = elem[i];
        }
        y[index] = elemY;
    });
    return y;
}

export async function fetchMtbsUsingGET(url: string) {
    console.log('### MTB ### Calling GET: ' + url);
    return request
        .get(url)
        .then(res => {
            if (res.ok) {
                console.group('### MTB ### Success GETting ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
                const response = JSON.parse(res.text);
                return response.mtbs.map(
                    (mtb: any) =>
                        ({
                            id: mtb.id,
                            therapyRecommendations: mtb.therapyRecommendations,
                            geneticCounselingRecommendation:
                                mtb.geneticCounselingRecommendation,
                            rebiopsyRecommendation: mtb.rebiopsyRecommendation,
                            generalRecommendation: mtb.generalRecommendation,
                            date: mtb.date,
                            mtbState: mtb.mtbState,
                            samples: mtb.samples,
                            author: mtb.author,
                        } as IMtb)
                );
            } else {
                console.group('### MTB ### ERROR res not ok GETting ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();

                return [] as IMtb[];
            }
        })
        .catch(err => {
            console.group('### MTB ### ERROR catched GETting ' + url);
            console.log(err);
            console.groupEnd();

            return [] as IMtb[];
        });
}

export async function fetchFollowupUsingGET(url: string) {
    console.log('### FOLLOWUP ### Calling GET: ' + url);
    return request
        .get(url)
        .then(res => {
            if (res.ok) {
                console.group('### FOLLOWUP ### Success GETting ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
                const response = JSON.parse(res.text);
                return response.followups.map(
                    (followup: any) =>
                        ({
                            id: followup.id,
                            therapyRecommendation:
                                followup.therapyRecommendation,
                            date: followup.date,
                            author: followup.author,
                            therapyRecommendationRealized:
                                followup.therapyRecommendationRealized,
                            sideEffect: followup.sideEffect,
                            responseMonthThree: followup.responseMonthThree,
                            responseMonthSix: followup.responseMonthSix,
                            responseMonthTwelve: followup.responseMonthTwelve,
                            comment: followup.comment,
                        } as IFollowUp)
                );
            } else {
                console.group(
                    '### FOLLOWUP ### ERROR res not ok GETting ' + url
                );
                console.log(JSON.parse(res.text));
                console.groupEnd();

                return [] as IFollowUp[];
            }
        })
        .catch(err => {
            console.group('### FOLLOWUP ### ERROR catched GETting ' + url);
            console.log(err);
            console.groupEnd();

            return [] as IFollowUp[];
        });
}

export async function updateMtbUsingPUT(id: string, url: string, mtbs: IMtb[]) {
    mtbs.forEach(
        mtb =>
            (mtb.therapyRecommendations = flattenArray(
                mtb.therapyRecommendations
            ))
    );
    console.log('### MTB ### Calling PUT: ' + url);
    return request
        .put(url)
        .set('Content-Type', 'application/json')
        .send(
            JSON.stringify({
                id: id,
                mtbs: flattenArray(mtbs),
            })
        )
        .then(res => {
            if (res.ok) {
                console.group('### MTB ### Success PUTting ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
            } else {
                console.group('### MTB ### ERROR res not ok PUTting ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
            }
        })
        .catch(err => {
            console.group('### MTB ### ERROR catched PUTting ' + url);
            console.log(err);
            console.groupEnd();
        });
}

export async function updateFollowupUsingPUT(
    id: string,
    url: string,
    followups: IFollowUp[]
) {
    console.log('### FOLLOWUP ### Calling PUT: ' + url);
    return request
        .put(url)
        .set('Content-Type', 'application/json')
        .send(
            JSON.stringify({
                id: id,
                followups: flattenArray(followups),
            })
        )
        .then(res => {
            if (res.ok) {
                console.group('### FOLLOWUP ### Success PUTting ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
            } else {
                console.group(
                    '### FOLLOWUP ### ERROR res not ok PUTting ' + url
                );
                console.log(JSON.parse(res.text));
                console.groupEnd();
            }
        })
        .catch(err => {
            console.group('### FOLLOWUP ### ERROR catched PUTting ' + url);
            console.log(err);
            console.groupEnd();
        });
}

export async function deleteMtbUsingDELETE(
    id: string,
    url: string,
    deletions: IDeletions
) {
    console.log('### MTB ### Calling DELETE: ' + url);
    return request
        .delete(url)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(deletions))
        .then(res => {
            if (res.ok) {
                deletions.mtb = [];
                deletions.therapyRecommendation = [];
                console.group('### MTB ### Success DELETEing ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
            } else {
                console.group('### MTB ### ERROR res not ok DELETEing ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
            }
        })
        .catch(err => {
            console.group('### MTB ### ERROR catched DELETEing ' + url);
            console.log(err);
            console.groupEnd();
        });
}

export async function deleteFollowupUsingDELETE(
    id: string,
    url: string,
    deletions: IDeletions
) {
    console.log('### FOLLOWUP ### Calling DELETE: ' + url);
    return request
        .delete(url)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(deletions))
        .then(res => {
            if (res.ok) {
                deletions.mtb = [];
                deletions.therapyRecommendation = [];
                console.group('### FOLLOWUP ### Success DELETEing ' + url);
                console.log(JSON.parse(res.text));
                console.groupEnd();
            } else {
                console.group(
                    '### FOLLOWUP ### ERROR res not ok DELETEing ' + url
                );
                console.log(JSON.parse(res.text));
                console.groupEnd();
            }
        })
        .catch(err => {
            console.group('### FOLLOWUP ### ERROR catched DELETEing ' + url);
            console.log(err);
            console.groupEnd();
        });
}
