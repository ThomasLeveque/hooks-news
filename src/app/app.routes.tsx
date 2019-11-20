import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { routes, IRoute } from './app.config';

const generateRoutes = () =>
  routes.map((route: IRoute) => {
    return (
      <Route
        key={route.path}
        path={`/${route.path}`}
        component={route.component}
      />
    );
  });

const AppRoutes = () => {
  return (
    <div className="route-container flex justify-content-center">
      <Switch>
        <Route path="/" exact render={() => <Redirect to="/new" />} />
        {generateRoutes()}
      </Switch>
    </div>
  );
};

export default AppRoutes;
