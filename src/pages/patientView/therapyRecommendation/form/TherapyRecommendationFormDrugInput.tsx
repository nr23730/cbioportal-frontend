import React from 'react';
import {
    ITherapyRecommendation,
    ITreatment,
} from 'shared/model/TherapyRecommendation';
import CreatableSelect from 'react-select/creatable';
import _ from 'lodash';
import { Drugs } from './data/Drugs';

interface TherapyRecommendationFormDrugInputProps {
    data: ITherapyRecommendation;
    onChange: (drugs: ITreatment[]) => void;
}

type MyOption = { label: string; value: ITreatment | string };

export default class TherapyRecommendationFormDrugInput extends React.Component<
    TherapyRecommendationFormDrugInputProps,
    {}
> {
    public render() {
        let allDrugs = Drugs;

        let drugOptions = allDrugs.map((drug: ITreatment) => ({
            value: drug,
            label: drug.name,
        }));
        const drugDefault = this.props.data.treatments.map(
            (drug: ITreatment) => ({
                value: drug,
                label: drug.name,
            })
        );
        return (
            <CreatableSelect
                options={drugOptions}
                isMulti
                defaultValue={drugDefault}
                name="drugsSelect"
                className="creatable-multi-select"
                classNamePrefix="select"
                onChange={(selectedOption: MyOption[]) => {
                    if (Array.isArray(selectedOption)) {
                        this.props.onChange(
                            selectedOption.map(option => {
                                if (_.isString(option.value)) {
                                    return {
                                        name: option.value.toString(),
                                    } as ITreatment;
                                } else {
                                    return option.value as ITreatment;
                                }
                            })
                        );
                    } else if (selectedOption === null) {
                        this.props.onChange([] as ITreatment[]);
                    }
                }}
            />
        );
    }
}
