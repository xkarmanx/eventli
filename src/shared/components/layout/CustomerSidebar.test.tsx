import { render, screen } from '@testing-library/react';
import CustomerSidebar from './CustomerSidebar';

// Mock the next/navigation usePathname hook
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

// Mock the useSidebar hook
jest.mock('./DashboardLayoutWrapper', () => ({
  useSidebar: jest.fn(() => ({
    collapsed: false,
    setCollapsed: jest.fn(),
    mobileOpen: false,
    setMobileOpen: jest.fn()
  }))
}));

// Mock the signOut action
jest.mock('@/features/auth/actions', () => ({
  signOut: jest.fn()
}));

describe('CustomerSidebar', () => {
  it('renders without crashing', () => {
    require('next/navigation')
      .usePathname
      .mockReturnValue('/dashboard/customer/profile');
    render(<CustomerSidebar />);
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
