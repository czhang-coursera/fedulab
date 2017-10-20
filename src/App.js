// @flow
import React from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import { Route, Link } from 'react-router-dom';
import { graphql, gql } from 'react-apollo';
import { compose, withHandlers } from 'recompose';

import 'assets/react-toolbox/theme.css';
import theme from 'assets/react-toolbox/theme.js';
import ThemeProvider from 'react-toolbox/lib/ThemeProvider';

import IdeaListPage from 'src/components/IdeaListPage';
import IdeaDetail from 'src/components/IdeaDetail';
import UserCreate from 'src/components/UserCreate';
import IdeaAddEditForm from 'src/components/IdeaAddEditForm';
import IdeaEdit from 'src/components/IdeaEdit';
import About from 'src/components/About';
import MyDashboard from 'src/components/MyDashboard';
import UserMenu from 'src/components/UserMenu';
import Home from 'src/components/Home';
import LoggedOutHome from 'src/components/LoggedOutHome';

import { AUTH_KEY } from 'src/constants/config';

import 'src/styles/utilities.css';
import 'src/styles/App.css';
import 'antd/dist/antd.css';

const { Header, Content, Footer } = Layout;

function App({
  data,
  loading,
  userId,
  isSuperuser,
  username,
  picture,
  isLoggedIn,
  onLogout,
  ...rest
}: Props) {
  if (!isLoggedIn) {
    return <LoggedOutHome />;
  }

  return (
    <Layout style={{ color: 'black' }}>
      <Header style={{ position: 'fixed', width: '100%', display: 'flex' }}>
        <Link className="logo" to="/">
          Fedulab for Make-a-thon
        </Link>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          style={{ lineHeight: '64px', flex: 1 }}
        >
          <Menu.Item key="1">
            <Link to="/home">Home</Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to="/ideas">Ideas</Link>
          </Menu.Item>
          <Menu.Item key="4">
            <Link to="/add-idea">Add Idea</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to="/about">About</Link>
          </Menu.Item>
        </Menu>
        <Route
          path="/"
          render={({ match, history }) => (
            <div className="userMenuWrapper">
              <UserMenu
                name={username}
                picture={picture}
                isLoggedIn={isLoggedIn}
                loading={loading}
                onLogout={onLogout}
              />
            </div>
          )}
        />
      </Header>
      <Content style={{ padding: '0 50px', marginTop: 64 }}>
        <Breadcrumb style={{ margin: '12px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
          <Route
            exact
            path="/home"
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
            render={props => (
              <IdeaAddEditForm {...props} userId={userId} isSuperuser={isSuperuser} />
            )}
          />
          <Route
            exact
            path="/ideas"
            render={props => <IdeaListPage {...props} userId={userId} isSuperuser={isSuperuser} />}
          />
          <Route path="/about" component={About} />
          <Route path="/me" component={MyDashboard} />
          <Route exact path="/signup" component={UserCreate} />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Fedulab for Make-A-Thon ©2017 @Coursera</Footer>
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
)(AppWithTheme);
