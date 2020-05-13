import * as React from 'react';
import { observer } from 'mobx-react';
import * as _ from 'lodash';
import {
    ITherapyRecommendation,
    IMtb,
    MtbState,
} from '../../../shared/model/TherapyRecommendation';
import { computed, observable } from 'mobx';
import LazyMobXTable from '../../../shared/components/lazyMobXTable/LazyMobXTable';
import styles from './style/therapyRecommendation.module.scss';
import SampleManager from '../SampleManager';
import { flattenStringify } from './TherapyRecommendationTableUtils';
import { Button } from 'react-bootstrap';
import {
    Mutation,
    ClinicalData,
    DiscreteCopyNumberData,
} from 'cbioportal-ts-api-client';
import { SimpleCopyDownloadControls } from 'shared/components/copyDownloadControls/SimpleCopyDownloadControls';
import { RemoteData } from 'react-mutation-mapper';
import { IOncoKbData } from 'cbioportal-frontend-commons';
import PubMedCache from 'shared/cache/PubMedCache';
import LabeledCheckbox from 'shared/components/labeledCheckbox/LabeledCheckbox';
import WindowStore from 'shared/components/window/WindowStore';
import MtbTherapyRecommendationTable from './MtbTherapyRecommendationTable';
import Select from 'react-select';

export type IMtbProps = {
    patientId: string;
    mutations: Mutation[];
    cna: DiscreteCopyNumberData[];
    clinicalData: ClinicalData[];
    sampleManager: SampleManager | null;
    oncoKbAvailable: boolean;
    mtbs: IMtb[];
    containerWidth: number;
    onSaveData: (mtbs: IMtb[]) => void;
    oncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    cnaOncoKbData?: RemoteData<IOncoKbData | Error | undefined>;
    pubMedCache?: PubMedCache;
};

export type IMtbState = {
    mtbs: IMtb[];
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
        };
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
                    <p>ID: {mtb.id}</p>
                    <input
                        type="date"
                        value={mtb.date}
                        style={{ display: 'block' }}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => {
                            const newDate = e.currentTarget.value;
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(x => x.id === mtb.id)!.date = newDate;
                            this.setState({ mtbs: newMtbs });
                        }}
                    ></input>
                    <select
                        defaultValue={mtb.mtbState}
                        style={{ display: 'block' }}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            const newState = e.target.value;
                            const newMtbs = this.state.mtbs.slice();
                            newMtbs.find(x => x.id === mtb.id)!.mtbState =
                                MtbState[newState as keyof typeof MtbState];
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
                        onChange={() => {
                            const newGcr = !mtb.geneticCounselingRecommendation;
                            const newMtbs = this.state.mtbs.slice();
                            console.group('MTBS');
                            console.log(newMtbs);
                            console.log(mtb);
                            newMtbs.find(
                                x => x.id === mtb.id
                            )!.geneticCounselingRecommendation = newGcr;
                            console.log(newMtbs);
                            this.setState({ mtbs: newMtbs });
                            console.groupEnd();
                        }}
                        labelProps={{ style: { marginRight: 10 } }}
                    >
                        <span style={{ marginTop: '-2px' }}>
                            Genetic Counseling
                        </span>
                    </LabeledCheckbox>
                    <LabeledCheckbox
                        checked={mtb.rebiopsyRecommendation}
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
                            // if (Array.isArray(selectedOption)) {
                            // this.props.onChange(selectedOption.map(option => option.value));
                            // } else if (selectedOption === null) {
                            // this.props.onChange([] as IGeneticAlteration[])
                            // }
                        }}
                    />
                    <span className={styles.edit}>
                        <Button
                            type="button"
                            className={'btn btn-default ' + styles.deleteButton}
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
                    cna={this.props.cna}
                    clinicalData={this.props.clinicalData}
                    sampleManager={this.props.sampleManager}
                    oncoKbAvailable={this.props.oncoKbAvailable}
                    therapyRecommendations={mtb.therapyRecommendations}
                    containerWidth={WindowStore.size.width - 20}
                    onDelete={this.therapyRecommendationOnDelete(mtb.id)}
                    onAddOrEdit={this.therapyRecommendationOnAddOrEdit(mtb.id)}
                    oncoKbData={this.props.oncoKbData}
                    cnaOncoKbData={this.props.cnaOncoKbData}
                    pubMedCache={this.props.pubMedCache}
                />
            ),
            width: this.columnWidths[ColumnKey.THERAPYRECOMMENDATIONS],
        },
    ];

    therapyRecommendationOnDelete = (mtbId: string) => (
        therapyRecommendationToDelete: ITherapyRecommendation
    ) => {
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

    therapyRecommendationOnAddOrEdit = (mtbId: string) => (
        therapyRecommendationToAdd?: ITherapyRecommendation
    ) => {
        if (therapyRecommendationToAdd === undefined) return false;
        this.therapyRecommendationOnDelete(mtbId)(therapyRecommendationToAdd);

        const newMtbs = this.state.mtbs.slice();
        newMtbs
            .find(x => x.id === mtbId)!
            .therapyRecommendations.push(therapyRecommendationToAdd);
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
            mtbState: MtbState.DRAFT,
            samples: [],
        } as IMtb;
        newMtbs.push(newMtb);
        this.setState({ mtbs: newMtbs });
    }

    private deleteMtb(mtbToDelete: IMtb) {
        const newMtbs = this.state.mtbs
            .slice()
            .filter((mtb: IMtb) => mtbToDelete.id !== mtb.id);
        this.setState({ mtbs: newMtbs });
    }

    private test() {
        console.group('Test save mtbs');
        this.props.onSaveData(this.state.mtbs);
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
                        onClick={() => this.test()}
                    >
                        Save Data
                    </Button>
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
