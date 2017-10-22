// @flow
import React from 'react';
import { Layout, Breadcrumb } from 'antd';
import { Route, Redirect, withRouter } from 'react-router-dom';
import { graphql, gql } from 'react-apollo';
import { compose, withHandlers } from 'recompose';

import 'assets/react-toolbox/theme.css';
import theme from 'assets/react-toolbox/theme.js';
import ThemeProvider from 'react-toolbox/lib/ThemeProvider';

import { withGQLLoadingOrError } from 'src/components/withBranches';
import Header from 'src/components/Header';
import IdeaListPage from 'src/components/IdeaListPage';
import IdeaDetail from 'src/components/IdeaDetail';
import UserCreate from 'src/components/UserCreate';
import IdeaAdd from 'src/components/IdeaAdd';
import IdeaEdit from 'src/components/IdeaEdit';
import About from 'src/components/About';
import Gallery from 'src/components/Gallery';
import MyDashboard from 'src/components/MyDashboard';
import Home from 'src/components/Home';
import Footer from 'src/components/Footer';
import LoggedOutHome from 'src/components/LoggedOutHome';

import { AUTH_KEY } from 'src/constants/config';

import 'antd/dist/antd.css';
import '@coursera/coursera-ui/css/utilities.css';
import 'src/styles/App.css';

const { Content } = Layout;

function App({
  data,
  loading,
  userId,
  isSuperuser,
  username,
  picture,
  isLoggedIn,
  onLogout,
  location,
  ...rest
}: Props) {
  if (!isLoggedIn) {
    if (location.pathname !== '/') {
      return <Redirect to={{ pathname: '/' }} />;
    }
    return <LoggedOutHome />;
  }

  return (
    <Layout style={{ color: '#424242', background: '#f5f5f5' }}>
      <Header
        name={username}
        picture={picture}
        isLoggedIn={isLoggedIn}
        loading={loading}
        onLogout={onLogout}
      />
      <Content style={{ minHeight: '92vh' }}>
        <Breadcrumb style={{ margin: '12px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <div>
          <Route
            exact
            path="/"
            render={props => <Home {...props} userId={userId} isSuperuser={isSuperuser} />}
          />
          <Route
            exact
            path="/ideas/:ideaSlug"
            render={props => <IdeaDetail {...props} userId={userId} isSuperuser={isSuperuser} />}
          />
          <Route
            exact
            path="/ideas/:ideaSlug/edit"
            render={props => <IdeaEdit {...props} userId={userId} isSuperuser={isSuperuser} />}
          />
          <Route
            exact
            path="/add-idea"
            render={props => <IdeaAdd {...props} userId={userId} isSuperuser={isSuperuser} />}
          />
          <Route
            exact
            path="/ideas"
            render={props => <IdeaListPage {...props} userId={userId} isSuperuser={isSuperuser} />}
          />
          <Route path="/about" component={About} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/me" component={MyDashboard} />
          <Route exact path="/signup" component={UserCreate} />
        </div>
      </Content>
      <Footer />
    </Layout>
  );
}

const userQuery = gql`
  query userQuery {
    user {
      id
      name
      picture
      isSuperuser
    }
  }
`;

const AppWithTheme = props => (
  <ThemeProvider theme={theme}>
    <App {...props} />
  </ThemeProvider>
);

export default compose(
  graphql(userQuery, {
    options: { fetchPolicy: 'network-only' },
    props: ({ data, data: { loading, user } }) => ({
      loading,
      isLoggedIn: !!user,
      userId: user && user.id,
      isSuperuser: user && user.isSuperuser,
      picture: user && user.picture,
      data,
    }),
  }),
  withHandlers({
    onLogout: () => () => {
      window.localStorage.removeItem(AUTH_KEY);
      // eslint-disable-next-line
      location.reload();
    },
  }),
  withGQLLoadingOrError(),
  withRouter,
)(AppWithTheme);
