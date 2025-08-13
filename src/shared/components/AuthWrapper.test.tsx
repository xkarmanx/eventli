import { act, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/shared/lib/supabase/client';
import AuthWrapper from './AuthWrapper';

// Mock Next.js router
jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

// Mock Supabase client
jest.mock('@/shared/lib/supabase/client', () => ({ createClient: jest.fn() }));

describe('AuthWrapper', () => {
  const mockPush = jest.fn();
  const mockGetUser = jest.fn();
  const mockOnAuthStateChange = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: mockGetUser,
        onAuthStateChange: mockOnAuthStateChange
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: { unsubscribe: jest.fn() }
      }
    });

    render(
      <AuthWrapper>
        <div data-testid='child'>Child Content</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to /login when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    render(
      <AuthWrapper>
        <div data-testid='child'>Child Content</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects to custom redirectTo path when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    render(
      <AuthWrapper redirectTo='/dashboard'>
        <div data-testid='child'>Child Content</div>
      </AuthWrapper>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
    expect(screen.queryByTestId('child')).not.toBeInTheDocument();
  });

  it('redirects on SIGNED_OUT event', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } });
    let authStateChangeCallback: any;
    mockOnAuthStateChange.mockImplementation(callback => {
      authStateChangeCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    render(
      <AuthWrapper>
        <div data-testid='child'>Child Content</div>
      </AuthWrapper>
    );

    // Simulate signed out event
    await waitFor(() => expect(screen.getByTestId('child')).toBeInTheDocument());
    act(() => authStateChangeCallback('SIGNED_OUT', null));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/login'));
  });

  it('unsubscribes on unmount', () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } });
    const mockUnsubscribe = jest.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: { unsubscribe: mockUnsubscribe }
      }
    });

    const { unmount } = render(
      <AuthWrapper>
        <div data-testid='child'>Child Content</div>
      </AuthWrapper>
    );

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
