import { IMtb } from 'shared/model/TherapyRecommendation';
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
            console.log(JSON.parse(err));
            console.groupEnd();

            return [] as IMtb[];
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
            console.log(JSON.parse(err));
            console.groupEnd();
        });
}
