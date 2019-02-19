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
    <div className='login-container'>
      <img className='login-logo' src={logo} alt='Heartnotation Logo' />
      <div>
        {error && (
          <div style={{ color: '#db0000', fontWeight: 'bold' }}>
            Error while authenticating, please retry
          </div>
        )}
        <GoogleLogin
          clientId={clientId}
          buttonText='Log in'
          onSuccess={handleSucces}
          onFailure={err => {
            setError(err);
          }}
        />
        <h2 className='login-text'>
          To access the application, you must log in with Google
        </h2>
      </div>
    </div>
  );
};
