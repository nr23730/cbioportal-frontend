import * as React from "react";
import * as _ from 'lodash';
import {Modal} from "react-bootstrap";
import { ITherapyRecommendation, EvidenceLevel } from "shared/model/TherapyRecommendation";
import OQLTextArea from "shared/components/GeneSelectionBox/OQLTextArea";
import { TherapyRecommendationFormAlterationPositiveInput, TherapyRecommendationFormAlterationNegativeInput } from "./TherapyRecommendationFormAlterationInput";
import { Mutation } from "shared/api/generated/CBioPortalAPI";


interface ITherapyRecommendationFormProps {
    show: boolean;
    data: ITherapyRecommendation;
    mutations: Mutation[];
    title: string;
    userEmailAddress: string;
    onHide: ((newTherapyRecommendation: ITherapyRecommendation) => void);
}

export default class TherapyRecommendationForm extends React.Component<ITherapyRecommendationFormProps, {}> {
    public render() {
        let therapyRecommendation: ITherapyRecommendation = Object.create(this.props.data);
        return (
            <Modal show={this.props.show} onHide={() => {this.props.onHide(therapyRecommendation)}}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form className="form">
                        <div className="form-group">
                            <h5>Drug(s):</h5>
                            <input
                            type="text"
                            defaultValue={therapyRecommendation.treatments.map(t => t.name).join(' + ')}
                            onChange={(e) => therapyRecommendation.treatments = (e.target.value.replace(/\s/g, "").split('+')).map(s => ({name:s}))}
                            className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <h5>Comment:</h5>
                            <input
                            type="text"
                            defaultValue={therapyRecommendation.comment}
                            onChange={(e) => therapyRecommendation.comment = e.target.value}
                            className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <h5>Evidence Level:</h5>
                            <select 
                            className="form-control" 
                            defaultValue={therapyRecommendation.evidenceLevel}
                            onChange={(e) => therapyRecommendation.evidenceLevel = EvidenceLevel[e.target.value as keyof typeof EvidenceLevel]}
                            >
                                {Object.keys(EvidenceLevel).map(key => (
                                    <option value={key}>{EvidenceLevel[key as any]}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <h5>Reasoning:</h5>
                            <h6>Positive for alterations:</h6>
                            <TherapyRecommendationFormAlterationPositiveInput
                                data={therapyRecommendation}
                                mutations={this.props.mutations}
                                onChange={(alterations) => therapyRecommendation.reasoning.geneticAlterations = alterations}
                            />
                            <h6>Negative for alterations:</h6>
                            <TherapyRecommendationFormAlterationNegativeInput
                                data={therapyRecommendation}
                                mutations={this.props.mutations}
                                onChange={(alterations) => therapyRecommendation.reasoning.geneticAlterationsMissing = alterations}
                            />
                        </div>



                        {/* {(this.boxPlotData.isComplete && this.boxPlotData.result.length > 1) && (
                            <div className="form-group">
                                <h5>Sort By:</h5>

                                <select className="form-control input-sm" value={this.sortBy}
                                        onChange={this.handleSortByChange} title="Select profile">
                                    <option value={"alphabetic"}>Cancer Study</option>
                                    <option value={"median"}>Median</option>
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="checkbox-inline">
                                <input type="checkbox" checked={this.logScale}
                                       onChange={()=>this.logScale = !this.logScale} title="Log scale"/>
                                Log scale
                            </label>
                            { this.mutationDataExists.result && <label className="checkbox-inline">
                                <input type="checkbox" checked={this.showMutations}
                                       onChange={() => this.showMutations = !this.showMutations}
                                       title="Show mutations *"/>
                                Show mutations *
                            </label>}
                            { this.cnaDataExists.result && <label className="checkbox-inline">
                                <input type="checkbox" checked={this.showCna}
                                       onChange={() => this.showCna = !this.showCna}
                                       title="Show copy number alterations"/>
                                Show copy number alterations
                            </label>}
                        </div> */}

                    </form>
                </Modal.Body>
            </Modal>
        );
    }


}
