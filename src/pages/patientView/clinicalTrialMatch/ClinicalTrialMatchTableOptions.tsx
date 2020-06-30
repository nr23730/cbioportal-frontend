import Checkbox from './ClinicalTrialMatchTableCheckbox';
import React from 'react';
import { PatientViewPageStore } from '../clinicalInformation/PatientViewPageStore';
import { ClinicalTrialMatchTextfield } from '../clinicalTrialMatch/ClinicalTrialMatchTextfield';
import { RecruitingStatus } from 'shared/enums/ClinicalTrialsGovRecruitingStatus';
import Select from 'react-select';

interface IClinicalTrialOptionsMatchProps {
    store: PatientViewPageStore;
}

interface IClinicalTrialOptionsMatchState {
    checkedItems: Array<string>;
    queryBoxValue: string;
    countryString: string;
    checkedRecruitingItems: Array<string>;
    value?: string;
}

class ClinicalTrialMatchTableOptions extends React.Component<
    IClinicalTrialOptionsMatchProps,
    IClinicalTrialOptionsMatchState
> {
    recruiting_values: RecruitingStatus[] = [];

    constructor(props: IClinicalTrialOptionsMatchProps) {
        super(props);

        this.state = {
            checkedItems: new Array<string>(),
            queryBoxValue: '',
            countryString: '',
            checkedRecruitingItems: new Array<string>(),
        };

        this.recruiting_values = [
            RecruitingStatus.ActiveNotRecruiting,
            RecruitingStatus.Completed,
            RecruitingStatus.EnrollingByInvitation,
            RecruitingStatus.NotYetRecruiting,
            RecruitingStatus.Recruiting,
            RecruitingStatus.Suspended,
            RecruitingStatus.Terminated,
            RecruitingStatus.UnknownStatus,
            RecruitingStatus.Withdrawn,
        ];

        // this.handleChange = this.handleChange.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleCountryChange = this.handleCountryChange.bind(this);
        // this.handleRecChange = this.handleRecChange.bind(this);
    }

    getRecruitingKeyFromValueString(value: string): RecruitingStatus {
        for (let status of this.recruiting_values) {
            if (status.toString() == value) {
                return status;
            }
        }

        return RecruitingStatus.Invalid;
    }

    handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        this.setState(prevState => ({
            checkedItems: prevState.checkedItems,
            queryBoxValue: newValue,
            countryString: prevState.countryString,
            checkedRecruitingItems: prevState.checkedRecruitingItems,
        }));
        console.log(this.state);
    }

    handleCountryChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newValue = e.target.value;
        this.setState(prevState => ({
            checkedItems: prevState.checkedItems,
            queryBoxValue: prevState.queryBoxValue,
            countryString: newValue,
            checkedRecruitingItems: prevState.checkedRecruitingItems,
        }));
        console.log(this.state);
    }

    setSearchParams() {
        var symbols: string[] = this.state.checkedItems;
        var recruiting_stati: RecruitingStatus[] = this.state.checkedRecruitingItems.map(
            item => this.getRecruitingKeyFromValueString(item)
        );

        console.group('TRIALS start search');
        console.log(this.state);
        console.groupEnd();

        this.props.store.setClinicalTrialSearchParams(
            this.state.queryBoxValue,
            this.state.countryString,
            recruiting_stati,
            symbols
        );

        console.log('smybols');
        console.log(symbols);
        console.log(recruiting_stati);

        //this.props.store.setSymbolsToSearch(symbols);
    }

    render() {
        return (
            <React.Fragment>
                <div
                    style={{
                        display: 'block',
                        maxWidth: '40%',
                    }}
                >
                    <div>
                        <input
                            type="text"
                            value={this.state.value}
                            onChange={this.handleTextChange}
                            placeholder="Additional Query"
                            style={{
                                display: 'block',
                                margin: '5px',
                            }}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            value={this.state.value}
                            onChange={this.handleCountryChange}
                            placeholder="Country"
                            style={{
                                display: 'block',
                                margin: '5px',
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'block',
                            marginLeft: '5px',
                            marginBottom: '5px',
                        }}
                    >
                        <Select
                            options={this.props.store.mutationHugoGeneSymbols.map(
                                geneSymbol => ({
                                    label: geneSymbol,
                                    value: geneSymbol,
                                })
                            )}
                            isMulti
                            name="mutationSearch"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select mutations..."
                            onChange={(selectedOption: Array<any>) => {
                                const newMutations = [];
                                if (selectedOption !== null) {
                                    const mutations = selectedOption.map(
                                        item => item.value
                                    );
                                    newMutations.push(...mutations);
                                }
                                this.setState({ checkedItems: newMutations });

                                console.group('TRIALS Mutation Changed');
                                console.log(this.state.checkedItems);
                                console.groupEnd();
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'block',
                            marginLeft: '5px',
                            marginBottom: '5px',
                        }}
                    >
                        <Select
                            options={this.recruiting_values.map(recStatus => ({
                                label: recStatus,
                                value: recStatus,
                            }))}
                            isMulti
                            name="recruitingStatusSearch"
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Select status..."
                            onChange={(selectedOption: Array<any>) => {
                                const newStatuses = [];
                                if (selectedOption !== null) {
                                    const statuses = selectedOption.map(
                                        item => item.value
                                    );
                                    newStatuses.push(...statuses);
                                }
                                this.setState({
                                    checkedRecruitingItems: newStatuses,
                                });
                            }}
                        />
                    </div>
                </div>
                <div>
                    <button
                        onClick={this.setSearchParams.bind(this)}
                        className={'btn btn-default'}
                        style={{
                            display: 'block',
                            marginLeft: '5px',
                        }}
                    >
                        Search
                    </button>
                </div>
            </React.Fragment>
        );
    }
}

export default ClinicalTrialMatchTableOptions;
