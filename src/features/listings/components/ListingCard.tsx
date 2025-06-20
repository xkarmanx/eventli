import React from 'react';

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    description: string;
    price: number;
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
      <p className="text-gray-600 mb-2">{listing.description}</p>
      <p className="text-green-600 font-bold">${listing.price}</p>
    </div>
  );
}
