import * as React from 'react';
import { If, Then, Else } from 'react-if';
import {observer} from "mobx-react";
import * as _ from 'lodash';
import {
    ITherapyRecommendation, ITreatment, IGeneticAlteration, IReference
} from "../../../shared/model/TherapyRecommendation";
//import styles from './style/TherapyRecommendation.module.scss';
import { action, computed, observable } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import styles from './style/therapyRecommendation.module.scss';
import SampleManager from "../SampleManager";
import DefaultTooltip, { placeArrowBottomLeft } from "../../../public-lib/components/defaultTooltip/DefaultTooltip";
import { getAgeRangeDisplay } from "./TherapyRecommendationTableUtils";
import AppConfig from 'appConfig';
import { Button } from "react-bootstrap";
import { Mutation } from 'shared/api/generated/CBioPortalAPI';

export type ITherapyRecommendationProps = {
    mutations: Mutation[];
    sampleManager: SampleManager | null;
    therapyRecommendations: ITherapyRecommendation[];
    containerWidth: number;
}

enum ColumnKey {
    THERAPY = 'Therapy',
    COMMENT = 'Comment',
    REASONING = 'Reasoning',
    REFERENCES = 'References',
    EVIDENCE = 'Evidence Level',
    //STATUS = 'Status',
}

enum ColumnWidth {
    ID = 140
}

class TherapyRecommendationTableComponent extends LazyMobXTable<ITherapyRecommendation> {

}

@observer
export default class TherapyRecommendationTable extends React.Component<ITherapyRecommendationProps> {

    // @computed
    // get columnWidths() {
    //     return {
    //         [ColumnKey.ID]: ColumnWidth.ID,
    //         [ColumnKey.COMMENT]: 1 * (this.props.containerWidth - ColumnWidth.ID),
    //         //[ColumnKey.MATCHING_CRITERIA]: 0.65 * (this.props.containerWidth - ColumnWidth.ID)
    //     };
    // }

    private _columns = [{
        name: ColumnKey.THERAPY,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <If condition={therapyRecommendation.treatments.length > 0}>
            <div>
                <span>
                    <img src={require("../../../globalStyles/images/drug.png")} style={{ width: 18, marginTop: -5 }} alt="drug icon"/>
                    <b>{therapyRecommendation.treatments.map((treatment: ITreatment) => treatment.name).join(' + ')}</b></span>
            </div>
            </If>
        ),
        // width: this.columnWidths[ColumnKey.THERAPY]
    }, {
        name: ColumnKey.COMMENT,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <div>{therapyRecommendation.comment}
            </div>
        ),
        // width: this.columnWidths[ColumnKey.COMMENT]
    }, {
        name: ColumnKey.REASONING,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <div>
                <div className={styles.reasoningInfoContainer}>
                    <div className={styles.genomicInfoContainer}>
                        <div>
                            {therapyRecommendation.reasoning.geneticAlterations.map((geneticAlteration: IGeneticAlteration, index:number) => (
                                <div className={styles.reasoningContainer}>
                                    <div className={styles.firstLeft}>
                                        {geneticAlteration && this.getGeneticAlteration(geneticAlteration)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div>
                            <span>Fitting Samples: {this.getSampleIdIcons(therapyRecommendation)}</span>
                        </div>
                    </div>
                </div>
            </div>
        ),
        // width: this.columnWidths[ColumnKey.REASONING]
    }, {
        name: ColumnKey.EVIDENCE,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <div>Level <b>{therapyRecommendation.evidenceLevel}</b>
            </div>
        ),
        // width: this.columnWidths[ColumnKey.EVIDENCE]
    }, {
        name: ColumnKey.REFERENCES,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <If condition={therapyRecommendation.treatments.length > 0}>
            <div>
                    {therapyRecommendation.references.map((reference: IReference) => (
                    <div><a target="_blank" href={"https://www.ncbi.nlm.nih.gov/pubmed/" + reference.pmid}>[{reference.pmid}] {this.truncate(reference.name, 40, true)}</a></div>
                    ))}
            </div>
            </If>
        ),
        // width: this.columnWidths[ColumnKey.REFERENCES]
    },
];



    public getSampleIdIcons(therapyRecommendation : ITherapyRecommendation) {
        let entrezGeneIds = therapyRecommendation.reasoning.geneticAlterations.map((geneticAlteration : IGeneticAlteration) => geneticAlteration.entrezGeneId);
        let groupedMutations = (_.groupBy(this.props.mutations, (mutation: Mutation) => mutation.sampleId));
        let fittingSampleIds : String[] = [];
        for (let sampleId in groupedMutations) {
            let mutations = groupedMutations[sampleId];
            if(entrezGeneIds.every((entrezGeneId:number) => (mutations.map((mutation:Mutation) => mutation.entrezGeneId)).includes(entrezGeneId))) {
                fittingSampleIds.push(sampleId)
            }
        };
        let sortedSampleIds = fittingSampleIds;
        if (fittingSampleIds.length > 1) {
            const sampleOrder = this.props.sampleManager!.getSampleIdsInOrder();
            sortedSampleIds = sampleOrder.filter( ( sampleId: string ) => fittingSampleIds.includes( sampleId ) );
        }
        return (
            <React.Fragment>
                {sortedSampleIds.map((sampleId: string) => (
                    <span className={styles.genomicSpan}>
                        {this.props.sampleManager!.getComponentForSample(sampleId, 1, '')}
                    </span>
                ))}
            </React.Fragment>
        );
    }

    // public getClinicalMatch(clinicalGroupMatch: IClinicalGroupMatch) {
    //     return (
    //         <div className={styles.firstRight}>
    //             <span className={styles.secondLeft}>{getAgeRangeDisplay(clinicalGroupMatch.therapyRecommendationAgeNumerical)}</span>
    //             <span className={styles.secondRight}>
    //                 {clinicalGroupMatch.therapyRecommendationOncotreePrimaryDiagnosis.positive.join(', ')}
    //                 {clinicalGroupMatch.therapyRecommendationOncotreePrimaryDiagnosis.negative.length > 0 &&
    //                     <span>
    //                         <b> except in </b>
    //                         <If condition={clinicalGroupMatch.therapyRecommendationOncotreePrimaryDiagnosis.negative.length < 4}>
    //                             <Then>
    //                                 <span>{clinicalGroupMatch.therapyRecommendationOncotreePrimaryDiagnosis.negative.join(', ').replace(/,(?!.*,)/gmi, ' and')}</span>
    //                             </Then>
    //                             <Else>
    //                                  <DefaultTooltip
    //                                      placement='bottomLeft'
    //                                      trigger={['hover', 'focus']}
    //                                      overlay={this.tooltipClinicalContent(clinicalGroupMatch.therapyRecommendationOncotreePrimaryDiagnosis.negative)}
    //                                      destroyTooltipOnHide={true}
    //                                      onPopupAlign={placeArrowBottomLeft}>
    //                                      <span>{clinicalGroupMatch.therapyRecommendationOncotreePrimaryDiagnosis.negative.length + ` cancer types`}</span>
    //                                 </DefaultTooltip>
    //                             </Else>
    //                         </If>
    //                     </span>
    //                 }
    //             </span>
    //         </div>
    //     );
    // }

    // @action
    // public openCloseFeedbackForm(data?: ISelectedtherapyRecommendationFeedbackFormData) {
    //     this.selectedtherapyRecommendationFeedbackFormData = data;
    // }

    public getGeneticAlteration(geneticAlteration: IGeneticAlteration) {
        return (
            <React.Fragment>
                <div>
                    <span style={{'marginRight': 5}}><b>{geneticAlteration.hugoSymbol}</b> {geneticAlteration.proteinChange}</span>
                    <DefaultTooltip
                        placement='bottomLeft'
                        trigger={['hover', 'focus']}
                        overlay={this.tooltipGenomicContent(geneticAlteration)}
                        destroyTooltipOnHide={false}
                        onPopupAlign={placeArrowBottomLeft}>
                        <i className={'fa fa-info-circle ' + styles.icon}></i>
                    </DefaultTooltip>
                </div>
            </React.Fragment>
        );
    }

    // public getGenomicNotMatch(notMatches: IGenomicMatchType) {
    //     let mutationAndCnagenemicAlterations: string[] = [];
    //     if (notMatches.MUTATION.length > 0) {
    //         mutationAndCnagenemicAlterations = notMatches.MUTATION[0].genomicAlteration;
    //     }
    //     if (notMatches.CNA.length > 0) {
    //         mutationAndCnagenemicAlterations = mutationAndCnagenemicAlterations.concat(notMatches.CNA[0].genomicAlteration);
    //     }
    //     return (
    //         <React.Fragment>
    //             { mutationAndCnagenemicAlterations.length > 0 &&
    //             <div>
    //                 <span className={styles.genomicSpan}>{this.getDescriptionForNotMatches(mutationAndCnagenemicAlterations, 3, 'Negative for alterations in', '')}</span>
    //                 <DefaultTooltip
    //                     placement='bottomLeft'
    //                     trigger={['hover', 'focus']}
    //                     overlay={this.tooltipGenomicContent(mutationAndCnagenemicAlterations)}
    //                     destroyTooltipOnHide={false}
    //                     onPopupAlign={placeArrowBottomLeft}>
    //                     <i className={'fa fa-info-circle ' + styles.icon}></i>
    //                 </DefaultTooltip>
    //             </div>
    //             }
    //             { notMatches.MSI.length > 0 &&
    //             <div>Tumor is not MSI-H</div>
    //             }
    //             { notMatches.WILDTYPE.length > 0 &&
    //             <div>
    //                 <span className={styles.genomicSpan}>{this.getDescriptionForNotMatches(notMatches.WILDTYPE[0].genomicAlteration, 3, 'Tumor doesn\'t have', 'defined by the therapyRecommendation')}</span>
    //                 <DefaultTooltip
    //                     placement='bottomLeft'
    //                     trigger={['hover', 'focus']}
    //                     overlay={this.tooltipGenomicContent(notMatches.WILDTYPE[0].genomicAlteration)}
    //                     destroyTooltipOnHide={false}
    //                     onPopupAlign={placeArrowBottomLeft}>
    //                     <i className={'fa fa-info-circle ' + styles.icon}></i>
    //                 </DefaultTooltip>
    //             </div>
    //             }
    //         </React.Fragment>
    //     );
    // }

    // public getGenomicAlteration(data: string[]) {
    //     const filteredData = data.map((e: string) => e.split(' '));
    //     return (
    //         <div>
    //             {filteredData.map((e: string[]) => (
    //                 <div><b>{e[0]}</b> {e[1]}</div>
    //             ))}
    //         </div>
    //     );
    // }

    public tooltipGenomicContent(geneticAlteration: IGeneticAlteration) {
        return (
            <div className={styles.tooltip}>
                <div>Genomic selection specified in the therapy recommendation:</div>
                <div><b>{geneticAlteration.hugoSymbol}</b> (ID: {geneticAlteration.entrezGeneId}) {geneticAlteration.proteinChange}</div>
            </div>
        );
    }

    // public tooltipClinicalContent(data: string[]) {
    //     return (
    //         <div className={styles.tooltip}>
    //             <ul className={styles.alterationUl}>
    //                 {data.map((cancerType: string) => (
    //                     <li>{cancerType}</li>
    //                 ))}
    //             </ul>
    //         </div>
    //     );
    // }

    // public getDescriptionForNotMatches(genomicAlteration: string[], threshold: number, preContent: string, postContent: string) {
    //     const hugoSymbolSet = new Set([...genomicAlteration].map((s: string) => s.split(' ')[0]));
    //     let genomicAlterationContent = '';
    //     if (hugoSymbolSet.size <= threshold) {
    //         genomicAlterationContent = [...hugoSymbolSet].join(', ');
    //     } else {
    //         genomicAlterationContent = `${hugoSymbolSet.size} genes`;
    //     }
    //     return `${preContent} ${genomicAlterationContent} ${postContent}`;
    // }

    truncate( s: String, n: number, useWordBoundary: boolean ){
        if (s.length <= n) { return s; }
        var subString = s.substr(0, n-1);
        return (useWordBoundary 
           ? subString.substr(0, subString.lastIndexOf(' ')) 
           : subString) + " [...]";
    };

    render() {
        return (
            <div>
                <p style={{marginBottom: '0'}}>Therapy Recommendations:</p>
                <TherapyRecommendationTableComponent
                    data={this.props.therapyRecommendations}
                    columns={this._columns}
                    showCopyDownload={false}
                />
            </div>
        )
    }
}
