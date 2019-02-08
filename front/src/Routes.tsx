import React, { FunctionComponent, ComponentClass } from 'react';
import {
  BrowserRouter as Router,
  Route,
  RouteComponentProps
} from 'react-router-dom';
import HomePage from './pages/Home';
import { StaticContext } from 'react-router';
import Header from './fragments/Header';

export interface AppRoute {
  path: string;
  component:
    | ComponentClass<any, any>
    | FunctionComponent<any>
    | ComponentClass<RouteComponentProps<any, StaticContext, any>, any>
    | FunctionComponent<RouteComponentProps<any, StaticContext, any>>;
  title: string;
  exact?: boolean;
  iconName?: string;
}

interface Props {
  routes: AppRoute[];
  hiddenRoutes: AppRoute[];
}

const AppRouter = (props: Props) => (
  <Router>
    <div>
      <Header routes={props.routes} />
      {[...props.hiddenRoutes, ...props.routes].map((r, index) => (
        <Route
          key={index}
          path={r.path}
          component={r.component}
          exact={r.exact}
        />
      ))}
    </div>
  </Router>
);

export default AppRouter;
