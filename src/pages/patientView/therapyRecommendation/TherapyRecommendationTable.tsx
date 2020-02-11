import * as React from 'react';
import { If, Then, Else } from 'react-if';
import {observer} from "mobx-react";
import * as _ from 'lodash';
import {
    ITherapyRecommendation, ITreatment, IGeneticAlteration, IReference, IClinicalData
} from "../../../shared/model/TherapyRecommendation";
//import styles from './style/TherapyRecommendation.module.scss';
import { action, computed, observable } from "mobx";
import LazyMobXTable from "../../../shared/components/lazyMobXTable/LazyMobXTable";
import styles from './style/therapyRecommendation.module.scss';
import SampleManager from "../SampleManager";
import {DefaultTooltip, placeArrowBottomLeft } from "cbioportal-frontend-commons";
import { truncate, getNewTherapyRecommendation, addModificationToTherapyRecommendation, flattenStringify, isTherapyRecommendationEmpty, flattenObject, flattenArray } from "./TherapyRecommendationTableUtils";
import AppConfig from 'appConfig';
import { Button } from "react-bootstrap";
import { Mutation, ClinicalData } from 'shared/api/generated/CBioPortalAPI';
import TherapyRecommendationForm from './form/TherapyRecommendationForm';
import { SimpleCopyDownloadControls } from 'shared/components/copyDownloadControls/SimpleCopyDownloadControls';

export type ITherapyRecommendationProps = {
    patientId: string;
    mutations: Mutation[];
    clinicalData: ClinicalData[];
    sampleManager: SampleManager | null;
    therapyRecommendations: ITherapyRecommendation[];
    containerWidth: number;
    onDelete: (therapyRecommendation: ITherapyRecommendation) => boolean;
    onAddOrEdit: (therapyRecommendation: ITherapyRecommendation) => boolean;
}

enum ColumnKey {
    THERAPY = 'Therapy',
    COMMENT = 'Comment',
    REASONING = 'Reasoning',
    REFERENCES = 'References',
    EVIDENCE = 'Evidence Level',
    EDIT = 'Edit',
}

enum ColumnWidth {
    ID = 140
}

class TherapyRecommendationTableComponent extends LazyMobXTable<ITherapyRecommendation> {

}

@observer
export default class TherapyRecommendationTable extends React.Component<ITherapyRecommendationProps> {

    constructor (props:ITherapyRecommendationProps) {
        super(props);
        this.state = {therapyRecommendations: props.therapyRecommendations} 
    }

    // @computed
    // get columnWidths() {
    //     return {
    //         [ColumnKey.ID]: ColumnWidth.ID,
    //         [ColumnKey.COMMENT]: 1 * (this.props.containerWidth - ColumnWidth.ID),
    //         //[ColumnKey.MATCHING_CRITERIA]: 0.65 * (this.props.containerWidth - ColumnWidth.ID)
    //     };
    // }

    @observable selectedTherapyRecommendation: ITherapyRecommendation | undefined;

    private _columns = [{
        name: ColumnKey.THERAPY,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <If condition={therapyRecommendation.treatments.length > 0}>
                <div>
                    <span>
                        {therapyRecommendation.treatments.map((treatment: ITreatment) => (
                            <div>
                                <img src={require("../../../globalStyles/images/drug.png")} style={{ width: 18, marginTop: -5 }} alt="drug icon"/>
                                <b>{treatment.name}</b>
                            </div>
                        ))}
                    </span>
                </div>
            </If>
        ),
        // width: this.columnWidths[ColumnKey.THERAPY]
    }, {
        name: ColumnKey.COMMENT,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <div>
                {therapyRecommendation.comment}
            </div>
        ),
        // width: this.columnWidths[ColumnKey.COMMENT]
    }, {
        name: ColumnKey.REASONING,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <div>
                <div className={styles.reasoningInfoContainer}>
                    <div className={styles.genomicInfoContainer}>
                        <div className={styles.reasoningContainer}>
                            <div className={styles.firstLeft}>
                                <div className={styles.secondLeft}>
                                    Positve for alterations:
                                    <div>
                                        {therapyRecommendation.reasoning.geneticAlterations && 
                                            this.getGeneticAlterations(therapyRecommendation.reasoning.geneticAlterations)}
                                    </div>
                                    In samples:
                                    <div>
                                        {therapyRecommendation.reasoning.geneticAlterations && 
                                            this.getSamplesForPostiveAlterations(therapyRecommendation.reasoning.geneticAlterations)}
                                    </div>
                                    </div>
                                <div className={styles.secondRight}>
                                    Negative for alterations:
                                    <div>
                                        {therapyRecommendation.reasoning.geneticAlterationsMissing && 
                                            this.getGeneticAlterationsNegative(therapyRecommendation.reasoning.geneticAlterationsMissing)}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.firstRight}>
                            Clinical data:
                            {therapyRecommendation.reasoning.clinicalData && therapyRecommendation.reasoning.clinicalData.map((clinicalDataItem: IClinicalData) => (
                            <div>
                                {clinicalDataItem.attribute + ": " + clinicalDataItem.value}
                            </div>
                            ))}
                            {/* <div>
                                {therapyRecommendation.reasoning.tmb && "TMB: " + therapyRecommendation.reasoning.tmb}
                            </div>
                            <div>
                                {therapyRecommendation.reasoning.other && "Notes: " + therapyRecommendation.reasoning.other}
                            </div> */}
                            </div>
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
            <If condition={therapyRecommendation.references.length > 0}>
            <div>
                    {therapyRecommendation.references.map((reference: IReference) => (
                        <If condition={reference.pmid && reference.pmid > 0}>
                        <Then>
                            <div><a target="_blank" href={"https://www.ncbi.nlm.nih.gov/pubmed/" + reference.pmid}>[{reference.pmid}] {truncate(reference.name, 40, true)}</a></div>
                        </Then>
                        <Else>
                        <div>{truncate(reference.name, 200, true)}</div>
                        </Else>
                        </If>
                    
                    ))}
            </div>
            </If>
        ),
        // width: this.columnWidths[ColumnKey.REFERENCES]
    }, {
        name: ColumnKey.EDIT,
        render: (therapyRecommendation: ITherapyRecommendation) => (
            <div className={styles.editContainer}>
                <span className={styles.edit}>
                    <Button type="button" className={"btn btn-default " + styles.editButton} onClick={() => this.openEditForm(therapyRecommendation)}><i className={`fa fa-edit ${styles.marginLeft}`} aria-hidden="true"></i> Edit</Button>
                </span>
                <span className={styles.edit}>
                    <Button type="button" className={"btn btn-default " + styles.deleteButton} 
                        onClick={() => window.confirm("Are you sure you wish to delete this item?") && this.openDeleteForm(therapyRecommendation)}>
                        <i className={`fa fa-trash ${styles.marginLeft}`} aria-hidden="true"></i> Delete</Button>
                </span>
            </div>
        ),
        // width: this.columnWidths[ColumnKey.EDIT]
    }
];

    public getSampleIdIcons(fittingSampleIds: string[]) {
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

    public getSamplesForPostiveAlterations(geneticAlterations: IGeneticAlteration[]) {
        if(!geneticAlterations || geneticAlterations.length == 0) return;
        let alterationIds = geneticAlterations.map((geneticAlteration : IGeneticAlteration) => (geneticAlteration.entrezGeneId || "") + (geneticAlteration.proteinChange || ""));
        let groupedMutations = (_.groupBy(this.props.mutations, (mutation: Mutation) => mutation.sampleId));
        let fittingSampleIds : string[] = [];
        for (let sampleId in groupedMutations) {
            let mutations = groupedMutations[sampleId];
            if(alterationIds.every((alterationId:string) => (mutations.map((mutation:Mutation) => mutation.entrezGeneId + mutation.proteinChange)).includes(alterationId))) {
                fittingSampleIds.push(sampleId)
            }
        };
        return this.getSampleIdIcons(fittingSampleIds);
    }


    public getSamplesForNegativeAlteration(geneticAlteration: IGeneticAlteration) {
        if(!geneticAlteration || !geneticAlteration.hugoSymbol) return;
        let groupedMutations = (_.groupBy(this.props.mutations, (mutation: Mutation) => mutation.sampleId));
        let fittingSampleIds : string[] = [];
        for (let sampleId in groupedMutations) {
            let mutations = groupedMutations[sampleId];
            // (mutations.map((mutation:Mutation) => console.log(mutation.gene.hugoGeneSymbol + mutation.proteinChange + " - " + (geneticAlteration.hugoSymbol || "") + (geneticAlteration.proteinChange || ""))));
            if((mutations.map((mutation:Mutation) => mutation.gene.hugoGeneSymbol + mutation.proteinChange)).includes((geneticAlteration.hugoSymbol || "") + (geneticAlteration.proteinChange || ""))) {
                fittingSampleIds.push(sampleId)
            }
        };
        return (
            <div>
                <If condition={fittingSampleIds.length > 0}>
                    <div>
                    <p style={{'color': 'red'}}>Attention: Alteration in samples:</p>
                    {this.getSampleIdIcons(fittingSampleIds)}
                    </div>
                </If>
            </div>
        );
    }


    public openDeleteForm(therapyRecommendation: ITherapyRecommendation) {
        if(this.props.onDelete(therapyRecommendation)) this.updateTherapyRecommendationTable();
    }

    public openEditForm(therapyRecommendation: ITherapyRecommendation) {
        this.selectedTherapyRecommendation = therapyRecommendation;
    }

    public openAddForm() {
        this.selectedTherapyRecommendation = getNewTherapyRecommendation(this.props.patientId);
    }

    public onHideAddEditForm(newTherapyRecommendation?: ITherapyRecommendation) {
        console.group("On hide add edit form");
        console.log(flattenStringify(this.props.therapyRecommendations));
        console.groupEnd();
        this.selectedTherapyRecommendation = undefined;
        if(newTherapyRecommendation == undefined || isTherapyRecommendationEmpty(newTherapyRecommendation)) return;
        newTherapyRecommendation = addModificationToTherapyRecommendation(newTherapyRecommendation);
        if(this.props.onAddOrEdit(newTherapyRecommendation)) this.updateTherapyRecommendationTable();
    }

    public updateTherapyRecommendationTable() {
        this.setState(this.props.therapyRecommendations);
        console.group("Updating table");
        console.log(flattenStringify(this.props.therapyRecommendations));
        console.groupEnd();
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
    // public openCloseTherapyRecommendationForm(data?: ITherapyRecommendation) {
    //     this.selectedTherapyRecommendation = data;
    // }

    public getGeneticAlterations(geneticAlterations: IGeneticAlteration[]) {
        return (
            <React.Fragment>
                <If condition={geneticAlterations && geneticAlterations.length > 0}>
                    <div>
                        {geneticAlterations && geneticAlterations.map((geneticAlteration: IGeneticAlteration, index:number) => (
                            <div>
                                {geneticAlteration && this.getGeneticAlteration(geneticAlteration)}
                            </div>
                        ))}
                    </div>
                </If>
            </React.Fragment>
        );
    }

    public getGeneticAlterationsNegative(geneticAlterations: IGeneticAlteration[]) {
        return (
            <React.Fragment>
                <If condition={geneticAlterations && geneticAlterations.length > 0}>
                    <div>
                        {geneticAlterations && geneticAlterations.map((geneticAlteration: IGeneticAlteration, index:number) => (
                            <div>
                                {geneticAlteration && this.getGeneticAlteration(geneticAlteration)}
                                <div>
                                    {this.getSamplesForNegativeAlteration(geneticAlteration)}
                                </div>
                            </div>
                        ))}
                    </div>
                </If>
            </React.Fragment>
        );
    }

    public getGeneticAlteration(geneticAlteration: IGeneticAlteration) {
        return (
            <React.Fragment>
                <div>
                    <span style={{'marginRight': 5}}><b>{geneticAlteration.hugoSymbol}</b> {geneticAlteration.proteinChange || "any"}</span>
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

    public tooltipGenomicContent(geneticAlteration: IGeneticAlteration) {
        return (
            <div className={styles.tooltip}>
                <div>Genomic selection specified in the therapy recommendation:</div>
                <div><b>{geneticAlteration.hugoSymbol}</b> (ID: {geneticAlteration.entrezGeneId}) {geneticAlteration.proteinChange || "any"}</div>
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



    render() {
        return (
            <div>
                <h2 style={{marginBottom: '0'}}>Therapy Recommendations</h2>
                <p className={styles.edit}>
                    <Button type="button" className={"btn btn-default " + styles.addButton} onClick={() => this.openAddForm()}><i className={`fa fa-plus ${styles.marginLeft}`} aria-hidden="true"></i> Add</Button>
                </p>
                {this.selectedTherapyRecommendation &&
                    <TherapyRecommendationForm
                        show={!!this.selectedTherapyRecommendation}
                        data={this.selectedTherapyRecommendation}
                        mutations={this.props.mutations}
                        clinicalData={this.props.clinicalData}
                        onHide={(therapyRecommendation: ITherapyRecommendation) => {this.onHideAddEditForm(therapyRecommendation)}}
                        title="Edit therapy recommendation"
                        userEmailAddress={AppConfig.serverConfig.user_email_address}
                    />
                }
                <TherapyRecommendationTableComponent
                    data={this.props.therapyRecommendations}
                    columns={this._columns}
                    showCopyDownload={false}
                />
                <SimpleCopyDownloadControls
                    // className={classnames("pull-right", styles.copyDownloadControls)}
                    downloadData={() => flattenStringify(this.props.therapyRecommendations)} //JSON.stringify(this.props.therapyRecommendations)} 
                    downloadFilename={`TherapyRecommendation_${this.props.patientId}.json`}
                    controlsStyle="BUTTON"
                    // containerId={this.props.id}
                />
            </div>
        )
    }
}
