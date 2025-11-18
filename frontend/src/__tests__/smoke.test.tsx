import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../App';
import { AuthProvider } from '../providers/AuthProvider';
import { NotificationProvider } from '../providers/NotificationProvider';

describe('App', () => {
  it('renders login page by default', () => {
    render(
      <AuthProvider>
        <NotificationProvider>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </NotificationProvider>
      </AuthProvider>
    );
    expect(screen.getByText(/There Portal Login/i)).toBeInTheDocument();
  });
});
