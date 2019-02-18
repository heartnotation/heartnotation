import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const clientId = process.env.REACT_APP_CLIENT_ID;
let render;
if (clientId) {
  render = <App clientId={clientId} />;
} else {
  render = <div>REACT_APP_CLIENT_ID variable not found</div>;
}
ReactDOM.render(render, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
