import _ from 'lodash';
import { DefaultTooltip, ICache, LEVELS } from 'cbioportal-frontend-commons';
import { ArticleAbstract, IndicatorQueryTreatment } from 'oncokb-ts-api-client';
import { observer } from 'mobx-react';
import * as React from 'react';
import ReactTable from 'react-table';

import {
    getPositionalVariant,
    getTumorTypeName,
    levelIconClassNames,
    mergeAlterations,
    normalizeLevel,
} from '../../util/OncoKbUtils';
import {
    defaultArraySortMethod,
    defaultSortMethod,
} from '../../util/ReactTableUtils';
import OncoKbHelper from './OncoKbHelper';
import ReferenceList from './ReferenceList';
import SummaryWithRefs from './SummaryWithRefs';

import mainStyles from './main.module.scss';
import './oncoKbTreatmentTable.scss';
import request from 'superagent';

type OncoKbTreatmentTableProps = {
    variant: string;
    treatments: IndicatorQueryTreatment[];
    pmidData: ICache<any>;
};

type EmaDrugInfo = {
    infoAvailable: boolean;
    activeSubstance: string;
    conditionIndication: string;
    authorisationDate: string;
    authorisationHolder: string;
    medicineName: string;
    url: string;
};

interface DrugInfo {
    [key: string]: [EmaDrugInfo];
}

type OncoKbTreatmentTableState = {
    drugInfos: DrugInfo;
};

@observer
export default class OncoKbTreatmentTable extends React.Component<
    OncoKbTreatmentTableProps,
    OncoKbTreatmentTableState
> {
    constructor(props: OncoKbTreatmentTableProps) {
        super(props);
        this.state = {
            drugInfos: new Object() as DrugInfo,
        };
        this.props.treatments.map(treatment =>
            treatment.drugs.map(drug => this.promiseDrugInfo(drug.drugName))
        );
    }

    levelTooltipContent = (level: string) => {
        return (
            <div style={{ maxWidth: '200px' }}>
                {OncoKbHelper.LEVEL_DESC[level]}
            </div>
        );
    };

    treatmentTooltipContent = (
        abstracts: ArticleAbstract[],
        pmids: number[],
        pmidData: ICache<any>,
        description?: string
    ) => {
        return abstracts.length > 0 || pmids.length > 0 ? (
            () => (
                <div className={mainStyles['tooltip-refs']}>
                    {description !== undefined && description.length > 0 ? (
                        <SummaryWithRefs
                            content={description}
                            type={'tooltip'}
                            pmidData={this.props.pmidData}
                        />
                    ) : (
                        <ReferenceList
                            pmids={pmids}
                            pmidData={pmidData}
                            abstracts={abstracts}
                        />
                    )}
                </div>
            )
        ) : (
            <span />
        );
    };

    promiseDrugInfo = (drug: string) =>
        new Promise<EmaDrugInfo>((resolve, reject) => {
            request
                .get(
                    'https://componc.github.io/cancerdrugs/drugs/' +
                        drug +
                        '.json'
                )
                .end((err, res) => {
                    if (!err && res.ok) {
                        const response = JSON.parse(res.text);
                        const emaEpar = response.emaEpar;
                        if (emaEpar.length === 0) {
                            const emaInfo = {
                                infoAvailable: false,
                            } as EmaDrugInfo;
                            this.setState({
                                drugInfos: _.extend(this.state.drugInfos, {
                                    [drug]: [emaInfo],
                                }),
                            });
                        } else {
                            const emaInfos = new Array<EmaDrugInfo>();
                            emaEpar.map((emaEparEntry: any) => {
                                const emaInfo = {
                                    infoAvailable: true,
                                    activeSubstance:
                                        emaEparEntry.activeSubstance,
                                    conditionIndication:
                                        emaEparEntry.conditionIndication,
                                    authorisationDate:
                                        emaEparEntry.marketingAuthorisationDate,
                                    authorisationHolder:
                                        emaEparEntry.marketingAuthorisationHolder,
                                    medicineName: emaEparEntry.medicineName,
                                    url: emaEparEntry.url,
                                } as EmaDrugInfo;
                                emaInfos.push(emaInfo);
                            });
                            this.setState({
                                drugInfos: _.extend(this.state.drugInfos, {
                                    [drug]: emaInfos,
                                }),
                            });
                        }
                    } else {
                        this.setState({
                            drugInfos: _.extend(this.state.drugInfos, {
                                [drug]: [],
                            }),
                        });
                    }
                });
        });

    emaTooltipStyle = (drugName: string) => {
        const drugInfo = this.state.drugInfos[drugName];
        if (!drugInfo) {
            return 'fa fa-spinner fa-spin fa-lg';
        } else if (drugInfo.length < 1) {
            return 'fa fa-eur text-muted fa-lg';
        } else if (!drugInfo[0].infoAvailable) {
            return 'fa fa-eur text-danger fa-lg';
        } else {
            return 'fa fa-eur text-primary fa-lg';
        }
    };

    emaTooltipContent = (drugName: string) => {
        const drugInfo = this.state.drugInfos[drugName];
        if (!drugInfo) {
            return (
                <div style={{ maxWidth: '400px' }}>
                    Getting EMA information...
                </div>
            );
        } else if (drugInfo.length < 1) {
            return (
                <div style={{ maxWidth: '400px' }}>
                    No entry found in cancerdrugs. <br />
                    <a
                        href={
                            'http://cancerdrugs.s3-website.eu-central-1.amazonaws.com'
                        }
                    >
                        Search on cancerdrugs
                    </a>
                </div>
            );
        } else if (!drugInfo[0].infoAvailable) {
            return (
                <div style={{ maxWidth: '400px' }}>
                    {drugName} is <b>not</b> authorized in the EU. <br />
                    <a
                        href={
                            'http://cancerdrugs.s3-website.eu-central-1.amazonaws.com/drug/' +
                            drugName
                        }
                    >
                        More info on cancerdrugs
                    </a>
                </div>
            );
        } else {
            return (
                <div style={{ maxWidth: '400px' }}>
                    {drugInfo.map(drugInfoEntry =>
                        this.emaTooltipEntry(drugName, drugInfoEntry)
                    )}
                    <a
                        href={
                            'http://cancerdrugs.s3-website.eu-central-1.amazonaws.com/drug/' +
                            drugName
                        }
                    >
                        More info on cancerdrugs
                    </a>
                </div>
            );
        }
    };

    emaTooltipEntry = (drugName: string, drugInfo: EmaDrugInfo) => {
        return (
            <span>
                {drugName} is authorized in the EU under the name of{' '}
                {drugInfo.medicineName} since{' '}
                {drugInfo.authorisationDate.split(' ')[0]} by{' '}
                {drugInfo.authorisationHolder} (
                <a href={drugInfo.url}>more info</a>). <br />
                Authorized indication: {drugInfo.conditionIndication} <br />
            </span>
        );
    };

    readonly columns = [
        {
            id: 'level',
            Header: <span>Level</span>,
            accessor: 'level',
            maxWidth: 45,
            sortMethod: (a: string, b: string) =>
                defaultSortMethod(
                    LEVELS.all.indexOf(normalizeLevel(a) || ''),
                    LEVELS.all.indexOf(normalizeLevel(b) || '')
                ),
            Cell: (props: { value: string }) => {
                const normalizedLevel = normalizeLevel(props.value) || '';
                return (
                    <DefaultTooltip
                        overlay={this.levelTooltipContent(normalizedLevel)}
                        placement="left"
                        trigger={['hover', 'focus']}
                        destroyTooltipOnHide={true}
                    >
                        <i
                            className={levelIconClassNames(normalizedLevel)}
                            style={{ margin: 'auto' }}
                        />
                    </DefaultTooltip>
                );
            },
        },
        {
            id: 'alterations',
            Header: <span>Alteration(s)</span>,
            accessor: 'alterations',
            minWidth: 80,
            sortMethod: (a: string[], b: string[]) =>
                defaultArraySortMethod(a, b),
            Cell: (props: { value: string[] }) => {
                const mergedAlteration = mergeAlterations(props.value);
                let content = <span>{mergedAlteration}</span>;
                if (props.value.length > 5) {
                    const lowerCasedQueryVariant = this.props.variant.toLowerCase();
                    let matchedAlteration = _.find(
                        props.value,
                        alteration =>
                            alteration.toLocaleLowerCase() ===
                            lowerCasedQueryVariant
                    );
                    if (!matchedAlteration) {
                        matchedAlteration = getPositionalVariant(
                            this.props.variant
                        );
                    }
                    let pickedAlteration =
                        matchedAlteration === undefined
                            ? props.value[0]
                            : matchedAlteration;
                    content = (
                        <span>
                            {pickedAlteration} and{' '}
                            <DefaultTooltip
                                overlay={
                                    <div style={{ maxWidth: '400px' }}>
                                        {mergedAlteration}
                                    </div>
                                }
                                placement="right"
                                destroyTooltipOnHide={true}
                            >
                                <a>
                                    {props.value.length - 1} other alterations
                                </a>
                            </DefaultTooltip>
                        </span>
                    );
                }
                return (
                    <div style={{ whiteSpace: 'normal', lineHeight: '1rem' }}>
                        {content}
                    </div>
                );
            },
        },
        {
            id: 'treatment',
            Header: <span>Drug(s)</span>,
            accessor: 'drugs',
            Cell: (props: { original: IndicatorQueryTreatment }) => (
                <div style={{ whiteSpace: 'normal', lineHeight: '1rem' }}>
                    {/* {props.original.drugs
                        .map(drug => drug.drugName && this.promiseDrugInfo(drug.drugName))
                        .join(' + ')} */}
                    {props.original.drugs.map(drug => (
                        <div>
                            <span style={{ marginRight: '5px' }}>
                                {drug.drugName}
                            </span>
                            <DefaultTooltip
                                placement="left"
                                trigger={['hover', 'focus']}
                                overlay={
                                    <div>
                                        {this.emaTooltipContent(drug.drugName)}
                                    </div>
                                }
                                destroyTooltipOnHide={true}
                            >
                                <i
                                    className={this.emaTooltipStyle(
                                        drug.drugName
                                    )}
                                ></i>
                            </DefaultTooltip>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            id: 'cancerType',
            Header: (
                <span>
                    Level-associated
                    <br />
                    cancer type(s)
                </span>
            ),
            accessor: 'levelAssociatedCancerType',
            minWidth: 120,
            Cell: (props: { original: IndicatorQueryTreatment }) => (
                <div style={{ whiteSpace: 'normal', lineHeight: '1rem' }}>
                    {getTumorTypeName(props.original.levelAssociatedCancerType)}
                </div>
            ),
        },
        {
            id: 'referenceList',
            Header: <span />,
            sortable: false,
            maxWidth: 25,
            Cell: (props: { original: IndicatorQueryTreatment }) =>
                (props.original.abstracts.length > 0 ||
                    props.original.pmids.length > 0) && (
                    <DefaultTooltip
                        overlay={this.treatmentTooltipContent(
                            props.original.abstracts,
                            props.original.pmids.map(pmid => Number(pmid)),
                            this.props.pmidData,
                            props.original.description
                        )}
                        placement="right"
                        trigger={['hover', 'focus']}
                        destroyTooltipOnHide={true}
                    >
                        <i className="fa fa-book" />
                    </DefaultTooltip>
                ),
        },
    ];

    public render() {
        return (
            <div className="oncokb-treatment-table">
                <ReactTable
                    data={this.props.treatments}
                    columns={this.columns}
                    showPagination={false}
                    pageSize={this.props.treatments.length}
                    className="-striped -highlight"
                />
            </div>
        );
    }
}
