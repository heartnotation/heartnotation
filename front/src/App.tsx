import React, { Component } from 'react';
import './assets/styles/App.css';
import AppRouter, { AppRoute } from './Routes';
import AnnotationForm from './pages/CreateAnnotationForm';
import UserCreation from './pages/UserCreation';
import TagCreation from './pages/TagCreation';
import Tags from './pages/Tags';
import Users from './pages/Users';
import Dashboard from './pages/Dashboard';
import SignalAnnotation from './pages/SignalAnnotation';
import { api } from './utils';

interface State {
  routes: AppRoute[];
  hiddenRoutes: AppRoute[];
}

class App extends Component<any, State> {
  constructor(props: any) {
    super(props);
    /**
     * TODO remplacer pour récupérer les routes en fonctions du rôle de l'utilisateur connecté.
     */
    this.state = {
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
          path: '/',
          exact: true,
          component: () => <Dashboard getAnnotations={api.getAnnotations} />,
          title: 'Dashboard'
        }
      ],
      routes: [
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
        },
        {
          path: '/new/users',
          component: UserCreation,
          title: 'Create User',
          iconName: 'user-add'
        },
        {
          path: '/about',
          component: () => <h2>About</h2>,
          title: 'About',
          iconName: 'question'
        },
        {
          path: '/users',
          component: Users,
          exact: true,
          title: 'Users',
          iconName: 'user'
        },
        {
          path: '/new/tags',
          component: TagCreation,
          title: 'Create Tags',
          iconName: 'tag'
        },
        {
          path: '/tags',
          exact: true,
          component: Tags,
          title: 'Tags',
          iconName: 'tags'
        }
      ]
    };
  }

  public render() {
    const { routes, hiddenRoutes } = this.state;
    return (
      <div>
        <AppRouter routes={routes} hiddenRoutes={hiddenRoutes} />
      </div>
    );
  }
}

export default App;
