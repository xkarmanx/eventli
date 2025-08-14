import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import MobileBottomNav from './MobileBottomNav';

// Mock Next.js navigation hooks
const mockUsePathname = jest.fn();
const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: mockPush
  }),
  // Add a basic mock for useSearchParams, though not directly used in MobileBottomNav
  useSearchParams: () => new URLSearchParams()
}));

// Mock the useAuth hook
const mockUseAuth = jest.fn();

jest.mock('@/shared/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock Supabase client creation
const mockSupabaseFrom = jest.fn();

jest.mock('@/shared/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: mockSupabaseFrom
  }))
}));

// Mock the child modals to simplify testing of MobileBottomNav's direct logic
jest.mock('@/shared/components/ui/AuthModal', () => {
  return jest.fn(({ isOpen, onClose, type, onSwitchMode }) =>
    isOpen ? (
      <div data-testid='auth-modal'>
        Auth Modal ({type})<button onClick={onClose}>Close Auth</button>
        <button
          onClick={() => onSwitchMode(type === 'login' ? 'signup' : 'login')}
        >
          Switch Mode
        </button>
      </div>
    ) : null
  );
});

jest.mock('@/shared/components/ui/SearchSlideSheet', () => {
  return jest.fn(({ isOpen, onClose, onSearch }) =>
    isOpen ? (
      <div data-testid='search-slide-sheet'>
        Search Slide Sheet
        <button onClick={onClose}>Close Search</button>
        <button
          onClick={() =>
            onSearch('test query', {
              priceRange: ['100-200'],
              guestNumber: ['50-100'],
              eventType: 'Wedding'
            })
          }
        >
          Apply Search
        </button>
        <button onClick={() => onSearch('', {})}>
          Apply Empty Search
        </button>
      </div>
    ) : null
  );
});

describe('MobileBottomNav', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    // Set default mock values
    mockUsePathname.mockReturnValue('/');
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    mockSupabaseFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }) // Default no profile/role
        })
      })
    });
  });

  it('renders correctly on non-listing paths', () => {
    render(<MobileBottomNav />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Filter')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('does not render on listing detail pages', () => {
    mockUsePathname.mockReturnValue('/listing/some-id');
    const { container } = render(<MobileBottomNav />);

    expect(container.firstChild).toBeNull();
  });

  it('has correct href for Home button', () => {
    render(<MobileBottomNav />);
    const homeLink = screen.getByRole('link', { name: /home/i }); // Find the link by its accessible name (text content)
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('opens SearchSlideSheet when Filter button is clicked', () => {
    render(<MobileBottomNav />);
    fireEvent.click(screen.getByText('Filter'));

    expect(screen.getByTestId('search-slide-sheet')).toBeInTheDocument();
  });

  it('closes SearchSlideSheet and applies search filters', async () => {
    render(<MobileBottomNav />);
    fireEvent.click(screen.getByText('Filter')); // Open search modal
    fireEvent.click(screen.getByText('Apply Search')); // Apply search from mock

    await waitFor(() => {
      expect(
        screen.queryByTestId('search-slide-sheet')
      ).not.toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/?q=test+query&price=100-200&guests=50-100&eventType=Wedding'
    );
  });

  it('closes SearchSlideSheet and navigates to home if search is empty', async () => {
    render(<MobileBottomNav />);
    fireEvent.click(screen.getByText('Filter')); // Open search modal
    fireEvent.click(screen.getByText('Apply Empty Search')); // Apply empty search from mock

    await waitFor(() => {
      expect(screen.queryByTestId('search-slide-sheet')).not.toBeInTheDocument();
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  describe('Profile button behavior', () => {
    it('opens AuthModal (login) when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });
      render(<MobileBottomNav />);
      fireEvent.click(screen.getByText('Profile'));

      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      expect(screen.getByText('Auth Modal (login)')).toBeInTheDocument();
    });

    it('closes AuthModal when Close Auth button is clicked', async () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });
      render(<MobileBottomNav />);
      fireEvent.click(screen.getByText('Profile'));
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close Auth'));

      await waitFor(() => {
        expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
      });
    });

    it('navigates to /customer-profile when user is authenticated as customer', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-id-1', email: 'a@b.com' },
        loading: false
      });
      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({ data: { role: 'customer' }, error: null })
          })
        })
      });

      render(<MobileBottomNav />);

      // Wait for the useEffect to fetch the role
      await waitFor(() => {
        // Ensure that the role fetching is done before clicking profile
        expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles');
      });

      fireEvent.click(screen.getByText('Profile'));
      expect(mockPush).toHaveBeenCalledWith('/customer-profile');
    });

    it('navigates to /dashboard/seller/profile when user is authenticated as seller', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-id-2', email: 'b@c.com' },
        loading: false
      });
      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({ data: { role: 'seller' }, error: null })
          })
        })
      });

      render(<MobileBottomNav />);

      // Wait for the useEffect to fetch the role
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles');
      });

      fireEvent.click(screen.getByText('Profile'));
      expect(mockPush).toHaveBeenCalledWith('/dashboard/seller/profile');
    });

    it('opens AuthModal if user is authenticated but role fetching fails', async () => {
      mockUseAuth.mockReturnValue({
        user: { id: 'user-id-3', email: 'c@d.com' },
        loading: false
      });
      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { message: 'DB Error' } })
          })
        })
      });

      render(<MobileBottomNav />);

      // Wait for the useEffect to attempt fetching the role
      await waitFor(() => {
        expect(mockSupabaseFrom).toHaveBeenCalledWith('profiles');
      });

      fireEvent.click(screen.getByText('Profile'));
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
      expect(screen.getByText('Auth Modal (login)')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled(); // Should open modal, not navigate
    });

    it('does nothing if auth loading is true', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true });
      render(<MobileBottomNav />);
      fireEvent.click(screen.getByText('Profile'));

      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('does nothing if role loading is true (user authenticated)', async () => {
      // Simulate user is present, and role is *about* to be fetched but not yet completed
      mockUseAuth.mockReturnValue({
        user: { id: 'user-id-4', email: 'd@e.com' },
        loading: false
      });
      mockSupabaseFrom.mockReturnValue({
        select: () => ({
          eq: () => ({
            single: () => new Promise(() => { }) // Never resolves, simulating loading
          })
        })
      });

      render(<MobileBottomNav />);

      // Don't wait for role fetching to complete
      fireEvent.click(screen.getByText('Profile'));

      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
