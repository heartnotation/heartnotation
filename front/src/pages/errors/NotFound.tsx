import React, { Component } from 'react';
import '../../assets/styles/Errors.css';

class NotFound extends Component {
  public render() {
    return (
      <div className='main-error-container error-one'>
        {' '}
        <article className='login-background'>&nbsp;</article>
        <div className='main-error-content'>
          <h2>ERROR 404</h2>
          <p>WE ARE SORRY, BUT THE PAGE YOU REQUESTED WAS NOT FOUND</p>
        </div>
      </div>
    );
  }
}
export default NotFound;
