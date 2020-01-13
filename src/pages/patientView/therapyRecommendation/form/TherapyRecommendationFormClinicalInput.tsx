import React, { ChangeEventHandler } from "react";
import { ITherapyRecommendation, IClinicalData } from "shared/model/TherapyRecommendation";
import CreatableSelect from 'react-select/creatable';


import _ from "lodash";
import { Drugs } from "./data/Drugs";
import { ClinicalData } from "shared/api/generated/CBioPortalAPI";

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
        attribute: clinicalDataItem.clinicalAttribute.displayName,
        value: clinicalDataItem.value
      }) as IClinicalData;
  });
  // allClinicalData = _.uniqBy(allClinicalData, "attribute");

  let clinicalDataOptions = allClinicalData.map((clinicalDataItem: IClinicalData) => 
    ({
      value: clinicalDataItem, 
      label: clinicalDataItem.attribute + ": " + clinicalDataItem.value
    }));
    

    const clinicalDataDefault = this.props.data.reasoning.clinicalData && this.props.data.reasoning.clinicalData.map((clinicalDataItem: IClinicalData) => 
    ({
      value: clinicalDataItem, 
      label: clinicalDataItem.attribute + ": " + clinicalDataItem.value
    }));
      return (
        <CreatableSelect
          options={clinicalDataOptions}
          // isDisabled
          isMulti
          defaultValue={clinicalDataDefault}
          // name="negativeDrugs"
          // className="basic-multi-select"
          // classNamePrefix="select"
          onChange={(selectedOption: MyOption[]) => {
            if (Array.isArray(selectedOption)) {
              this.props.onChange(selectedOption.map(option => {
                console.log(option);
                console.log(typeof(option));
                if (_.isString(option.value)) {
                  let clinicalDataString = option.value.toString().split(':');
                  return {attribute: clinicalDataString[0], value: clinicalDataString[1]} as IClinicalData;
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
    
  }
  }
