import * as React from 'react';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import {
    ITherapyRecommendation,
    IFollowUp,
    MtbState,
    IDeletions,
    IMtb,
    IResponseCriteria,
} from '../../../shared/model/TherapyRecommendation';
import { computed, observable } from 'mobx';
import LazyMobXTable from '../../../shared/components/lazyMobXTable/LazyMobXTable';
import styles from './style/therapyRecommendation.module.scss';
import SampleManager from '../SampleManager';
import {
    flattenStringify,
    getAuthor,
    getTooltipAuthorContent,
} from './TherapyRecommendationTableUtils';
import { Button } from 'react-bootstrap';
import { DefaultTooltip } from 'cbioportal-frontend-commons';
import {
    Mutation,
    ClinicalData,
    DiscreteCopyNumberData,
} from 'cbioportal-ts-api-client';
import { SimpleCopyDownloadControls } from 'shared/components/copyDownloadControls/SimpleCopyDownloadControls';
import { RemoteData, IOncoKbData } from 'cbioportal-utils';
import PubMedCache from 'shared/cache/PubMedCache';
import LabeledCheckbox from 'shared/components/labeledCheckbox/LabeledCheckbox';
import WindowStore from 'shared/components/window/WindowStore';
import MtbTherapyRecommendationTable from './MtbTherapyRecommendationTable';
import Select from 'react-select';
import { VariantAnnotation, MyVariantInfo } from 'genome-nexus-ts-api-client';
import FollowUpForm from './form/FollowUpForm';
import AppConfig from 'appConfig';
import { Collapse } from 'react-collapse';

export type IFollowUpProps = {
    patientId: string;
    mutations: Mutation[];
    indexedVariantAnnotations:
        | { [genomicLocation: string]: VariantAnnotation }
        | undefined;
    indexedMyVariantInfoAnnotations:
        | { [genomicLocation: string]: MyVariantInfo }
        | undefined;
    cna: DiscreteCopyNumberData[];
    clinicalData: ClinicalData[];
    sampleManager: SampleManager | null;
    oncoKbAvailable: boolean;
    followUps: IFollowUp[];
    mtbs: IMtb[];
    deletions: IDeletions;
    containerWidth: number;
    onDeleteData: (deletions: IDeletions) => void;
    onSaveData: (followUps: IFollowUp[]) => void;
    oncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    cnaOncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    pubMedCache?: PubMedCache;
};

export type IFollowUpState = {
    followUps: IFollowUp[];
    deletions: IDeletions;
};

enum ColumnKey {
    INFO = 'Follow-up',
    THERAPYRECOMMENDATION = 'Therapy Recommendation',
}

enum ColumnWidth {
    INFO = 140,
}

class FollowUpTableComponent extends LazyMobXTable<IFollowUp> {}

@observer
export default class FollowUpTable extends React.Component<
    IFollowUpProps,
    IFollowUpState
> {
    constructor(props: IFollowUpProps) {
        super(props);
        this.state = {
            followUps: props.followUps,
            deletions: props.deletions,
        };
    }

    @computed
    get columnWidths() {
        return {
            [ColumnKey.INFO]: ColumnWidth.INFO,
            [ColumnKey.THERAPYRECOMMENDATION]:
                this.props.containerWidth - ColumnWidth.INFO,
        };
    }

    @observable selectedTherapyRecommendation:
        | ITherapyRecommendation
        | undefined;
    @observable backupTherapyRecommendation: ITherapyRecommendation | undefined;
    @observable showFollowUpForm: boolean;

    private _columns = [
        {
            name: ColumnKey.INFO,
            render: (followUp: IFollowUp) => (
                <div>
                    <span className={styles.edit}>
                        <DefaultTooltip
                            trigger={['hover', 'focus']}
                            overlay={getTooltipAuthorContent(
                                'Follow-up',
                                followUp.author
                            )}
                            destroyTooltipOnHide={false}
                        >
                            <i className={'fa fa-user-circle'}></i>
                        </DefaultTooltip>
                    </span>
                    <input
                        type="date"
                        value={followUp.date}
                        style={{
                            display: 'block',
                            marginTop: '2px',
                            marginBottom: '2px',
                        }}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            const newDate = e.currentTarget.value;
                            const newFollowUps = this.state.followUps.slice();
                            newFollowUps.find(
                                x => x.id === followUp.id
                            )!.date = newDate;
                            this.setState({ followUps: newFollowUps });
                        }}
                    ></input>
                    <LabeledCheckbox
                        checked={followUp.therapyRecommendationRealized}
                        onChange={() => {
                            const newTrr = !followUp.therapyRecommendationRealized;
                            const newFollowUps = this.state.followUps.slice();
                            newFollowUps.find(
                                x => x.id === followUp.id
                            )!.therapyRecommendationRealized = newTrr;
                            this.setState({ followUps: newFollowUps });
                        }}
                        labelProps={{ style: { marginRight: 10 } }}
                    >
                        <span style={{ marginTop: '-2px' }}>Realized</span>
                    </LabeledCheckbox>
                    <Collapse isOpened={followUp.therapyRecommendationRealized}>
                        <LabeledCheckbox
                            checked={followUp.sideEffect}
                            onChange={() => {
                                const newTrr = !followUp.sideEffect;
                                const newFollowUps = this.state.followUps.slice();
                                newFollowUps.find(
                                    x => x.id === followUp.id
                                )!.sideEffect = newTrr;
                                this.setState({ followUps: newFollowUps });
                            }}
                            labelProps={{ style: { marginRight: 10 } }}
                        >
                            <span style={{ marginTop: '-2px' }}>
                                Side effect
                            </span>
                        </LabeledCheckbox>
                        <span>Tumor response criteria</span>
                        <table>
                            <tr>
                                <th>Months</th>
                                <th>PD</th>
                                <th>SD</th>
                                <th>PR</th>
                                <th>CR</th>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'pd3'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'sd3'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'pr3'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'cr3'
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>6</td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'pd6'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'sd6'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'pr6'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'cr6'
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>12</td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'pd12'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'sd12'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'pr12'
                                    )}
                                </td>
                                <td>
                                    {this.getTreatmentResponseCheckbox(
                                        followUp,
                                        followUp.response,
                                        'cr12'
                                    )}
                                </td>
                            </tr>
                        </table>
                    </Collapse>
                    <textarea
                        title="Comments"
                        rows={4}
                        cols={30}
                        value={followUp.comment}
                        placeholder="Comments"
                        onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                        ) => {
                            const newComment = e.target.value;
                            const newFollowUps = this.state.followUps.slice();
                            newFollowUps.find(
                                x => x.id === followUp.id
                            )!.comment = newComment;
                            this.setState({ followUps: newFollowUps });
                        }}
                    />
                    <span className={styles.edit}>
                        <Button
                            type="button"
                            className={'btn btn-default ' + styles.deleteButton}
                            onClick={() =>
                                window.confirm(
                                    'Are you sure you wish to delete this follow-up?'
                                ) && this.deleteFollowUp(followUp)
                            }
                        >
                            <i
                                className={`fa fa-trash ${styles.marginLeft}`}
                                aria-hidden="true"
                            ></i>{' '}
                            Delete
                        </Button>
                    </span>
                </div>
            ),
            width: this.columnWidths[ColumnKey.INFO],
        },
        {
            name: ColumnKey.THERAPYRECOMMENDATION,
            render: (followUp: IFollowUp) => (
                <MtbTherapyRecommendationTable
                    patientId={this.props.patientId}
                    mutations={this.props.mutations}
                    indexedVariantAnnotations={
                        this.props.indexedVariantAnnotations
                    }
                    indexedMyVariantInfoAnnotations={
                        this.props.indexedMyVariantInfoAnnotations
                    }
                    cna={this.props.cna}
                    clinicalData={this.props.clinicalData}
                    sampleManager={this.props.sampleManager}
                    oncoKbAvailable={this.props.oncoKbAvailable}
                    therapyRecommendations={[followUp.therapyRecommendation]}
                    containerWidth={WindowStore.size.width - 20}
                    oncoKbData={this.props.oncoKbData}
                    cnaOncoKbData={this.props.cnaOncoKbData}
                    pubMedCache={this.props.pubMedCache}
                    isDisabled={false}
                    showButtons={false}
                    columnVisibility={{
                        Reasoning: true,
                        Therapy: true,
                        Comment: true,
                        'Evidence Level': true,
                        References: true,
                    }}
                />
            ),
            width: this.columnWidths[ColumnKey.THERAPYRECOMMENDATION],
        },
    ];

    private onHideFollowUpForm(therapyRecommendation: ITherapyRecommendation) {
        this.showFollowUpForm = false;
        console.log(flattenStringify(this.props.mtbs));
        therapyRecommendation && this.addFollowUp(therapyRecommendation);
    }

    private addFollowUp(therapyRecommendation: ITherapyRecommendation) {
        const now = new Date();
        const newFollowUps = this.state.followUps.slice();
        // const emptyResponseCriteria = {pd: false, sd: false, pr: false, cr: false} as IResponseCriteria;
        const emptyResponseCriteria = {
            pd3: false,
            sd3: false,
            pr3: false,
            cr3: false,
            pd6: false,
            sd6: false,
            pr6: false,
            cr6: false,
            pd12: false,
            sd12: false,
            pr12: false,
            cr12: false,
        } as IResponseCriteria;
        const newFollowUp = {
            id: 'followUp_' + this.props.patientId + '_' + now.getTime(),
            therapyRecommendation: therapyRecommendation,
            date: now.toISOString().split('T')[0],
            author: getAuthor(),
            comment: '',
            therapyRecommendationRealized: false,
            sideEffect: false,
            response: emptyResponseCriteria,
            // responseMonthThree: emptyResponseCriteria,
            // responseMonthSix: emptyResponseCriteria,
            // responseMonthTwelve: emptyResponseCriteria
        } as IFollowUp;
        newFollowUps.push(newFollowUp);
        this.setState({ followUps: newFollowUps });
    }

    private deleteFollowUp(followUpToDelete: IFollowUp) {
        this.state.deletions.followUp.push(followUpToDelete.id);
        const newFollowUps = this.state.followUps
            .slice()
            .filter(
                (followUp: IFollowUp) => followUpToDelete.id !== followUp.id
            );
        this.setState({ followUps: newFollowUps });
    }

    private saveFollowUps() {
        if (
            this.state.deletions.followUp.length > 0 ||
            this.state.deletions.therapyRecommendation.length > 0
        ) {
            console.log('Save deletions');
            this.props.onDeleteData(this.state.deletions);
        }
        console.group('Save followUps');
        this.props.onSaveData(this.state.followUps);
        console.groupEnd();
    }

    private test() {
        console.group('Test');
        console.log(this.props);
        console.groupEnd();
    }

    private getTreatmentResponseCheckbox(
        followUp: IFollowUp,
        criteria: IResponseCriteria,
        attribute: keyof IResponseCriteria
    ) {
        return (
            <LabeledCheckbox
                checked={criteria[attribute]}
                onChange={() => {
                    const newCriteria = { ...criteria };
                    newCriteria[attribute] = !criteria[attribute];
                    const newFollowUps = this.state.followUps.slice();
                    newFollowUps.find(
                        x => x.id === followUp.id
                    )!.response = newCriteria;
                    this.setState({ followUps: newFollowUps });
                }}
                labelProps={{ style: { marginRight: 10 } }}
            >
                {/* <span style={{ marginTop: '-2px' }}>{label}</span> */}
            </LabeledCheckbox>
        );
    }

    render() {
        return (
            <div>
                <h2 style={{ marginBottom: '0' }}>Follow-up data</h2>
                <p className={styles.edit}>
                    <Button
                        type="button"
                        className={
                            'btn btn-default ' + styles.addFollowUpButton
                        }
                        onClick={() => (this.showFollowUpForm = true)}
                    >
                        <i
                            className={`fa fa-plus ${styles.marginLeft}`}
                            aria-hidden="true"
                        ></i>{' '}
                        Add Follow-up
                    </Button>
                    <Button
                        type="button"
                        className={'btn btn-default ' + styles.testButton}
                        onClick={() => this.saveFollowUps()}
                    >
                        Save Data
                    </Button>
                    {/* <Button type="button" className={"btn btn-default " + styles.testButton} onClick={() => this.test()}>Test</Button> */}
                    {this.showFollowUpForm && (
                        <FollowUpForm
                            show={this.showFollowUpForm}
                            patientID={this.props.patientId}
                            mtbs={this.props.mtbs}
                            onHide={(
                                therapyRecommendation: ITherapyRecommendation
                            ) => {
                                this.onHideFollowUpForm(therapyRecommendation);
                            }}
                            title="Select therapy recommendation"
                            userEmailAddress={
                                AppConfig.serverConfig.user_email_address
                            }
                        />
                    )}
                </p>
                <FollowUpTableComponent
                    data={this.state.followUps}
                    columns={this._columns}
                    showCopyDownload={false}
                    showFilter={false}
                    showColumnVisibility={false}
                    className="followUp-table"
                />
                <SimpleCopyDownloadControls
                    downloadData={() => flattenStringify(this.state.followUps)}
                    downloadFilename={`followUp_${this.props.patientId}.json`}
                    controlsStyle="BUTTON"
                />
            </div>
        );
    }
}
