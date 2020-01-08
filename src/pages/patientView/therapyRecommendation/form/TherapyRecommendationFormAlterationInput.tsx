import React from "react";
import { ITherapyRecommendation, IGeneticAlteration } from "shared/model/TherapyRecommendation";
import { Mutation } from "shared/api/generated/CBioPortalAPI";
// import Autocomplete from "@material-ui/lab/Autocomplete";
// import TextField from '@material-ui/core/TextField';
// import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Select from 'react-select';
// import Multiselect from 'react-widgets/lib/Multiselect'

interface TherapyRecommendationFormAlterationInputProps {
  data: ITherapyRecommendation;
  mutations: Mutation[];
}

// const useStyles = makeStyles((theme: Theme) =>
//   createStyles({
//     root: {
//       width: 500,
//       '& > * + *': {
//         marginTop: theme.spacing(3),
//       },
//     },
//   }),
// );

export default class TherapyRecommendationFormAlterationInput extends React.Component<TherapyRecommendationFormAlterationInputProps, {}> {
  
  
  // state = {
  //   selectedOption: null,
  // };
  // handleChange = (selectedOption: any) => {
  //   this.setState(
  //     { selectedOption },
  //     () => console.log(`Option selected:`, this.state.selectedOption)
  //   );
  // };

  public render() {
    const mutationOptions = [...new Set(this.props.mutations.map((mutation:Mutation) => ({value: mutation.gene.hugoGeneSymbol + " " + mutation.proteinChange, label: mutation.gene.hugoGeneSymbol + " " + mutation.proteinChange})))];
    const mutationDefault = this.props.data.reasoning.geneticAlterations && this.props.data.reasoning.geneticAlterations.map((geneticAlteration:IGeneticAlteration) => geneticAlteration.hugoSymbol + " " + geneticAlteration.proteinChange);
      // const { selectedOption } = this.state;
    console.log(mutationOptions);
    console.log(mutationDefault);
      return (
        <Select
          // value={selectedOption}
          // onChange={this.handleChange}
          options={mutationOptions}
          isMulti
          defaultValue={mutationDefault}
          name="positiveAlterations"
          className="basic-multi-select"
          classNamePrefix="select"
        />
      );
    
  }
  }

  // export const TherapyRecommendationFormAlterationInput = ({data, mutations}: TherapyRecommendationFormAlterationInputProps) => {

// export default class TherapyRecommendationFormAlterationInput extends React.Component<TherapyRecommendationFormAlterationInputProps, {}> {
//     public render() {
//       const classes = useStyles();
//       const mutationOptions = this.props.mutations.map((mutation:Mutation) => mutation.gene.hugoGeneSymbol + " " + mutation.proteinChange);
//       const mutationDefault = this.props.data.reasoning.geneticAlterations && this.props.data.reasoning.geneticAlterations.map((geneticAlteration:IGeneticAlteration) => geneticAlteration.hugoSymbol + " " + geneticAlteration.proteinChange);
//       return (
//         <div className={classes.root}>
//         <Autocomplete
//           multiple
//           id="tags-outlined"
//           options={mutationOptions}
//           // getOptionLabel={(option: FilmOptionType) => option.title}
//           defaultValue={mutationDefault}
//           filterSelectedOptions
//           renderInput={params => (
//             <TextField
//               {...params}
//               variant="outlined"
//               label="filterSelectedOptions"
//               placeholder="Alterations"
//               fullWidth
//             />
//           )}
//           />
//           </div>
//       );
//     }
//   }
  