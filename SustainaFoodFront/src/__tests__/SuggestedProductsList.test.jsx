import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SuggestedProductsList from '../components/SuggestedProductsList';
import '@testing-library/jest-dom';
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Admin' },
    logout: jest.fn(),
    checkAuthStatus: jest.fn(),
  }),
}));

jest.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: [],
    unreadCount: 0,
    setNotifications: jest.fn(),
  }),
}));

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          success: true,
          data: [
            { id: 1, name: 'Product 1', recommendationCount: 3, message: 'desc 1', aisle: 'Aisle 1' },
            { id: 2, name: 'Product 2', recommendationCount: 5, message: 'desc 2', aisle: 'Aisle 2' },
          ],
        }),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('SuggestedProductsList', () => {
  test('renders suggested products', async () => {
    render(
      <MemoryRouter>
        <SuggestedProductsList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });
});
