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
import { api } from './utils';

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
      component: () => (
        <UserCreation
          getOrganizations={api.getOrganizations}
          getRoles={api.getRoles}
          sendUser={api.sendUser}
        />
      ),
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

export default class App extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      user: undefined
    };
  }
  public render = () => {
    return (
      <AppRouter
        defaultRoute={r.defaultRoute}
        routes={r.routes}
        hiddenRoutes={r.hiddenRoutes}
      />
    );
  }
}
