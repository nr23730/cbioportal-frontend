import React from "react";
import { ITherapyRecommendation, IGeneticAlteration } from "shared/model/TherapyRecommendation";
import { Mutation } from "shared/api/generated/CBioPortalAPI";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import _ from "lodash";
import { ResistenceGenes } from "./data/ResistenceGenes";

interface TherapyRecommendationFormAlterationInputProps {
  data: ITherapyRecommendation;
  mutations: Mutation[];
  onChange: ((alterations: IGeneticAlteration[]) => void);
}

type MyOption = {label: string, value: IGeneticAlteration}
type MyOptionNegative = {label: string, value: IGeneticAlteration | string}

export class TherapyRecommendationFormAlterationPositiveInput extends React.Component<TherapyRecommendationFormAlterationInputProps, {}> {

  public render() {
    
    let allAlterations = this.props.mutations.map((mutation:Mutation) =>{
        return ({
          hugoSymbol: mutation.gene.hugoGeneSymbol, 
          alteration: mutation.proteinChange,
          entrezGeneId: mutation.entrezGeneId
        }) as IGeneticAlteration;
    });
    allAlterations = _.uniqBy(allAlterations, "proteinChange");

    let alterationOptions = allAlterations.map((alteration:IGeneticAlteration) => 
      ({
        value: alteration, 
        label: alteration.hugoSymbol + " " + alteration.alteration
      }));
    const alterationDefault = this.props.data.reasoning.geneticAlterations && 
      this.props.data.reasoning.geneticAlterations.map((alteration:IGeneticAlteration) => 
    ({
      value: alteration, 
      label: alteration.hugoSymbol + " " + alteration.alteration
    }));
      return (
        <Select
          options={alterationOptions}
          isMulti
          defaultValue={alterationDefault}
          name="positiveAlterationsSelect"
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
    
  }}

  export class TherapyRecommendationFormAlterationNegativeInput extends React.Component<TherapyRecommendationFormAlterationInputProps, {}> {

    public render() {
      
      let allAlterations = ResistenceGenes;
  
      let alterationOptions = allAlterations.map((alteration:IGeneticAlteration) => 
        ({
          value: alteration, 
          label: alteration.hugoSymbol + " " + alteration.alteration
        }));
      const alterationDefault = this.props.data.reasoning.geneticAlterationsMissing && 
        this.props.data.reasoning.geneticAlterationsMissing.map((alteration:IGeneticAlteration) => 
      ({
        value: alteration, 
        label: alteration.hugoSymbol + " " + (alteration.alteration || "any")
      }));
        return (
          <CreatableSelect
            options={alterationOptions}
            isMulti
            defaultValue={alterationDefault}
            name="negativeAlterationsSelect"
            className="creatable-multi-select"
            classNamePrefix="select"  
            onChange={(selectedOption: MyOptionNegative[]) => {
              if (Array.isArray(selectedOption)) {
                this.props.onChange(selectedOption.map(option => {
                  if (_.isString(option.value)) {
                    let geneString = option.value.toString().split(' ');
                    return {hugoSymbol: geneString[0], alteration: geneString[1]} as IGeneticAlteration;
                  } else {
                    return option.value as IGeneticAlteration;
                  }
                }));
              } else if (selectedOption === null) {
                this.props.onChange([] as IGeneticAlteration[])
              }
            }}
          />
        );
      
  }}
  