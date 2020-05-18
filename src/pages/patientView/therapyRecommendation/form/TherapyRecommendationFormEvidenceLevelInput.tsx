import React from 'react';
import {
    ITherapyRecommendation,
    EvidenceLevel,
} from 'shared/model/TherapyRecommendation';
import Select from 'react-select';
import _ from 'lodash';
import { components } from 'react-select';
import { getTooltipEvidenceContent } from '../TherapyRecommendationTableUtils';
import styles from '../style/therapyRecommendation.module.scss';
import {
    DefaultTooltip,
    placeArrowBottomLeft,
} from 'cbioportal-frontend-commons';

interface TherapyRecommendationFormEvidenceLevelInputProps {
    data: ITherapyRecommendation;
    onChange: (evidenceLevel: EvidenceLevel) => void;
}

type MyOption = { label: string; value: string };

export default class TherapyRecommendationFormEvidenceLevelInput extends React.Component<
    TherapyRecommendationFormEvidenceLevelInputProps,
    {}
> {
    public render() {
        const Option = (props: any) => {
            return (
                <div>
                    <components.Option {...props}>
                        <span style={{ marginRight: 5 }}>{props.label}</span>
                        <DefaultTooltip
                            placement="bottomLeft"
                            trigger={['hover', 'focus']}
                            overlay={getTooltipEvidenceContent(props.label)}
                            destroyTooltipOnHide={false}
                            onPopupAlign={placeArrowBottomLeft}
                        >
                            <i
                                className={'fa fa-info-circle ' + styles.icon}
                            ></i>
                        </DefaultTooltip>
                    </components.Option>
                </div>
            );
        };

        const evidenceLevelDefault = {
            label: this.props.data.evidenceLevel,
            value: EvidenceLevel[this.props.data.evidenceLevel],
        };
        const evidenceLevelOptions = Object.entries(EvidenceLevel)
            .filter(([key, value]) => typeof value === 'string')
            .map(([key, value]) => ({
                label: value,
                value: key,
            }));

        return (
            <Select
                options={evidenceLevelOptions}
                defaultValue={evidenceLevelDefault}
                components={{ Option }}
                name="evidenceLevel"
                className="basic-select"
                classNamePrefix="select"
                onChange={(selectedOption: MyOption) => {
                    this.props.onChange(
                        EvidenceLevel[
                            selectedOption.value as keyof typeof EvidenceLevel
                        ]
                    );
                    // therapyRecommendation.evidenceLevel =
                    //     EvidenceLevel[
                    //         selectedOption.value as keyof typeof EvidenceLevel
                    //     ];
                }}
            />
        );
    }
}
