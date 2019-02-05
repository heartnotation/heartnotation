import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import AnnotationForm from './pages/CreateAnnotationForm';
import AnnotationTable from './fragments/AnnotationTable';
import Header from './fragments/Header';

const About = () => <h2>About</h2>;
const Users = () => <h2>Users</h2>;

const AppRouter = () => (
  <Router>
    <div>
      <Header />
      <Route path='/CreateTag/' exact={true} component={AnnotationForm} />
      <Route path='/Dashboard/' exact={true} component={AnnotationTable} />
      <Route path='/about/' component={About} />
      <Route path='/users/' component={Users} />
    </div>
  </Router>
);

export default AppRouter;
