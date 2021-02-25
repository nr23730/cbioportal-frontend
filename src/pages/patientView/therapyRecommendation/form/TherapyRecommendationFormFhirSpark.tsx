import * as React from 'react';
import * as _ from 'lodash';
import { Modal, Button } from 'react-bootstrap';
import {
    ITherapyRecommendation,
    EvidenceLevel,
} from 'shared/model/TherapyRecommendation';
import Select from 'react-select';
import { IndicatorQueryResp } from 'oncokb-ts-api-client';
import { getNewTherapyRecommendation } from '../TherapyRecommendationTableUtils';
import { RemoteData } from 'cbioportal-utils';
import { Mutation } from 'cbioportal-ts-api-client';
import { VariantAnnotation, MyVariantInfo } from 'genome-nexus-ts-api-client';
import AlleleFreqColumnFormatter from 'pages/patientView/mutation/column/AlleleFreqColumnFormatter';

interface ITherapyRecommendationFormFhirSparkProps {
    show: boolean;
    patientID: string;
    fhirSparkResult?: RemoteData<ITherapyRecommendation[] | undefined>;
    title: string;
    userEmailAddress: string;
    mutations: Mutation[];
    indexedVariantAnnotations:
        | { [genomicLocation: string]: VariantAnnotation }
        | undefined;
    indexedMyVariantInfoAnnotations:
        | { [genomicLocation: string]: MyVariantInfo }
        | undefined;
    onHide: (
        newTherapyRecommendation?:
            | ITherapyRecommendation
            | ITherapyRecommendation[]
    ) => void;
}

export default class TherapyRecommendationFormFhirSpark extends React.Component<
    ITherapyRecommendationFormFhirSparkProps,
    {}
> {
    private indicationSort(a: string, b: string): number {
        // Increase ascii code of parentheses to put these entries after text in the sort order
        a = a.trim().replace('(', '{');
        b = b.trim().replace('(', '{');
        return a < b ? -1 : 1;
    }

    public render() {
        let selectedTherapyRecommendation: ITherapyRecommendation;
        const fhirSparkResult = this.props.fhirSparkResult?.result;
        if (!this.props.fhirSparkResult || !this.props.fhirSparkResult.result) {
            return (
                <Modal
                    show={this.props.show}
                    onHide={() => {
                        this.props.onHide(undefined);
                    }}
                    backdrop={'static'}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>There was an error querying OncoKB.</Modal.Body>
                </Modal>
            );
        } else {
            const groupStyles = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 18,
            };
            const groupBadgeStyles = {
                backgroundColor: '#EBECF0',
                borderRadius: '2em',
                color: '#172B4D',
                display: 'inline-block',
                fontSize: 12,
                lineHeight: '1',
                minWidth: 1,
                padding: '0.16666666666667em 0.5em',
            };
            return (
                <Modal
                    show={this.props.show}
                    onHide={() => {
                        this.props.onHide(undefined);
                    }}
                    backdrop={'static'}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <form className="form">
                            <div className="form-group">
                                <h5>Select OncoKB entry:</h5>
                                <Select
                                    options={fhirSparkResult?.map(result => ({
                                        label:
                                            result.reasoning
                                                ?.geneticAlterations[0]
                                                ?.hugoSymbol +
                                            ' ' +
                                            result.reasoning
                                                ?.geneticAlterations[0]
                                                ?.alteration,
                                        options: result.treatments.map(
                                            (treatment, treatmentIndex) => ({
                                                label:
                                                    treatment.drugs
                                                        .map(
                                                            drug =>
                                                                drug.drugName
                                                        )
                                                        .join(' + ') +
                                                    ' (' +
                                                    treatment.level.replace(
                                                        '_',
                                                        ' '
                                                    ) +
                                                    ')',
                                                value: {
                                                    result,
                                                    treatmentIndex,
                                                },
                                            })
                                        ),
                                    }))}
                                    name="fhirSparkResult"
                                    className="basic-select"
                                    classNamePrefix="select"
                                    onChange={(selectedOption: {
                                        label: string;
                                        value: {
                                            result: IndicatorQueryResp;
                                            treatmentIndex: number;
                                        };
                                    }) => {
                                        console.log(selectedOption);
                                        selectedTherapyRecommendation =
                                            selectedOption.value.result;
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
                                            <span style={groupBadgeStyles}>
                                                {data.options.length}
                                            </span>
                                        </div>
                                    )}
                                />
                            </div>
                        </form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            type="button"
                            bsStyle="default"
                            onClick={() => {
                                this.props.onHide(undefined);
                            }}
                        >
                            Dismiss
                        </Button>
                        <Button
                            type="button"
                            bsStyle="info"
                            onClick={() => {
                                window.confirm(
                                    'Are you sure you wish to add all entries automatically?'
                                ) && this.props.onHide(fhirSparkResult);
                            }}
                        >
                            Add all entries
                        </Button>
                        <Button
                            type="button"
                            bsStyle="primary"
                            onClick={() => {
                                this.props.onHide(
                                    selectedTherapyRecommendation
                                );
                            }}
                        >
                            Add entry
                        </Button>
                    </Modal.Footer>
                </Modal>
            );
        }
    }
}
