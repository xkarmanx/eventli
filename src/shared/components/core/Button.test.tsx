import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders a button with default variant and size', () => {
    render(<Button>Test Button</Button>);

    const button = screen.getByText('Test Button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary');
    expect(button).toHaveClass('h-10');
  });

  it('renders a button with a different variant and size', () => {
    render(
      <Button variant='outline' size='sm'>
        Outline Button
      </Button>
    );

    const button = screen.getByText('Outline Button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('border');
    expect(button).toHaveClass('h-9');
  });

  it('applies additional className prop', () => {
    render(<Button className='custom-class'>Custom Button</Button>);

    const button = screen.getByText('Custom Button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref to the button element', () => {
    const ref = jest.fn();

    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});
