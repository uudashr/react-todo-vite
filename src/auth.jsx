import React from 'react';
import PropTypes from 'prop-types';
import {
  Navigate,
  useLocation,
} from 'react-router-dom';

export const AuthContext = React.createContext({
  token: undefined,
  logIn: (email, password, callback) => { },
  signOut: (callback) => { },
});

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider(props) {
  const { authClient, children } = props;

  const [token, setToken] = React.useState(authClient?.token());

  const logIn = (email, password, callback) => {
    if (!authClient) {
      callback();
      return
    }

    authClient.logIn(email, password)
      .then(token => {
        setToken(token);
        callback();
      })
      .catch((e) => {
        callback(e);
      });
  }

  const signOut = () => {
    if (!authClient) {
      return;
    }
    
    authClient.logOut();
    setToken(undefined);
  }

  const value = { token, logIn, signOut }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  authClient: PropTypes.shape({
    logIn: PropTypes.func.isRequired,
    logOut: PropTypes.func.isRequired,
    token: PropTypes.func.isRequired,
  }),
  children: PropTypes.element.isRequired
};

export function RequireAuth(props) {
  const { children } = props;

  const auth = useAuth();
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children;
}

RequireAuth.propTypes = {
  children: PropTypes.element.isRequired
}