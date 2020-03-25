import * as React from "react";
import * as _ from 'lodash';
import {Modal, Button} from "react-bootstrap";
import { ITherapyRecommendation, EvidenceLevel } from "shared/model/TherapyRecommendation";
import Select from 'react-select';
import { IndicatorQueryResp, Treatment, IndicatorQueryTreatment } from "cbioportal-frontend-commons/dist/api/generated/OncoKbAPI";
import { getNewTherapyRecommendation } from "../TherapyRecommendationTableUtils";
import { IOncoKbDataWrapper } from "shared/model/OncoKB";
import PubMedCache from "shared/cache/PubMedCache";
import { ICache } from "cbioportal-frontend-commons";


interface ITherapyRecommendationFormOncoKbProps {
    show: boolean;
    patientID: string;
    oncoKbResult?: IOncoKbDataWrapper;
    cnaOncoKbResult?: IOncoKbDataWrapper;
    pubMedCache?: PubMedCache;
    title: string;
    userEmailAddress: string;
    onHide: ((newTherapyRecommendation?: ITherapyRecommendation | ITherapyRecommendation[]) => void);
}

export default class TherapyRecommendationFormOncoKb extends React.Component<ITherapyRecommendationFormOncoKbProps, {}> {
    
    
    private getEvidenceLevel(level: string) {
        switch(level.split('_')[1]) {
            case "1": return EvidenceLevel.I;
            case "2": return EvidenceLevel.II;
            case "2A": return EvidenceLevel.IIA;
            case "2B": return EvidenceLevel.IIB;
            case "3A": return EvidenceLevel.IIIA;
            case "3B": return EvidenceLevel.IIIB;
            case "4": return EvidenceLevel.IV;
            case "R1": return EvidenceLevel.R1;
            case "R2": return EvidenceLevel.R2;
            default: return EvidenceLevel.NA;
        }
    }

    private indicationSort(a: string, b: string): number {
        // Increase ascii code of parentheses to put these entries after text in the sort order
        a = a.trim().replace('(','{');
        b = b.trim().replace('(','{');
        return (a < b ? -1 : 1);
    }

    private get pmidData(): ICache<any> {
        let oncoKbResults: IndicatorQueryResp[] = []; 
        let pmids = [] as string[];
        if(this.props.pubMedCache && this.props.pubMedCache.cache) {
            if(this.props.oncoKbResult && this.props.oncoKbResult.result && !(this.props.oncoKbResult.result instanceof Error)) {
                oncoKbResults.push(...Object.values(this.props.oncoKbResult.result!.indicatorMap!))
            }
            if(this.props.cnaOncoKbResult && this.props.cnaOncoKbResult.result && !(this.props.cnaOncoKbResult.result instanceof Error)) {
                oncoKbResults.push(...Object.values(this.props.cnaOncoKbResult.result!.indicatorMap!))
            }
            
            if(oncoKbResults && oncoKbResults.length > 0) {
                oncoKbResults.map(result => (
                    result.treatments.map((treatment, treatmentIndex) => (
                        pmids.push(...treatment.pmids)
                    ))
                ))
                for (const pmid of pmids) {
                    this.props.pubMedCache.get(+pmid);
                }
            }
        }
        return (this.props.pubMedCache && this.props.pubMedCache.cache) || {};
    }

    private therapyRecommendationFromTreatmentEntry(result: IndicatorQueryResp, treatmentIndex: number): ITherapyRecommendation {
        let therapyRecommendation: ITherapyRecommendation = getNewTherapyRecommendation(this.props.patientID);
        let treatment = result.treatments[treatmentIndex];
        let evidenceLevel = this.getEvidenceLevel(treatment.level)

        // Treatments
        treatment.drugs.map(drug => {
            therapyRecommendation.treatments.push({
                name: drug.drugName,
                ncit_code: drug.ncitCode,
                synonyms: drug.synonyms.toString()
            })
        });

        // Comment
        therapyRecommendation.comment.push("Recommendation imported from OncoKB.");
        therapyRecommendation.comment.push(...(treatment.approvedIndications.sort(this.indicationSort)))
        if(evidenceLevel === EvidenceLevel.R1 || evidenceLevel === EvidenceLevel.R2) {
            therapyRecommendation.comment.push("ATTENTION: Evidence level R1/2 represents resistance to the selected drug.");
        }

        // Reasoning
        therapyRecommendation.reasoning.geneticAlterations = [{
            hugoSymbol: result.query.hugoSymbol,
            entrezGeneId: result.query.entrezGeneId,
            alteration: result.query.alteration
        }]

        // Evidence Level
        therapyRecommendation.evidenceLevel = evidenceLevel;

        // References
        treatment.pmids.map(reference => {
            const cacheData = this.pmidData[reference];
            const articleContent = cacheData ? cacheData.data : null;
            console.group("Get Reference Title")
            console.log(articleContent);
            console.groupEnd();
            therapyRecommendation.references.push({
                pmid: _.toInteger(reference),
                name: articleContent ? articleContent.title : ""
            })
        })

        return therapyRecommendation;
    }

    private convertAllTreatmentEntries(results: IndicatorQueryResp[]): ITherapyRecommendation[] {
        let therapyRecommendations: ITherapyRecommendation[] = [];
        
        results.map(result => (
            result.treatments.map((treatment, treatmentIndex) => (
                therapyRecommendations.push(this.therapyRecommendationFromTreatmentEntry(result, treatmentIndex))
            ))
        ));

        return therapyRecommendations;
    }

    public render() {
        let selectedTherapyRecommendation: ITherapyRecommendation;
        this.pmidData;
        if(!this.props.oncoKbResult || !this.props.oncoKbResult.result || this.props.oncoKbResult.result instanceof Error ||
            !this.props.cnaOncoKbResult || !this.props.cnaOncoKbResult.result || this.props.cnaOncoKbResult.result instanceof Error) {
            return (
                <Modal show={this.props.show} onHide={() => {this.props.onHide(undefined)}}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    There was an error querying OncoKB.
                </Modal.Body>
            </Modal>
            )
        } else {
            let oncoKbResults: IndicatorQueryResp[] = []; 
            oncoKbResults.push(...Object.values(this.props.oncoKbResult.result!.indicatorMap!));
            oncoKbResults.push(...Object.values(this.props.cnaOncoKbResult.result!.indicatorMap!));
            const groupStyles = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 18
            };
            const groupBadgeStyles = {
                backgroundColor: '#EBECF0',
                borderRadius: '2em',
                color: '#172B4D',
                display: 'inline-block',
                fontSize: 12,
                lineHeight: '1',
                minWidth: 1,
                padding: '0.16666666666667em 0.5em'
            };
            return (
                <Modal show={this.props.show} onHide={() => {this.props.onHide(undefined)}}>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="form">
                            <div className="form-group">
                                <h5>Select OncoKB entry:</h5>
                                <Select
                                options={oncoKbResults.map(result => ({
                                        label: result.query.hugoSymbol + " " + result.query.alteration, 
                                        options: result.treatments.map((treatment, treatmentIndex) => ({
                                            label: treatment.drugs.map(drug => drug.drugName).join(' + ') + " (" + treatment.level.replace("_"," ") + ")",
                                            value: {result, treatmentIndex}
                                        }))
                                }))}
                                name="oncoKBResult"
                                className="basic-select"
                                classNamePrefix="select"
                                onChange={(selectedOption: {label: string, value: {result: IndicatorQueryResp, treatmentIndex: number}}) => {
                                    let therapyRecommendation = this.therapyRecommendationFromTreatmentEntry(
                                        selectedOption.value.result,
                                        selectedOption.value.treatmentIndex
                                    );
                                    console.log(selectedOption);
                                    selectedTherapyRecommendation = therapyRecommendation;
                                }}
                                formatGroupLabel={(data: any) => (
                                    <div 
                                        style={groupStyles} 
                                        // onClick={(e: any) => {
                                        //     e.stopPropagation();
                                        //     e.preventDefault();
                                        //     console.log('Group heading clicked', data);
                                        // }}
                                    >
                                      <span>{data.label}</span>
                                      <span style={groupBadgeStyles}>{data.options.length}</span>
                                    </div>
                                  )}
                                />
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>                    
                        <Button type="button" bsStyle="default" onClick={() => {this.props.onHide(undefined)}}>Dismiss</Button>
                        <Button type="button" bsStyle="info" onClick={() => {this.props.onHide(this.convertAllTreatmentEntries(oncoKbResults))}}>Add all entries</Button>
                        <Button type="button" bsStyle="primary" onClick={() => {this.props.onHide(selectedTherapyRecommendation)}}>Add entry</Button>
                    </Modal.Footer>
                </Modal>
            );
        }
    }
}