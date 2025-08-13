import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import LogoutButton from './LogoutButton';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock createClient and its signOut method
jest.mock('@/shared/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signOut: jest.fn(),
    },
  })),
}));

describe('LogoutButton', () => {
  const mockRefresh = jest.fn();
  const mockSignOut = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    (useRouter as jest.Mock).mockReturnValue({
      refresh: mockRefresh,
    });
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        signOut: mockSignOut,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LogoutButton />);
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('calls signOut and router.refresh on click', async () => {
    render(<LogoutButton />);

    const logoutButton = screen.getByRole('button', { name: /Logout/i });
    await userEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
