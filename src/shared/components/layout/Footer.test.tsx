import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

// Mock next/navigation to control the pathname for testing conditional rendering
jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}));

describe('Footer', () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    // Reset the mock before each test
    mockUsePathname.mockClear();
  });

  it('renders the footer correctly for a non-dashboard page', () => {
    mockUsePathname.mockReturnValue('/'); // Simulate a non-dashboard path

    render(<Footer />);

    // Check for main sections
    expect(screen.getByAltText('Eventli Logo')).toBeInTheDocument();
    expect(
      screen.getByText(/Connect with the best event service providers/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Quick Links/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /For Vendors/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Get in Touch/i })
    ).toBeInTheDocument();

    // Check for specific links/content
    expect(screen.getByText('Browse Services')).toHaveAttribute('href', '/');
    expect(screen.getByText('Join as Vendor')).toHaveAttribute('href', '/signup');
    expect(screen.getByText('hello@eventli.com')).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('Calgary, AB, Canada')).toBeInTheDocument();

    // Check copyright section
    expect(
      screen.getByText(new RegExp(`©\\s*${new Date().getFullYear()}\\s*Eventli, Inc\\.\\s*Made with`, 'i'))
    ).toBeInTheDocument();

    expect(screen.getByText('Privacy Policy')).toHaveAttribute('href', '#');
    expect(screen.getByText('Terms of Service')).toHaveAttribute('href', '#');
    expect(screen.getByText('Cookie Policy')).toHaveAttribute('href', '#');
  });

  it('renders the footer with compact layout for a dashboard page', () => {
    mockUsePathname.mockReturnValue('/dashboard/customer/bookings'); // Simulate a dashboard path

    render(<Footer />);

    // Check for main sections, they should still be present
    expect(screen.getByAltText('Eventli Logo')).toBeInTheDocument();
    expect(
      screen.getByText(/Connect with the best event service providers/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /Quick Links/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /For Vendors/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /Get in Touch/i })
    ).toBeInTheDocument();

    // The layout changes, but the content should be consistent
    expect(screen.getByText('Browse Services')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Support')).toHaveAttribute('href', '#'); // For both vendor and contact
  });

  it('displays the current year in the copyright notice', () => {
    mockUsePathname.mockReturnValue('/');
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${currentYear} Eventli, Inc.`))
    ).toBeInTheDocument();
  });
});
