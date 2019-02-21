import React, { Component } from 'react';
import './assets/styles/App.css';
import AppRouter from './Routes';
import AnnotationForm from './pages/CreateAnnotationForm';
import TagCreation from './pages/TagCreation';
import Tags from './pages/Tags';
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import SignalAnnotation from './pages/SignalAnnotation';
import { api, User } from './utils';
import { Authenticated, authenticate } from './utils/auth';
import GoogleLogin from 'react-google-login';
import loadingGif from './assets/images/loading.gif';
import Login from './pages/Login';

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
      title: 'Signal annotation',
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    },
    {
      path: '/new/tags',
      component: TagCreation,
      title: 'Create Tags',
      iconName: 'tag',
      roles: ['Admin']
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
      iconName: 'plus',
      roles: ['Gestionnaire', 'Admin']
    }
  ],
  routes: [
    {
      path: '/',
      exact: true,
      component: () => <Dashboard getAnnotations={api.getAnnotations} />,
      title: 'Dashboard',
      iconName: 'dashboard',
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
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
      iconName: 'user',
      roles: ['Gestionnaire', 'Admin']
    },
    {
      path: '/tags',
      exact: true,
      component: Tags,
      title: 'Tags',
      iconName: 'tags',
      roles: ['Gestionnaire', 'Admin']
    },
    {
      path: '/about',
      component: () => (
        <h2>Version : {process.env.REACT_APP_VERSION || 'unstable'}</h2>
      ),
      title: 'About',
      iconName: 'question',
      roles: ['Annotateur', 'Gestionnaire', 'Admin']
    }
  ]
};
class App extends Component<
  {},
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
        .catch(_ => {
          this.setState({ logged: false, user: undefined });
        });
    }
  }

  private handleSuccess = (user: User) => {
    this.setState({ user, logged: true });
  }
  public render = () => {
    const { logged, token, user } = this.state;

    if (token && !logged) {
      return (
        <img
          style={{ width: '50%', display: 'block', margin: 'auto' }}
          src={loadingGif}
          alt='Loading'
        />
      );
    }
    if (user) {
      return (
        <Authenticated user={user}>
          <AppRouter
            defaultRoute={r.defaultRoute}
            routes={r.routes.filter(value =>
              value.roles.includes(user.role.name)
            )}
            hiddenRoutes={r.hiddenRoutes.filter(value =>
              value.roles.includes(user.role.name)
            )}
          />
        </Authenticated>
      );
    }
    return <Login onSuccess={this.handleSuccess} />;
  }
}
export default App;
