import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

vi.mock('../hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));
vi.mock('../hooks/useProgress', () => ({
  useUserStats: vi.fn(),
}));
vi.mock('../hooks/useRoutes', () => ({
  useRoutes: vi.fn(),
}));
vi.mock('../store', () => ({
  default: vi.fn(),
}));

import { useProfile } from '../hooks/useProfile';
import { useUserStats } from '../hooks/useProgress';
import { useRoutes } from '../hooks/useRoutes';
import useStore from '../store';
import HomeHeaderSummary from '../components/layout/HomeHeaderSummary';

function Wrapper({ children }) {
  return (
    <ChakraProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ChakraProvider>
  );
}

beforeEach(() => {
  useStore.mockReturnValue({
    userProfile: { petName: 'Buddy', streak: 3 },
  });
  useProfile.mockReturnValue({
    data: {
      totalBones: 5,
    },
    isLoading: false,
  });
  useUserStats.mockReturnValue({
    data: {
      streak: 3,
    },
  });
  useRoutes.mockReturnValue({
    data: { routes: [], route_paused: false },
    isLoading: false,
  });
});

describe('HomeHeaderSummary', () => {
  test('показывает имя, серию и косточки в одной строке', () => {
    render(<HomeHeaderSummary />, { wrapper: Wrapper });

    expect(screen.getByText('Buddy')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    const row = screen.getByText('Buddy').closest('div');
    expect(row?.textContent).toMatch(/🔥/);
    expect(row?.textContent).toMatch(/🦴/);
  });

  test('на главной в inline показывает название выбранного маршрута', () => {
    useRoutes.mockReturnValue({
      data: {
        routes: [{ key: 'puppy', title: 'Щенок дома', is_selected: true }],
        route_paused: false,
      },
      isLoading: false,
    });

    render(<HomeHeaderSummary variant="inline" />, { wrapper: Wrapper });

    expect(screen.getByText('Щенок дома')).toBeInTheDocument();
  });
});
