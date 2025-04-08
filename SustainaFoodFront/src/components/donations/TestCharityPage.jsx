import React from 'react';
import CharityEventDetails from './CharityEventDetails';

const TestCharityPage = () => {
  const event = {
    name: 'Community Food Drive',
    description: 'Collecting food for local shelters.',
    imageUrl: '/images/event.jpg',
    location: 'Tunis Center',
    endingDate: '2025-05-01',
  };

  const ngo = {
    organizationName: 'Hope Foundation',
    mission: 'Feeding the less fortunate.',
    description: 'We organize regular donation drives across Tunisia.',
    website: 'https://hopefoundation.tn',
    instagram: 'https://instagram.com/hopefoundation',
    logoUrl: '/images/ngo-logo.jpg',
  };

  return <CharityEventDetails  />;
};

export default TestCharityPage;
