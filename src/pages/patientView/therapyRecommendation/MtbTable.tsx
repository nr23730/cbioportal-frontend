import * as React from 'react';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import {
    ITherapyRecommendation,
    IMtb,
    MtbState,
    IDeletions,
} from '../../../shared/model/TherapyRecommendation';
import { computed, makeObservable, observable } from 'mobx';
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

export type IMtbProps = {
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
    mtbs: IMtb[];
    deletions: IDeletions;
    containerWidth: number;
    onDeleteData: (deletions: IDeletions) => void;
    onSaveData: (mtbs: IMtb[]) => void;
    oncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    cnaOncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    pubMedCache?: PubMedCache;
};

export type IMtbState = {
    mtbs: IMtb[];
    deletions: IDeletions;
};

enum ColumnKey {
    INFO = 'MTB Info',
    THERAPYRECOMMENDATIONS = 'Therapy Recommendations',
}

enum ColumnWidth {
    INFO = 140,
}

class MtbTableComponent extends LazyMobXTable<IMtb> {}

@observer
export default class MtbTable extends React.Component<IMtbProps, IMtbState> {
    constructor(props: IMtbProps) {
        super(props);
        this.state = {
            mtbs: props.mtbs,
            deletions: props.deletions,
        };
        makeObservable(this);
    }

    @computed
    get columnWidths() {
        return {
            [ColumnKey.INFO]: ColumnWidth.INFO,
            [ColumnKey.THERAPYRECOMMENDATIONS]:
                this.props.containerWidth - ColumnWidth.INFO,
        };
    }

    @observable selectedTherapyRecommendation:
        | ITherapyRecommendation
        | undefined;
    @observable backupTherapyRecommendation: ITherapyRecommendation | undefined;
    @observable showOncoKBForm: boolean;

    private _columns = [
        {
            name: ColumnKey.INFO,
            render: (mtb: IMtb) => (
                <div>
                    <span className={styles.edit}>
                        <DefaultTooltip
                            trigger={['hover', 'focus']}
                            overlay={getTooltipAuthorContent(
                                'MTB session',
                                mtb.author
                            )}
                            destroyTooltipOnHide={false}
                        >
                            <i className={'fa fa-user-circle'}></i>
                        </DefaultTooltip>
                    </span>
                    <input
                        type="date"
                        value={mtb.date}
                        style={{
                            display: 'block',
                            marginTop: '2px',
                            marginBottom: '2px',
                        }}
                        disabled={this.isDisabled(mtb)}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            const newDate = e.currentTarget.value;
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(x => x.id === mtb.id)!.date = newDate;
                            this.setState({ mtbs: newMtbs });
                        }}
                    ></input>
                    <select
                        defaultValue={mtb.mtbState}
                        style={{ display: 'block', marginBottom: '2px' }}
                        disabled={this.isDisabled(mtb)}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const newState = e.target.value;
                            if (newState === MtbState.FINAL.toUpperCase())
                                if (
                                    !window.confirm(
                                        'Are you sure you wish to finalize this MTB session to disable editing?'
                                    )
                                ) {
                                    const newMtbs = this.state.mtbs.slice();
                                    e.target.value = newMtbs.find(
                                        x => x.id === mtb.id
                                    )!.mtbState;
                                    e.preventDefault();
                                    e.stopPropagation();
                                    this.setState({ mtbs: newMtbs });
                                    return;
                                }
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(
                                x => x.id === mtb.id
                            )!.mtbState = newState as MtbState;
                            this.setState({ mtbs: newMtbs });
                        }}
                    >
                        {Object.entries(MtbState).map(([key, value]) => (
                            <option key={key} value={key}>
                                {value}
                            </option>
                        ))}
                    </select>
                    <LabeledCheckbox
                        checked={mtb.geneticCounselingRecommendation}
                        disabled={this.isDisabled(mtb)}
                        onChange={() => {
                            const newGcr = !mtb.geneticCounselingRecommendation;
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(
                                x => x.id === mtb.id
                            )!.geneticCounselingRecommendation = newGcr;
                            this.setState({ mtbs: newMtbs });
                        }}
                        labelProps={{ style: { marginRight: 10 } }}
                    >
                        <span style={{ marginTop: '-2px' }}>
                            Genetic Counseling
                        </span>
                    </LabeledCheckbox>
                    <LabeledCheckbox
                        checked={mtb.rebiopsyRecommendation}
                        disabled={this.isDisabled(mtb)}
                        onChange={() => {
                            const newRr = !mtb.rebiopsyRecommendation;
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(
                                x => x.id === mtb.id
                            )!.rebiopsyRecommendation = newRr;
                            this.setState({ mtbs: newMtbs });
                        }}
                        labelProps={{ style: { marginRight: 10 } }}
                    >
                        <span style={{ marginTop: '-2px' }}>Rebiopsy</span>
                    </LabeledCheckbox>
                    <textarea
                        title="Comments"
                        rows={4}
                        cols={30}
                        value={mtb.generalRecommendation}
                        placeholder="Comments"
                        disabled={this.isDisabled(mtb)}
                        onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>
                        ) => {
                            const newComment = e.target.value;
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(
                                x => x.id === mtb.id
                            )!.generalRecommendation = newComment;
                            this.setState({ mtbs: newMtbs });
                        }}
                    />
                    <Select
                        options={this.props
                            .sampleManager!.getSampleIdsInOrder()
                            .map(sampleId => ({
                                label: sampleId,
                                value: sampleId,
                            }))}
                        isMulti
                        defaultValue={mtb.samples.map(sampleId => ({
                            label: sampleId,
                            value: sampleId,
                        }))}
                        name="samplesConsidered"
                        className="basic-multi-select"
                        classNamePrefix="select"
                        placeholder="Select considered samples..."
                        isDisabled={this.isDisabled(mtb)}
                        onChange={(selectedOption: Array<any>) => {
                            const newSamples = [];
                            if (selectedOption !== null) {
                                const sampleIds = selectedOption.map(
                                    sampleId => sampleId.value
                                );
                                newSamples.push(...sampleIds);
                            }
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(
                                x => x.id === mtb.id
                            )!.samples = newSamples;
                            this.setState({ mtbs: newMtbs });
                        }}
                    />
                    <span className={styles.edit}>
                        <Button
                            type="button"
                            className={'btn btn-default ' + styles.deleteButton}
                            disabled={this.isDisabled(mtb)}
                            onClick={() =>
                                window.confirm(
                                    'Are you sure you wish to delete this MTB session?'
                                ) && this.deleteMtb(mtb)
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
            name: ColumnKey.THERAPYRECOMMENDATIONS,
            render: (mtb: IMtb) => (
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
                    therapyRecommendations={mtb.therapyRecommendations}
                    containerWidth={WindowStore.size.width - 20}
                    onDelete={this.therapyRecommendationOnDelete(mtb.id)}
                    onAddOrEdit={this.therapyRecommendationOnAddOrEdit(mtb.id)}
                    onReposition={this.therapyRecommendationReposition(mtb.id)}
                    oncoKbData={this.props.oncoKbData}
                    cnaOncoKbData={this.props.cnaOncoKbData}
                    pubMedCache={this.props.pubMedCache}
                    isDisabled={this.isDisabled(mtb)}
                    showButtons={true}
                />
            ),
            width: this.columnWidths[ColumnKey.THERAPYRECOMMENDATIONS],
        },
    ];

    therapyRecommendationOnDelete = (mtbId: string) => (
        therapyRecommendationToDelete: ITherapyRecommendation
    ) => {
        this.state.deletions.therapyRecommendation.push(
            therapyRecommendationToDelete.id
        );
        const newMtbs = this.state.mtbs.slice();
        newMtbs.find(
            x => x.id === mtbId
        )!.therapyRecommendations = newMtbs
            .find(x => x.id === mtbId)!
            .therapyRecommendations.filter(
                (therapyRecommendation: ITherapyRecommendation) =>
                    therapyRecommendationToDelete.id !==
                    therapyRecommendation.id
            );
        this.setState({ mtbs: newMtbs });
        return true;
    };

    therapyRecommendationSuspendAndGetIndex = (mtbId: string) => (
        therapyRecommendationToDelete: ITherapyRecommendation
    ) => {
        var therapyRecommendationIndex = -1;
        const newMtbs = this.state.mtbs.slice();
        newMtbs.find(x => x.id === mtbId)!.therapyRecommendations = newMtbs
            .find(x => x.id === mtbId)!
            .therapyRecommendations.filter(
                (therapyRecommendation: ITherapyRecommendation, index) => {
                    if (
                        therapyRecommendationToDelete.id !==
                        therapyRecommendation.id
                    ) {
                        return true;
                    } else {
                        therapyRecommendationIndex = index;
                        return false;
                    }
                }
            );
        this.setState({ mtbs: newMtbs });
        return therapyRecommendationIndex;
    };

    therapyRecommendationOnAddOrEdit = (mtbId: string) => (
        therapyRecommendationToAdd?: ITherapyRecommendation
    ) => {
        if (therapyRecommendationToAdd === undefined) return false;
        const index = this.therapyRecommendationSuspendAndGetIndex(mtbId)(
            therapyRecommendationToAdd
        );
        const newMtbs = this.state.mtbs.slice();
        if (index === -1) {
            newMtbs
                .find(x => x.id === mtbId)!
                .therapyRecommendations.push(therapyRecommendationToAdd);
        } else {
            newMtbs
                .find(x => x.id === mtbId)!
                .therapyRecommendations.splice(
                    index,
                    0,
                    therapyRecommendationToAdd
                );
        }
        this.setState({ mtbs: newMtbs });
        return true;
    };

    therapyRecommendationReposition = (mtbId: string) => (
        therapyRecommendation: ITherapyRecommendation,
        newIndex: number
    ) => {
        const newMtbs = this.state.mtbs.slice();
        const oldIndex = this.therapyRecommendationSuspendAndGetIndex(mtbId)(
            therapyRecommendation
        );
        newMtbs
            .find(x => x.id === mtbId)!
            .therapyRecommendations.splice(newIndex, 0, therapyRecommendation);
        this.setState({ mtbs: newMtbs });
        return true;
    };

    private addMtb() {
        const now = new Date();
        const newMtbs = this.state.mtbs.slice();
        const newMtb = {
            id: 'mtb_' + this.props.patientId + '_' + now.getTime(),
            generalRecommendation: '',
            geneticCounselingRecommendation: false,
            rebiopsyRecommendation: false,
            therapyRecommendations: [],
            date: now.toISOString().split('T')[0],
            mtbState: Object.keys(MtbState).find(
                key =>
                    MtbState[key as keyof typeof MtbState] === MtbState.PARTIAL
            ),
            samples: [],
            author: getAuthor(),
        } as IMtb;
        newMtbs.push(newMtb);
        this.setState({ mtbs: newMtbs });
    }

    private deleteMtb(mtbToDelete: IMtb) {
        this.state.deletions.mtb.push(mtbToDelete.id);
        const newMtbs = this.state.mtbs
            .slice()
            .filter((mtb: IMtb) => mtbToDelete.id !== mtb.id);
        this.setState({ mtbs: newMtbs });
    }

    private saveMtbs() {
        if (
            this.state.deletions.mtb.length > 0 ||
            this.state.deletions.therapyRecommendation.length > 0
        ) {
            console.log('Save deletions');
            this.props.onDeleteData(this.state.deletions);
        }
        console.group('Save mtbs');
        this.props.onSaveData(this.state.mtbs);
        console.groupEnd();
    }

    private isDisabled(mtb: IMtb) {
        return (
            (mtb.mtbState as MtbState) ===
            Object.keys(MtbState).find(
                key => MtbState[key as keyof typeof MtbState] === MtbState.FINAL
            )
        );
    }

    private test() {
        console.group('Test');
        console.log(this.props);
        console.groupEnd();
    }

    render() {
        return (
            <div>
                <h2 style={{ marginBottom: '0' }}>MTB Sessions</h2>
                <p className={styles.edit}>
                    <Button
                        type="button"
                        className={'btn btn-default ' + styles.addMtbButton}
                        onClick={() => this.addMtb()}
                    >
                        <i
                            className={`fa fa-plus ${styles.marginLeft}`}
                            aria-hidden="true"
                        ></i>{' '}
                        Add MTB
                    </Button>
                    <Button
                        type="button"
                        className={'btn btn-default ' + styles.testButton}
                        onClick={() => this.saveMtbs()}
                    >
                        Save Data
                    </Button>
                    {/* <Button type="button" className={"btn btn-default " + styles.testButton} onClick={() => this.test()}>Test</Button> */}
                </p>
                <MtbTableComponent
                    data={this.state.mtbs}
                    columns={this._columns}
                    showCopyDownload={false}
                    className="mtb-table"
                />
                <SimpleCopyDownloadControls
                    downloadData={() => flattenStringify(this.state.mtbs)}
                    downloadFilename={`mtb_${this.props.patientId}.json`}
                    controlsStyle="BUTTON"
                />
            </div>
        );
    }
}
