import { render, screen, fireEvent } from '@testing-library/react';
import DashboardLayoutWrapper, { useSidebar } from './DashboardLayoutWrapper';
import React from 'react';

// Mock SellerSidebar and DashboardHeader to isolate DashboardLayoutWrapper
jest.mock('./SellerSidebar', () => () => <div data-testid="sidebar">Sidebar</div>);
jest.mock('./DashboardHeader', () => (props: any) => (
  <div data-testid="header">Header: {props.title || 'Dashboard'}</div>
));

describe('DashboardLayoutWrapper', () => {
  it('renders children and layout structure', () => {
    render(
      <DashboardLayoutWrapper>
        <div data-testid="child">Child Content</div>
      </DashboardLayoutWrapper>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('provides sidebar context and toggles mobileOpen', () => {
    // Test component to consume context
    function TestConsumer() {
      const { mobileOpen, setMobileOpen } = useSidebar();
      return (
        <>
          <span data-testid="mobileOpen">{String(mobileOpen)}</span>
          <button onClick={() => setMobileOpen(true)}>Open</button>
        </>
      );
    }
    render(
      <DashboardLayoutWrapper>
        <TestConsumer />
      </DashboardLayoutWrapper>
    );
    // Initially false
    expect(screen.getByTestId('mobileOpen').textContent).toBe('false');
    // Click to open
    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByTestId('mobileOpen').textContent).toBe('true');
  });

  it('shows mobile overlay when mobileOpen is true and closes on click', () => {
    function TestConsumer() {
      const { setMobileOpen } = useSidebar();
      return <button onClick={() => setMobileOpen(true)}>OpenMobile</button>;
    }
    render(
      <DashboardLayoutWrapper>
        <TestConsumer />
      </DashboardLayoutWrapper>
    );
    // Open mobile menu
    fireEvent.click(screen.getByText('OpenMobile'));
    // Overlay should appear
    const overlay = screen.getByTestId('mobile-overlay');
    expect(overlay).toBeInTheDocument();
    // Click overlay to close
    fireEvent.click(overlay);
    // Overlay should disappear
    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
  });
});
