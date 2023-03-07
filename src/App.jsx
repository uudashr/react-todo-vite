import React from 'react';
import PropTypes from 'prop-types';

import {
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider, RequireAuth } from './auth'

import Todo from './routes/Todo';
import LogIn from './routes/LogIn';
import SignUp from './routes/SignUp';

export default function App(props) {
  const { todoClient } = props;

  return (
    
    <AuthProvider authClient={todoClient}>
      <Routes>
        <Route path="/" element={<Navigate to='/todo' />} />
        <Route 
          path="/todo" 
          element={
            <RequireAuth>
              <Todo taskClient={todoClient} />
            </RequireAuth>
          } 
        />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signUp" element={<SignUp authClient={todoClient} />} />
      </Routes>
    </AuthProvider>
  );
}

App.propTypes = {
  todoClient: PropTypes.shape({
    logIn: PropTypes.func.isRequired,
    token: PropTypes.func.isRequired,
    signUp: PropTypes.func.isRequired,
    userInfo: PropTypes.func.isRequired,
    logOut: PropTypes.func.isRequired,
    addTask: PropTypes.func.isRequired,
    allTasks: PropTypes.func.isRequired,
    outstandingTasks: PropTypes.func.isRequired,
    completedTasks: PropTypes.func.isRequired,
    updateTaskStatus: PropTypes.func.isRequired,
    deleteTask: PropTypes.func.isRequired
  }),
};
