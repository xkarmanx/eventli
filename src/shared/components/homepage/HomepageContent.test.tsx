// src/shared/components/homepage/HomepageContent.test.tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { Service } from '@/shared/types/service';
import HomepageContent from './HomepageContent';

// Mock the next/navigation module
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useSearchParams: () => new URLSearchParams()
}));

// Mock child components
jest.mock('@/shared/components/ui/Navbar', () => () => (
  <div data-testid='navbar' />
));
jest.mock('@/shared/components/ui/CategoryNavigation', () => () => (
  <div data-testid='category-navigation' />
));
jest.mock(
  '@/shared/components/ui/ServicesGrid',
  () =>
    ({ services }: { services: Service[] }) => (
      <div data-testid='services-grid'>{services.length} services</div>
    )
);
jest.mock('@/shared/components/ui/NoResultsDisplay', () => () => (
  <div data-testid='no-results' />
));

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Wedding Photography',
    price: '$1000',
    location: 'New York',
    provider: 'Photo Co',
    guests: '100',
    staff: '2',
    status: 'available',
    eventType: 'Wedding',
    image: '/img1.jpg',
    description: 'desc1',
    serving_style: 'Buffet',
    seller_id: '963b5ae2-0ccf-4ff9-9583-dab594c5cf84'
  },
  {
    id: '2',
    title: 'Corporate Catering',
    price: '$2000',
    location: 'Los Angeles',
    provider: 'Cater Inc',
    guests: '200',
    staff: '5',
    status: 'available',
    eventType: 'Corporate',
    image: '/img2.jpg',
    description: 'desc2',
    serving_style: 'Plated',
    seller_id: '963b5ae2-0ccf-4ff9-9583-dab594c5cf84'
  },
  {
    id: '3',
    title: 'Birthday DJ',
    price: '$500',
    location: 'New York',
    provider: 'Music Masters',
    guests: '50',
    staff: '1',
    status: 'available',
    eventType: 'Birthday',
    image: '/img3.jpg',
    description: 'desc3',
    serving_style: 'NA',
    seller_id: '963b5ae2-0ccf-4ff9-9583-dab594c5cf84'
  }
];

describe('HomepageContent', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders Navbar and CategoryNavigation', () => {
    render(<HomepageContent initialServices={mockServices} />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('category-navigation')).toBeInTheDocument();
  });

  it('renders ServicesGrid with initial services when there are services', () => {
    render(<HomepageContent initialServices={mockServices} />);
    const servicesGrid = screen.getByTestId('services-grid');
    expect(servicesGrid).toBeInTheDocument();
    expect(servicesGrid).toHaveTextContent('3 services');
    expect(screen.queryByTestId('no-results')).not.toBeInTheDocument();
  });

  it('renders NoResultsDisplay when there are no initial services', () => {
    render(<HomepageContent initialServices={[]} />);
    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(screen.queryByTestId('services-grid')).not.toBeInTheDocument();
  });

  it('does not show search results header by default', () => {
    render(<HomepageContent initialServices={mockServices} />);
    expect(screen.queryByText('Search Results')).not.toBeInTheDocument();
  });

  it('shows search results header when searchParams are provided', () => {
    const searchParams = {
      q: 'Wedding',
      price: 'under-5000',
      guests: '50-100'
    };
    render(
      <HomepageContent
        initialServices={mockServices}
        searchParams={searchParams}
      />
    );

    expect(screen.getByText('Search Results')).toBeInTheDocument();
    expect(screen.getByText('“Wedding”')).toBeInTheDocument();
    expect(
      screen.getByText(
        (content, element) =>
          content.startsWith('Price:') &&
          element?.tagName.toLowerCase() === 'span'
      )
    ).toBeInTheDocument();
  });

  it('calls router.push("/") when clear search button is clicked', () => {
    const searchParams = { q: 'Wedding' };
    render(
      <HomepageContent
        initialServices={mockServices}
        searchParams={searchParams}
      />
    );

    const clearButton = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });
});
