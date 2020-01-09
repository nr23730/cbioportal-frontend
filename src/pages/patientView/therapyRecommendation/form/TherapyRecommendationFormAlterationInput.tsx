import React, { ChangeEventHandler } from "react";
import { ITherapyRecommendation, IGeneticAlteration } from "shared/model/TherapyRecommendation";
import { Mutation } from "shared/api/generated/CBioPortalAPI";
import Select from 'react-select';


import _ from "lodash";

interface TherapyRecommendationFormAlterationInputProps {
  data: ITherapyRecommendation;
  mutations: Mutation[];
  onChange: ((alterations: IGeneticAlteration[]) => void);
}

type MyOption = {label: string, value: IGeneticAlteration}

export class TherapyRecommendationFormAlterationPositiveInput extends React.Component<TherapyRecommendationFormAlterationInputProps, {}> {

  public render() {
    
    let allAlterations = this.props.mutations.map((mutation:Mutation) =>{
        return ({
          hugoSymbol: mutation.gene.hugoGeneSymbol, 
          proteinChange: mutation.proteinChange,
          entrezGeneId: mutation.entrezGeneId
        }) as IGeneticAlteration;
    });
    allAlterations = _.uniqBy(allAlterations, "proteinChange");

    let alterationOptions = allAlterations.map((alteration:IGeneticAlteration) => 
      ({
        value: alteration, 
        label: alteration.hugoSymbol + " " + alteration.proteinChange
      }));
    const alterationDefault = this.props.data.reasoning.geneticAlterations && this.props.data.reasoning.geneticAlterations.map((alteration:IGeneticAlteration) => 
    ({
      value: alteration, 
      label: alteration.hugoSymbol + " " + alteration.proteinChange
    }));
      return (
        <Select
          options={alterationOptions}
          isMulti
          defaultValue={alterationDefault}
          name="positiveAlterations"
          className="basic-multi-select"
          classNamePrefix="select"
          onChange={(selectedOption: MyOption[]) => {
            if (Array.isArray(selectedOption)) {
              this.props.onChange(selectedOption.map(option => option.value));
            } else if (selectedOption === null) {
              this.props.onChange([] as IGeneticAlteration[])
            }
          }}
        />
      );
    
  }
  }

  export class TherapyRecommendationFormAlterationNegativeInput extends React.Component<TherapyRecommendationFormAlterationInputProps, {}> {

    public render() {
      
      // let allAlterations = this.props.mutations.map((mutation:Mutation) =>{
      //     return ({
      //       hugoSymbol: mutation.gene.hugoGeneSymbol, 
      //       proteinChange: mutation.proteinChange,
      //       entrezGeneId: mutation.entrezGeneId
      //     }) as IGeneticAlteration;
      // });
      // allAlterations = _.uniqBy(allAlterations, "proteinChange");
  
      // let alterationOptions = allAlterations.map((alteration:IGeneticAlteration) => 
      //   ({
      //     value: alteration, 
      //     label: alteration.hugoSymbol + " " + alteration.proteinChange
      //   }));
      const alterationDefault = this.props.data.reasoning.geneticAlterationsMissing && this.props.data.reasoning.geneticAlterationsMissing.map((alteration:IGeneticAlteration) => 
      ({
        value: alteration, 
        label: alteration.hugoSymbol + " " + alteration.proteinChange
      }));
        return (
          <Select
            // options={alterationOptions}
            isDisabled
            isMulti
            defaultValue={alterationDefault}
            name="positiveAlterations"
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={(newValue: any, actionMeta: any) => {
              console.group('Value Changed');
              console.log(newValue);
              console.log(`action: ${actionMeta.action}`);
              console.groupEnd();
            }}
          />
        );
      
    }
    }
  