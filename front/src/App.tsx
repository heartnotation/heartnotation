import React, { Component } from 'react';
import './assets/styles/App.css';
import AppRouter, { AppRoute } from './Routes';
import AnnotationForm from './pages/CreateAnnotationForm';
import UserCreation from './pages/UserCreation';
import TagCreation from './pages/TagCreation';
import Tags from './pages/Tags';
import Users from './pages/Users';

interface State {
  routes: AppRoute[];
}

class App extends Component<any, State> {
  constructor(props: any) {
    super(props);
    /**
     * TODO remplacer pour récupérer les routes en fonctions du rôle de l'utilisateur connecté.
     */
    this.state = {
      routes: [
        {
          path: '/annotations/new',
          exact: true,
          component: AnnotationForm,
          title: 'Create annotation',
          iconName: 'plus'
        },
        {
          path: '/users/new',
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
          path: '/tags/new',
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
    const { routes } = this.state;
    return (
      <div>
        <AppRouter routes={routes} />
      </div>
    );
  }
}

export default App;
