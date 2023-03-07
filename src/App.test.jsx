import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  describe('when not authenticated', () => {
    it('renders log in page by default on "/"', () => {
      renderWithRouter(<App />);
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders log in page on "/login"', () => {
      renderWithRouter(<App />, { route: '/login' });
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders sign up page on "/signup"', () => {
      renderWithRouter(<App />, { route: '/signup' });
  
      const title = screen.getByText('Sign up', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders/redirect to log in page on "/todo"', () => {
      renderWithRouter(<App />, { route: '/todo' });
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  });

  describe('when authenticated', () => {
    it('renders log in page by default on "/"', () => {
      renderWithRouter(<App />);
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders log in page on "/login"', () => {
      renderWithRouter(<App />, { route: '/login' });
  
      const title = screen.getByText('Log in', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders sign up page on "/signup"', () => {
      renderWithRouter(<App />, { route: '/signup' });
  
      const title = screen.getByText('Sign up', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();
    });
  
    it('renders to tasks page on "/todo"', async () => {
      const todoClient = {
        logIn: vi.fn((email, password) => Promise.resolve()),
        token: vi.fn(() => 'i-am-a-token'),
        signUp: vi.fn((email, name, password) => Promise.resolve()),
        userInfo: vi.fn(() => ({ email: 'john.appleseed@mail.com', name: 'John Appleseed' })),
        logOut: vi.fn(),
        addTask: vi.fn(name => Promise.resolve()),
        allTasks: vi.fn(() => Promise.resolve([])),
        outstandingTasks: vi.fn(() => Promise.resolve([])),
        completedTasks: vi.fn(() => Promise.resolve([])),
        updateTaskStatus: vi.fn((id, completed) => Promise.resolve()),
        deleteTask: vi.fn(id => Promise.resolve())
      };

      renderWithRouter(<App todoClient={todoClient} />, { route: '/todo' });
  
      const title = screen.getByText('Todo', { selector: 'h1, h2' });
      expect(title).toBeInTheDocument();

      await waitFor(() => {
        expect(todoClient.outstandingTasks).toBeCalled();
      });

      await waitFor(() => {
        expect(todoClient.completedTasks).toBeCalled();
      });
    });
  });
});

function renderWithRouter(ui, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);
  return render(ui, { wrapper: BrowserRouter });
}