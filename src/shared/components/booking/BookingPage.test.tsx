// src/shared/components/booking/BookingPage.test.tsx
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Service } from '@/shared/types/service';
import BookingPage from './BookingPage';

// Mock the service prop
const mockService: Service = {
  id: '123',
  title: 'Test Service',
  image: '/assets/test-image.jpg',
  location: 'Test Location',
  price: '$100',
  provider: 'Test Provider',
  guests: '10',
  staff: '2',
  status: 'available',
  description: 'Test Description',
  eventType: 'wedding',
  serving_style: 'Buffet',
  seller_id: '063b5ae2-0ccf-4ff9-9343-fab554c5cf94'
};

describe('BookingPage Component', () => {
  it('renders without errors', () => {
    render(<BookingPage service={mockService} />);
  });

  it('renders the "Full Name" label', () => {
    render(<BookingPage service={mockService} />);
    const fullNameLabel = screen.getByText(/Full Name/i);
    expect(fullNameLabel).toBeInTheDocument();
  });

  it('renders the "Submit Booking Request" button', () => {
    render(<BookingPage service={mockService} />);
    const submitButton = screen.getByText(/Submit Booking Request/i);
    expect(submitButton).toBeInTheDocument();
  });
});
