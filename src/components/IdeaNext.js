// @flow
import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import _ from 'underscore';

import { withGQLLoadingOrError } from 'src/components/withBranches';

import { IdeaNextQuery } from 'src/constants/appQueries';

type Props = {
  idea: {
    title: string,
    slug: string,
  },
};

function IdeaNext({ idea: { title, slug } }: Props) {
  return (
    <div>
      <Link to={`/ideas/${slug}`}> {`${title} >`} </Link>
    </div>
  );
}

export default compose(
  withRouter,
  graphql(IdeaNextQuery, {
    props: ({ data: { loading, error, allIdeas } }) => ({
      dataFieldName: 'idea',
      shouldRenderNothing: true,
      loading,
      error,
      idea: _(allIdeas).first(),
    }),
  }),
  withGQLLoadingOrError(),
)(IdeaNext);
