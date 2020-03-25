import React from "react";
import { ITherapyRecommendation, ITreatment } from "shared/model/TherapyRecommendation";
import CreatableSelect from 'react-select/creatable';
import _ from "lodash";


interface TherapyRecommendationFormCommentInputProps {
  data: ITherapyRecommendation;
  onChange: ((comments: string[]) => void);
}

type MyOption = {label: string, value: string}

export default class TherapyRecommendationFormCommentInput extends React.Component<TherapyRecommendationFormCommentInputProps, {}> {

  public render() {
    let comments = this.props.data.comment;
    const commentDefault = comments.map((comment:string) => 
    ({
      value: comment, 
      label: comment
    }));
      return (
        <CreatableSelect
          options={[]}
          isMulti
          defaultValue={commentDefault}
          name="commentsSelect"
          className="creatable-multi-select"
          classNamePrefix="select"
          onChange={(selectedOption: MyOption[]) => {
            if (Array.isArray(selectedOption)) {
              this.props.onChange(selectedOption.map(option => {
                return option.value;
              }));
            } else if (selectedOption === null) {
              this.props.onChange([])
            }
          }}
        />
      );
    
}}
