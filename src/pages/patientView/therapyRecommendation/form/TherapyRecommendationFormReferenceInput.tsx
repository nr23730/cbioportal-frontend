import React, { ChangeEventHandler } from "react";
import { ITherapyRecommendation, ITreatment, IReference } from "shared/model/TherapyRecommendation";
import AsyncCreatableSelect from 'react-select/async-creatable';


import _ from "lodash";
import request from "superagent";
import { callbackify } from "util";

interface TherapyRecommendationFormReferenceInputProps {
  data: ITherapyRecommendation;
  onChange: ((references: IReference[]) => void);
}

type MyOption = {label: string, value: IReference}


export default class TherapyRecommendationFormReferenceInput extends React.Component<TherapyRecommendationFormReferenceInputProps, {}> {

  public render() {
    
    // let allDrugs = Drugs;

    // let drugOptions = allDrugs.map((drug:ITreatment) => 
    //   ({
    //     value: drug, 
    //     label: drug.name
    //   }));
    const referenceDefault = this.props.data.references.map((reference:IReference) => 
    ({
      value: reference, 
      label: reference.pmid + ": " + reference.name
    }));
      return (
        <AsyncCreatableSelect
          // options={drugOptions}
          // isDisabled
          isCreatable
          isMulti
          defaultValue={referenceDefault}
          cacheOptions

          // name="negativeDrugs"
          // className="basic-multi-select"
          // classNamePrefix="select"

          onChange={(selectedOption: MyOption[]) => {
            console.log(selectedOption);
            if (Array.isArray(selectedOption)) {
              this.props.onChange(selectedOption.map(option => {
                console.log(option);
                if (_.isString(option.value)) {
                  let referenceString = option.value.toString().split(':');
                  return {pmid: +referenceString[0], name: referenceString[1]} as IReference;
                } else {
                  return option.value as IReference;
                }
              }));
            } else if (selectedOption === null) {
              this.props.onChange([] as IReference[])
            }
          }}

          loadOptions={promiseOptions}

        />
      );
    
  }
  }




const promiseOptions = (inputValue:String, callback: (options: ReadonlyArray<MyOption>) => void) =>
new Promise<MyOption>((resolve, reject) => {
  if(isNaN(+inputValue)) {
    const nanReference = {pmid: -1, name: "Invalid PubMed ID"};
    return callback([({
      value: nanReference, 
      label: nanReference.pmid + ": " + nanReference.name
    })])
  } else {
    const pmid = +inputValue;
    // TODO better to separate this call to a configurable client
    request.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + pmid + '&retmode=json')
        .end((err, res)=>{
            if (!err && res.ok) {
              // console.log(res);
                const response = JSON.parse(res.text);
                const result = response.result;
                const uid = result.uids[0];
                const reference = {pmid: pmid, name: result[uid].title};
                const ret:MyOption = ({
                  value: reference, 
                  label: reference.pmid + ": " + reference.name
                })
                // resolve(ret)
                return callback([ret]);
            } else {
              const errReference = {pmid: pmid, name: "Could not fetch name for ID " + pmid};
              return callback([({
                value: errReference, 
                label: errReference.pmid + ": " + errReference.name
              })])
            }
        });
    }
});


// function getOptions(inputValue:String, callback: (options: ReadonlyArray<MyOption>) => void){
//   const pmid = +inputValue;
//   return fetch('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=' + pmid + '&retmode=json')
//   .then(results=>{
//       return results.json();
//   }).then(data=>{
//     const uid = data.uids[0];
//     const reference = {pmid: pmid, name: data[uid].title};
//     const option:MyOption = ({
//       value: reference, 
//       label: reference.pmid + ": " + reference.name
//     })
//    //console.log(options) 
//    callback([option]);
//   })

// }