import { fireEvent, render, screen } from '@testing-library/react';
import AuthModal from './AuthModal';
import '@testing-library/jest-dom';

describe('AuthModal', () => {
  it('renders nothing when not open or not mounted', () => {
    render(<AuthModal isOpen={false} onClose={() => {}} type="login" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays the correct title and subtitle for login mode', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} type="login" />);

    expect(screen.getByRole('heading', { name: /Welcome Back!/i })).toBeInTheDocument();
    expect(screen.getByText(/Choose how you want to sign in/i)).toBeInTheDocument();
  });

  it('displays the correct title and subtitle for signup mode', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} type="signup" />);

    expect(screen.getByRole('heading', { name: /Join Eventli/i })).toBeInTheDocument();
    expect(screen.getByText(/Choose how you want to get started/i)).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', () => {
    const onCloseMock = jest.fn();

    render(<AuthModal isOpen={true} onClose={onCloseMock} type="login" />);

    fireEvent.click(screen.getByLabelText(/Close modal/i));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('closes the modal when the backdrop is clicked', () => {
    const onCloseMock = jest.fn();

    render(<AuthModal isOpen={true} onClose={onCloseMock} type="login" />);

    fireEvent.click(screen.getByRole('dialog'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('does not close the modal when clicking inside the modal content', () => {
    const onCloseMock = jest.fn();

    render(<AuthModal isOpen={true} onClose={onCloseMock} type="login" />);

    fireEvent.click(screen.getByText(/Welcome Back!/i)); // Click on title inside modal
    expect(onCloseMock).not.toHaveBeenCalled();
  });

  it('switches to signup mode when "Sign up" button is clicked in login mode', () => {
    const onSwitchModeMock = jest.fn();

    render(<AuthModal isOpen={true} onClose={() => {}} type="login" onSwitchMode={onSwitchModeMock} />);

    fireEvent.click(screen.getByText(/Sign up/i));
    expect(onSwitchModeMock).toHaveBeenCalledWith('signup');
  });

  it('switches to login mode when "Log in" button is clicked in signup mode', () => {
    const onSwitchModeMock = jest.fn();

    render(<AuthModal isOpen={true} onClose={() => {}} type="signup" onSwitchMode={onSwitchModeMock} />);

    fireEvent.click(screen.getByText(/Log in/i));
    expect(onSwitchModeMock).toHaveBeenCalledWith('login');
  });
});
