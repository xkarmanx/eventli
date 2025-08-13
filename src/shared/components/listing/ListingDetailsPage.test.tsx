import { render, screen } from '@testing-library/react';
import { Service } from '@/shared/types/service';
import ListingDetailsPage from './ListingDetailsPage';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock the Service prop
const mockService: Service = {
  id: '1',
  title: 'Test Service Title',
  image: '/assets/test-image.jpg',
  location: 'Test Location',
  price: '$100',
  provider: 'Test Provider',
  guests: '10',
  staff: '2',
  status: 'available',
  description: 'This is a test description for the service.',
  eventType: 'wedding',
  serving_style: 'Buffet',
  seller_id: '963b5ae2-0ccf-4ff9-9583-dab594c5cf84'
};

describe('ListingDetailsPage', () => {
  it('renders without crashing', () => {
    render(<ListingDetailsPage service={mockService} />);
    expect(screen.getAllByText('Test Service Title').length).toBeGreaterThan(0);
  });
});
