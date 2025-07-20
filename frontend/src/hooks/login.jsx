import { useAuth0 } from '@auth0/auth0-react';

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <button
      style={{fontSize:'1.2vw'}}
      onClick={() =>
        loginWithRedirect({
          appState: {
            returnTo: '/userdash',
          },
        })
      }
    >
      Log In
    </button>
  );
};

export default LoginButton;
