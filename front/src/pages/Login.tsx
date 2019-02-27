import React, { useState } from 'react';
import GoogleLogin from 'react-google-login';
import { auth, User } from '../utils';
import logo from '../assets/images/logo-name.png';
import '../assets/styles/Login.css';

interface Props {
  onSuccess: (user: User) => void;
}

const clientId = process.env.REACT_APP_CLIENT_ID;

export default (props: Props) => {
  const { onSuccess } = props;
  const [error, setError] = useState('');

  const handleSucces = (response: any) => {
    auth
      .authenticate(response.getAuthResponse().access_token)
      .then(onSuccess)
      .catch(err => {
        setError(err);
      });
  };

  if (!clientId) {
    return (
      <h1>
        Please set the <code>REACT_APP_CLIENT_ID</code> environment variable
      </h1>
    );
  }

  return (
    <main className='login-container'>
      <header className='login-header'>
        <img className='login-logo' src={logo} alt='Heartnotation Logo' />
      </header>
      <article className='login-background'>&nbsp;</article>
      <article className='login-center'>
        <h2>Define, comment, tag intervals</h2>
        <div>
          {error && (
            <div style={{ color: '#db0000', fontWeight: 'bold' }}>
              Error while authenticating, please retry
            </div>
          )}
          <GoogleLogin
            className='login-button'
            clientId={clientId}
            buttonText='Sign in'
            onSuccess={handleSucces}
            onFailure={err => {
              setError(err);
            }}
          />
          <p className='login-text'>
            To access the application, you must log in with Google
          </p>
        </div>
      </article>
      <footer className='login-footer'>
        <div className='blurred' />
      </footer>
    </main>
  );
};
