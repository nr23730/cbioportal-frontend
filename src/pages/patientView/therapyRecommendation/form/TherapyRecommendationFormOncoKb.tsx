import * as React from "react";
import * as _ from 'lodash';
import {Modal, Button} from "react-bootstrap";
import { ITherapyRecommendation, EvidenceLevel } from "shared/model/TherapyRecommendation";
import Select from 'react-select';
import { IndicatorQueryResp, Treatment } from "cbioportal-frontend-commons/dist/api/generated/OncoKbAPI";
import { getNewTherapyRecommendation } from "../TherapyRecommendationTableUtils";
import { IOncoKbDataWrapper } from "shared/model/OncoKB";


interface ITherapyRecommendationFormOncoKbProps {
    show: boolean;
    patientID: string;
    oncoKbResult?: IOncoKbDataWrapper;
    title: string;
    userEmailAddress: string;
    onHide: ((newTherapyRecommendation?: ITherapyRecommendation) => void);
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
            default: return EvidenceLevel.NA;
        }
    }

    

    public render() {
        let therapyRecommendation: ITherapyRecommendation = getNewTherapyRecommendation(this.props.patientID);
        if(!this.props.oncoKbResult || !this.props.oncoKbResult.result || this.props.oncoKbResult.result instanceof Error) {
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
            let oncoKbResults: IndicatorQueryResp[] = Object.values(this.props.oncoKbResult.result!.indicatorMap!);
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
                                            label: treatment.drugs.map(drug => drug.drugName).toString() + " (" + treatment.level.replace("_"," ") + ")",
                                            value: {result, treatmentIndex}
                                        }))
                                }))}
                                name="oncoKBResult"
                                className="basic-select"
                                classNamePrefix="select"
                                onChange={(selectedOption: {label: string, value: {result: IndicatorQueryResp, treatmentIndex: number}}) => {
                                    let treatmentIndex = selectedOption.value.treatmentIndex;
                                    let result = selectedOption.value.result;
                                    let treatment = result.treatments[treatmentIndex];

                                    // Treatments
                                    treatment.drugs.map(drug => {
                                        therapyRecommendation.treatments.push({
                                            name: drug.drugName,
                                            ncit_code: drug.ncitCode,
                                            synonyms: drug.synonyms.toString()
                                        })
                                    });

                                    // Comment
                                    therapyRecommendation.comment = "Recommendation imported from OncoKB"

                                    // Reasoning
                                    therapyRecommendation.reasoning.geneticAlterations = [{
                                        hugoSymbol: result.query.hugoSymbol,
                                        entrezGeneId: result.query.entrezGeneId,
                                        proteinChange: result.query.alteration
                                    }]

                                    // Evidence Level
                                    therapyRecommendation.evidenceLevel = this.getEvidenceLevel(treatment.level);

                                    // References
                                    treatment.pmids.map(reference => {
                                        therapyRecommendation.references.push({
                                            pmid: _.toInteger(reference),
                                            name: ""
                                        })
                                    })

                                    console.log(selectedOption);
                                }}
                                formatGroupLabel={(data: any) => (
                                    <div style={groupStyles}>
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
                        <Button type="button" bsStyle="primary" onClick={() => {this.props.onHide(therapyRecommendation)}}>Save Changes</Button>
                    </Modal.Footer>
                </Modal>
            );
        }
    }
}