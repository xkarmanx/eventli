import { render, screen } from '@testing-library/react';
import { Header } from './Header';
import '@testing-library/jest-dom';
import { ReactNode } from 'react';

// Mock next/link to prevent errors during testing as it's a client component.
// For basic rendering and link text presence, this simple mock is sufficient.
jest.mock('next/link', () => {
  return ({ children, href }: { children: ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Header', () => {
  it('renders the Eventli logo and title', () => {
    render(<Header />);
    expect(screen.getByText('E')).toBeInTheDocument();
    expect(screen.getByText('Eventli')).toBeInTheDocument();
  });

  it('renders Log In and Sign Up links', () => {
    render(<Header />);
    const loginLink = screen.getByRole('link', { name: /log in/i });
    const signupLink = screen.getByRole('link', { name: /sign up/i });

    expect(loginLink).toBeInTheDocument();
    expect(signupLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(signupLink).toHaveAttribute('href', '/signup');
  });
});
