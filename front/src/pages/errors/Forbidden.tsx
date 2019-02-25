import React, { Component } from 'react';
import '../../assets/styles/Errors.css';

class Forbidden extends Component {
  public render() {
    return (
      <div className='main-error-container error-two'>
        {' '}
        <article className='login-background'>&nbsp;</article>
        <div className='main-error-content'>
          <h2>ERROR 403</h2>
          <p>WE ARE SORRY, BUT THE PAGE YOU REQUESTED WAS NOT ALLOWED</p>
        </div>
      </div>
    );
  }
}
export default Forbidden;
