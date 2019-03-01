import React, { FunctionComponent, ComponentClass } from 'react';
import {
  BrowserRouter as Router,
  Route,
  RouteComponentProps
} from 'react-router-dom';
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
  defaultRoute: AppRoute;
  routes: AppRoute[];
  hiddenRoutes?: AppRoute[];
}

export default (props: Props) => {
  const { routes, hiddenRoutes, defaultRoute } = props;
  const hiddens = hiddenRoutes ? hiddenRoutes : [];
  return (
    <Router>
      <div>
        <Header
          defaultRoute={defaultRoute}
          routes={routes}
          hiddenRoutes={hiddens}
        />
        {[...hiddens, ...routes].map((r, index) => (
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
};
