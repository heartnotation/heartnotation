import React, { Component } from 'react';
import './assets/styles/App.css';
import AppRouter from './Routes';
import AnnotationForm from './pages/CreateAnnotationForm';
import UserCreation from './pages/UserCreation';
import TagCreation from './pages/TagCreation';
import Tags from './pages/Tags';
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import SignalAnnotation from './pages/SignalAnnotation';
import { api, User } from './utils';
import GoogleLogin from 'react-google-login';
import { Authenticated, authenticate } from './utils/auth';
import loadingGif from './assets/images/loading.gif';

const r = {
  defaultRoute: {
    path: '/',
    exact: true,
    component: () => <Dashboard getAnnotations={api.getAnnotations} />,
    title: 'Dashboard'
  },
  hiddenRoutes: [
    {
      path: '/annotations/:id',
      component: () => (
        <SignalAnnotation
          getAnnotation={api.getAnnotationById}
          changeAnnotation={api.changeAnnotation}
        />
      ),
      title: 'Signal annotation'
    },
    {
      path: '/new/tags',
      component: TagCreation,
      title: 'Create Tags',
      iconName: 'tag'
    },
    {
      path: '/new/annotations',
      component: () => (
        <AnnotationForm
          getTags={api.getTags}
          getOrganizations={api.getOrganizations}
          getAnnotations={api.getAnnotations}
          checkSignal={api.checkSignal}
          sendAnnotation={api.sendAnnotation}
        />
      ),
      title: 'Create annotation',
      iconName: 'plus'
    }
  ],
  routes: [
    {
      path: '/',
      exact: true,
      component: () => <Dashboard getAnnotations={api.getAnnotations} />,
      title: 'Dashboard',
      iconName: 'dashboard'
    },
    {
      path: '/users',
      component: () => (
        <Users
          getOrganizations={api.getOrganizations}
          getRoles={api.getRoles}
          modifyUser={api.modifyUser}
          sendUser={api.sendUser}
          getAllUsers={api.getAllUsers}
          deleteUser={api.deleteUser}
        />
      ),
      title: 'Users',
      iconName: 'user'
    },
    {
      path: '/tags',
      exact: true,
      component: Tags,
      title: 'Tags',
      iconName: 'tags'
    },
    {
      path: '/about',
      component: () => <h2>About</h2>,
      title: 'About',
      iconName: 'question'
    }
  ]
};
class App extends Component<
  { clientId: string },
  { user?: User; logged: boolean; token?: string }
> {
  constructor(props: any) {
    super(props);
    const token = localStorage.getItem('access_token');
    this.state = {
      user: undefined,
      logged: false,
      token: token ? token : undefined
    };
  }
  public componentDidMount = () => {
    const { token } = this.state;
    if (token) {
      authenticate(token)
        .then(user => {
          this.setState({ user, logged: true });
        })
        .catch(() => {
          this.setState({ logged: false, user: undefined });
        });
    }
  }

  private handleSuccess = (response: any) => {
    authenticate(response.getAuthResponse().access_token)
      .then(user => {
        this.setState({ user, logged: true });
      })
      .catch(() => {
        alert('Unrecognized token');
      });
  }
  public render = () => {
    const { logged, token, user } = this.state;
    const { clientId } = this.props;

    if (token && !logged) {
      return (
        <img
          style={{ width: '50%', display: 'block', margin: 'auto' }}
          src={loadingGif}
          alt='Loading'
        />
      );
    }

    if (!logged) {
      return (
        <GoogleLogin
          clientId={clientId}
          buttonText='Log in'
          onSuccess={this.handleSuccess}
          onFailure={err => console.log(err.details)}
        />
      );
    }
    if (user) {
      return (
        user && (
          <Authenticated user={user}>
            <AppRouter
              defaultRoute={r.defaultRoute}
              routes={r.routes}
              hiddenRoutes={r.hiddenRoutes}
            />
          </Authenticated>
        )
      );
    }
  }
}
export default App;
