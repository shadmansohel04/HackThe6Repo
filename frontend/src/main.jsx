import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root'));

root.render(
  <Auth0Provider
    domain="dev-abm2ro6war776xmm.us.auth0.com"
    clientId="Yum35S29OVPLsGTzSCj4TJFFfEtfPwct"
    authorizationParams={{
      redirect_uri: 'http://localhost:5173/userDash',
      audience: "https://dev-abm2ro6war776xmm.us.auth0.com/api/v2/"
    }}
    cacheLocation="localstorage"

  >
    <App />
  </Auth0Provider>
);
