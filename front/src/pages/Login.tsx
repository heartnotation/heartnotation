import React from 'react';
import GoogleLogin from 'react-google-login';
import { auth, User } from '../utils';
import logo from '../assets/images/logo.png';
import '../assets/styles/Login.css';

interface Props {
  clientId: string;
  onSuccess: (user: User) => void;
  onFailure: (err: any) => void;
}

export default (props: Props) => {
  const { clientId, onSuccess, onFailure } = props;
  const handleSucces = (response: any) => {
    auth
      .authenticate(response.getAuthResponse().access_token)
      .then(onSuccess)
      .catch(onFailure);
  };
  return (
    <div className='login-container'>
      <img className='login-logo' src={logo} alt='Heartnotation Logo' />
      <div>
        <GoogleLogin
          clientId={clientId}
          buttonText='Log in'
          onSuccess={handleSucces}
          onFailure={onFailure}
        />
        <h2 className='login-text'>
          To access the application, you must log in with Google
        </h2>
      </div>
    </div>
  );
};
