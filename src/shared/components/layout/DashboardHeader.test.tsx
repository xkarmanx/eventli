import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import DashboardHeader from './DashboardHeader';

// Mock next/image to render a simple img
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
  default: (props: any) => <img {...props} />
}));

// Mock next/link to render children
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>
}));

// Mock signOut
jest.mock('@/features/auth/actions', () => ({ signOut: jest.fn() }));

// Helper to create Supabase mock
function createSupabaseMock({ user, profile }: { user: any; profile: any }) {
  return {
    auth: {
      getSession: jest
        .fn()
        .mockResolvedValue({
          data: { session: user ? { user } : null },
          error: null
        }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      }))
    },
    from: jest.fn(() => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: profile, error: null })
        })
      })
    }))
  };
}

// Default user/profile for tests
const sellerUser = {
  id: '1',
  email: 'seller@example.com',
  user_metadata: { full_name: 'Seller User', avatar_url: 'avatar.png' }
};

const customerUser = {
  id: '2',
  email: 'customer@example.com',
  user_metadata: { full_name: 'Customer User', avatar_url: 'avatar.png' }
};

const sellerProfile = {
  full_name: 'Seller User',
  avatar_url: 'avatar.png'
};

const customerProfile = {
  full_name: 'Customer User',
  avatar_url: 'avatar.png'
};

// We'll override the module for each test
jest.mock('@/shared/lib/supabase/client', () => ({
  createClient: jest.fn()
}));

const { createClient } = require('@/shared/lib/supabase/client');

describe('DashboardHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', async () => {
    createClient.mockReturnValue(
      createSupabaseMock({ user: null, profile: null })
    );
    render(<DashboardHeader userType='seller' />);
    // Should show loading skeleton
    expect(screen.getByRole('banner')).toBeInTheDocument();
    // Wait for loading to finish (should show default title)
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
  });

  it('renders title and subtitle', async () => {
    createClient.mockReturnValue(createSupabaseMock({
      user: customerUser,
      profile: customerProfile
    }));

    render(
      <DashboardHeader
        userType='customer'
        title='My Title'
        subtitle='My Subtitle'
      />
    );

    await waitFor(() =>
      expect(screen.getByText('My Title')).toBeInTheDocument()
    );

    expect(screen.getByText('My Subtitle')).toBeInTheDocument();
  });

  it('shows user menu and dropdown for seller', async () => {
    createClient.mockReturnValue(
      createSupabaseMock({ user: sellerUser, profile: sellerProfile })
    );

    render(<DashboardHeader userType='seller' />);

    await waitFor(() =>
      expect(screen.getByText('Seller User')).toBeInTheDocument()
    );

    // Open dropdown
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    });

    // Dropdown content
    expect(screen.getAllByText('Dashboard')).toHaveLength(2);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('shows user menu and dropdown for customer', async () => {
    createClient.mockReturnValue(
      createSupabaseMock({ user: customerUser, profile: customerProfile })
    );

    render(<DashboardHeader userType='customer' />);

    await waitFor(() =>
      expect(screen.getByText('Customer User')).toBeInTheDocument()
    );

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /user menu/i }));
    });

    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });
});
