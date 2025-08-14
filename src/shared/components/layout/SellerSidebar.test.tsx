import { fireEvent, render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { signOut } from '@/features/auth/actions';
import { useSidebar } from './DashboardLayoutWrapper'; // Import useSidebar from its actual module
import SellerSidebar from './SellerSidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

// Mock the useSidebar hook - initialize it as a simple jest.fn()
// Its actual implementation will be set in beforeEach for each test
jest.mock('./DashboardLayoutWrapper', () => ({
  useSidebar: jest.fn()
}));

// Mock signOut action
jest.mock('@/features/auth/actions', () => ({
  signOut: jest.fn()
}));

describe('SellerSidebar', () => {
  const mockUsePathname = usePathname as jest.Mock;
  const mockUseSidebar = useSidebar as jest.Mock; // Reference the mocked hook directly

  // These variables will hold the state and the mocked setter functions for the hook
  let mockCollapsedState: boolean;
  let mockMobileOpenState: boolean;
  let setCollapsedMock: jest.Mock;
  let setMobileOpenMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.style.overflow = 'unset'; // Reset body overflow style
    mockUsePathname.mockReturnValue('/dashboard/seller');

    // Reset internal mock state for each test
    mockCollapsedState = false;
    mockMobileOpenState = false;

    // Create new Jest mock functions for the setters that update the mock state
    setCollapsedMock = jest.fn((value: boolean) => {
      mockCollapsedState = value;
    });

    setMobileOpenMock = jest.fn((value: boolean) => {
      mockMobileOpenState = value;
    });

    // Set the initial implementation for useSidebar for this test
    mockUseSidebar.mockImplementation(() => ({
      collapsed: mockCollapsedState,
      setCollapsed: setCollapsedMock,
      mobileOpen: mockMobileOpenState,
      setMobileOpen: setMobileOpenMock
    }));
  });

  it('renders without crashing', () => {
    render(<SellerSidebar />); // Render directly, not wrapped
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('toggles sidebar collapse on button click', () => {
    const { rerender } = render(<SellerSidebar />);

    // Initial state check
    expect(mockUseSidebar().collapsed).toBe(false);
    expect(screen.getByText('Listings')).toBeVisible();

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseButton);

    // Expect the mock setter to have been called
    expect(setCollapsedMock).toHaveBeenCalledWith(true);

    // Re-render the component to pick up the new mocked state from the setter call
    rerender(<SellerSidebar />);

    // Now, assert on the UI changes
    expect(screen.getByLabelText('Expand sidebar')).toBeInTheDocument();
    expect(screen.queryByText('Listings')).toBeNull();

    // Click to expand
    fireEvent.click(screen.getByLabelText('Expand sidebar'));
    expect(setCollapsedMock).toHaveBeenCalledWith(false); // Should be called with false now

    // Re-render to reflect the expanded state
    rerender(<SellerSidebar />);

    expect(screen.getByLabelText('Collapse sidebar')).toBeInTheDocument();
    expect(screen.getByText('Listings')).toBeVisible();
  });

  it('toggles mobile menu and body overflow', () => {
    const { rerender } = render(<SellerSidebar />);

    // Initial state
    expect(mockUseSidebar().mobileOpen).toBe(false);
    expect(document.body.style.overflow).toBe('unset');

    const mobileMenuButton = screen.getByLabelText('Toggle menu');
    fireEvent.click(mobileMenuButton);

    expect(setMobileOpenMock).toHaveBeenCalledWith(true);

    // Re-render to pick up the state change from the setter call
    rerender(<SellerSidebar />);

    expect(document.body.style.overflow).toBe('hidden');
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument(); // Button remains same

    // Click to close mobile menu
    fireEvent.click(mobileMenuButton);
    expect(setMobileOpenMock).toHaveBeenCalledWith(false);

    // Re-render to reflect the closed state
    rerender(<SellerSidebar />);

    expect(document.body.style.overflow).toBe('unset');
  });

  it('closes mobile menu when route changes', () => {
    // Manually set initial state for this test case before rendering
    mockMobileOpenState = true;
    mockUseSidebar.mockImplementation(() => ({
      collapsed: mockCollapsedState,
      setCollapsed: setCollapsedMock,
      mobileOpen: mockMobileOpenState, // Start with mobile menu open
      setMobileOpen: setMobileOpenMock
    }));

    const { rerender } = render(<SellerSidebar />);
    // The useEffect in SellerSidebar should set overflow to 'hidden' due to mobileOpen being true.
    expect(document.body.style.overflow).toBe('hidden');

    // Simulate route change
    mockUsePathname.mockReturnValue('/dashboard/seller/listings');
    // Re-render to trigger the useEffect that watches pathname, which calls setMobileOpen(false)
    // Note: The `useEffect` will be triggered on the *next* render cycle after `pathname` changes.
    // The `setMobileOpen(false)` call will then be captured by our `setMobileOpenMock`.
    rerender(<SellerSidebar />);

    // Expect setMobileOpen to have been called with false due to the useEffect reacting to pathname change
    expect(setMobileOpenMock).toHaveBeenCalledWith(false);

    // Re-render again to pick up the state change caused by setMobileOpenMock
    rerender(<SellerSidebar />);

    expect(document.body.style.overflow).toBe('unset'); // Mobile menu should now be closed
  });

  it('calls signOut function when logout button is clicked', () => {
    render(<SellerSidebar />);

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('highlights the active navigation link', () => {
    mockUsePathname.mockReturnValue('/dashboard/seller/listings');
    render(<SellerSidebar />);

    const listingsLink = screen.getByText('Listings').closest('a');
    expect(listingsLink).toHaveClass('bg-teal-600');
    expect(listingsLink).toHaveClass('text-white');

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).not.toHaveClass('bg-teal-600');
  });
});
