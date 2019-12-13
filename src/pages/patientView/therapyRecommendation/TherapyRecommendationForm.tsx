import * as React from "react";
import * as _ from 'lodash';
import {Modal} from "react-bootstrap";
import { ITherapyRecommendation, EvidenceLevel } from "shared/model/TherapyRecommendation";


interface ITherapyRecommendationFeedbackProps {
    show: boolean;
    data: ITherapyRecommendation;
    title: string;
    userEmailAddress: string;
    onHide: ((newTherapyRecommendation: ITherapyRecommendation) => void);
}

export default class TherapyRecommendationForm extends React.Component<ITherapyRecommendationFeedbackProps, {}> {
    public render() {
        // let src = '';
        // if (this.props.show) {
        //     const url = "https://docs.google.com/forms/d/e/1FAIpQLSfcoLRG0iWO_qUb4hfzWFQ1toP575EKCTwqPcXE9DmMzuS34w/viewform";
        //     const userParam = `entry.1655318994=${this.props.userEmailAddress || ''}`;
        //     const uriParam = `entry.1782078941=${encodeURIComponent(window.location.href)}`;
        //     src = `${url}?${userParam}&${uriParam}&embedded=true`;
        //     if (!_.isUndefined(this.props.data)) {
        //         const nctIdParam = `entry.1070287537=${this.props.data.nctId || ''}`;
        //         const protocolNoParam = `entry.699867040=${this.props.data.protocolNo || ''}`;
        //         src = `${url}?${userParam}&${uriParam}&${nctIdParam}&${protocolNoParam}&embedded=true`;
        //     }
        // }
        let therapyRecommendation: ITherapyRecommendation = this.props.data;
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
                            value={therapyRecommendation.treatments.toString()}
                            // onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                            //     this.handleChangeInput(e.target.value)
                            // }
                            className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <h5>Comment:</h5>
                            <input
                            type="text"
                            value={therapyRecommendation.comment}
                            // onInput={(e: React.ChangeEvent<HTMLInputElement>) =>
                            //     this.handleChangeInput(e.target.value)
                            // }
                            className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <h5>Evidence Level:</h5>
                            
                            <select className="form-control input-sm" value={therapyRecommendation.evidenceLevel}>
                                        {Object.keys(EvidenceLevel).map(key => (
                                            <option value={key}>{EvidenceLevel[key as any]}</option>
                                          ))}
                            </select>
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
