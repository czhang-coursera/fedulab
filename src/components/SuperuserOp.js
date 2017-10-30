// @flow
import React from 'react';
import { Form, Input } from 'antd';
import { Box } from '@coursera/coursera-ui';

import Button from 'react-toolbox/lib/button/Button';
import { compose, withHandlers, withState } from 'recompose';
import { withRouter, Link } from 'react-router-dom';

import { graphql } from 'react-apollo';

import JsonViewer from 'react-json-viewer';

import { getDefaultIdea } from 'src/components/IdeaAddEditForm';
import PITCH_IDEAS from 'src/constants/pitchData';
import { CreateIdeaMutation, IdeaListQuery } from 'src/constants/appQueries';
import {
  API_BEFORE_SEND,
  API_SUCCESS,
  API_ERROR,
  API_IN_PROGRESS,
} from 'src/constants/apiNotificationConstants';

const { TextArea } = Input;
const FormItem = Form.Item;

type ApiStatusType = API_BEFORE_SEND | API_IN_PROGRESS | API_SUCCESS | API_ERROR;

type Props = {
  apiStatus: ApiStatusType,
  form: Object,
  jsonInput: string,
  onConvertPitchToIdeas: () => void,
  onJsonInputChange: () => void,
  checkJson: () => void,
};

export function SuperuserOp({
  form,
  onConvertPitchToIdeas,
  jsonInput,
  onJsonInputChange,
  checkJson,
  apiStatus,
  ...rest
}: Props) {
  const { getFieldDecorator } = form;

  return (
    <div>
      <h2 className="font-weight-200"> Import Ideas</h2>
      <FormItem
        label={
          'Paste the pitch ideas in json format here, using the following fields: "time","username","title","howToContribute","courseraVideoUrl","description" '
        }
        help={
          <p className="text-secondary font-xs m-x-1s">
            Use <a href="http://www.convertcsv.com/csv-to-json.htm"> the csv to json </a> tool to
            convert the csv and copy the result here.
          </p>
        }
      >
        {getFieldDecorator('youtubeVideoUrl', {
          rules: [{ validator: checkJson }],
          initialValue: jsonInput,
        })(
          <TextArea placeholder="Details about your idea" autosize={{ minRows: 6, maxRows: 12 }} />,
        )}
      </FormItem>

      <Box rootClassName="p-x-1 m-b-3" alignItems="end" flexDirection="column">
        {apiStatus === API_ERROR && (
          <p className="text-danger">
            {'Failed to import, check console or ask question in #fedulab'}
          </p>
        )}
        <span>
          <Button
            className="m-r-1s"
            type="submit"
            label={apiStatus === API_IN_PROGRESS ? 'Converting...' : 'Convert Pitch to Ideas'}
            raised
            primary
            onClick={onConvertPitchToIdeas}
          />
        </span>
        <div className="m-b-1">
          {apiStatus === API_SUCCESS && (
            <p>
              <Link to="/ideas">View All Ideas</Link>
            </p>
          )}
          <p className="font-sm text-secondary">
            Visit
            <a href="https://console.graph.cool/Fedulab/models/User/databrowser"> here </a> to
            delete ideas.
          </p>
        </div>
      </Box>
      <h2 className="font-weight-200"> Preview Imports</h2>
      <JsonViewer json={PITCH_IDEAS} />
    </div>
  );
}

const SuperuserOpHOC = compose(
  withRouter,
  graphql(CreateIdeaMutation, { name: 'createIdea' }),
  withState('apiStatus', 'apiStatusSet', API_BEFORE_SEND),
  withState('jsonInput', 'jsonInputSet', JSON.stringify(PITCH_IDEAS)),
  withHandlers({
    onJsonInputChange: () => (data) => {
      console.warn('change', data);
    },
    checkJson: () => () => {},
    onConvertPitchToIdeas: ({ createIdea, client, userId, history, apiStatusSet }) => () => {
      const allIdeas = PITCH_IDEAS.map(
        (
          { username, title, howToContribute, courseraVideoUrl, description, displayOrder },
          index,
        ) => ({
          ...getDefaultIdea(),
          displayOrder: displayOrder || index,
          title,
          description,
          pitchedBy: username,
          howToContribute,
          createdById: userId,
          contributorsIds: [],
          needMyLaptop: false,
          presentLive: false,
          isPresenting: false,
          isBackgroundImageDark: true,
        }),
      );

      allIdeas.forEach((idea, index) => {
        apiStatusSet(API_IN_PROGRESS);
        createIdea({
          variables: idea,
          refetchQueries:
            index === allIdeas.length - 1 ? [{ query: IdeaListQuery, options: {} }] : [],
        })
          .then((res) => {
            if (index === allIdeas.length - 1) {
              apiStatusSet(API_SUCCESS);
            }
            console.warn('res', res);
          })
          .catch((error) => {
            console.warn('error', error);
            apiStatusSet(API_ERROR);
          });
      });
    },
  }),
)(SuperuserOp);

export default Form.create()(SuperuserOpHOC);
