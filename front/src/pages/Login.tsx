import React, { useState } from 'react';
import GoogleLogin from 'react-google-login';
import { auth, User } from '../utils';
import logo from '../assets/images/logo-name.png';
import '../assets/styles/Login.css';
import { Layout } from 'antd';

interface Props {
  onSuccess: (user: User) => void;
}

const clientId = process.env.REACT_APP_CLIENT_ID;

export default (props: Props) => {
  const { onSuccess } = props;
  const [error, setError] = useState('');

  const { Header, Footer, Content } = Layout;

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
    <Layout>
      <div className='login-container'>
        <Header className='login-header'>
          <div className='top-content-blurred' />
          <div className='top-content-visible'>
            <img className='login-logo' src={logo} alt='Heartnotation Logo' />
          </div>
        </Header>
        <Content className='login-center'>
          <h3>Define, comment, tag them intervals</h3>
          {error && (
            <div style={{ color: '#db0000', fontWeight: 'bold' }}>
              Error while authenticating, please retry
            </div>
          )}
          <GoogleLogin
            clientId={clientId}
            buttonText='Sign in'
            onSuccess={handleSucces}
            onFailure={err => {
              setError(err);
            }}
          />
          <h2 className='login-text'>
            To access the application, you must log in with Google
          </h2>
        </Content>
        <Footer className='login-footer'>
          <div className='blurred' />
        </Footer>
      </div>
    </Layout>
  );
};
