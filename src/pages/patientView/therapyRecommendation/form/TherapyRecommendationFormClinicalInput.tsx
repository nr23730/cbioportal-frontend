import React from "react";
import { ITherapyRecommendation, IClinicalData } from "shared/model/TherapyRecommendation";
import CreatableSelect from 'react-select/creatable';
import _ from "lodash";
import { ClinicalData } from "cbioportal-ts-api-client";

interface TherapyRecommendationFormClinicalInputProps {
  data: ITherapyRecommendation;
  clinicalData: ClinicalData[];
  onChange: ((clinicalData: IClinicalData[]) => void);
}

type MyOption = {label: string, value: IClinicalData | string}

export default class TherapyRecommendationFormClinicalInput extends React.Component<TherapyRecommendationFormClinicalInputProps, {}> {

  public render() {
    
    let allClinicalData = this.props.clinicalData.map((clinicalDataItem: ClinicalData) =>{
      return ({
        attributeId: clinicalDataItem.clinicalAttribute.clinicalAttributeId,
        attributeName: clinicalDataItem.clinicalAttribute.displayName,
        value: clinicalDataItem.value
      }) as IClinicalData;
  });
  // allClinicalData = _.uniqBy(allClinicalData, "attribute");

  let clinicalDataOptions = allClinicalData.map((clinicalDataItem: IClinicalData) => 
    ({
      value: clinicalDataItem, 
      label: clinicalDataItem.attributeName + ": " + clinicalDataItem.value
    }));
    

    const clinicalDataDefault = this.props.data.reasoning.clinicalData && this.props.data.reasoning.clinicalData.map((clinicalDataItem: IClinicalData) => 
    ({
      value: clinicalDataItem, 
      label: clinicalDataItem.attributeName + ": " + clinicalDataItem.value
    }));
      return (
        <CreatableSelect
          options={clinicalDataOptions}
          // isDisabled
          isMulti
          defaultValue={clinicalDataDefault}
          name="clinicalSelect"
          className="creatable-multi-select"
          classNamePrefix="select"
          onChange={(selectedOption: MyOption[]) => {
            if (Array.isArray(selectedOption)) {
              this.props.onChange(selectedOption.map(option => {
                if (_.isString(option.value)) {
                  let clinicalDataString = option.value.toString().split(': ');
                  return {attributeName: clinicalDataString[0], value: clinicalDataString[1]} as IClinicalData;
                } else {
                  return option.value as IClinicalData;
                }
              }));
            } else if (selectedOption === null) {
              this.props.onChange([] as IClinicalData[])
            }
          }}
        />
      );
    
}}
