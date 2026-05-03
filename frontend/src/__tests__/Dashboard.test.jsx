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
vi.mock('../hooks/useLessons', () => ({
  useTodayLesson: vi.fn(),
}));
vi.mock('../hooks/useCoachTips', () => ({
  useDismissCoachTip: vi.fn(),
}));
vi.mock('../store', () => ({
  default: vi.fn(),
}));

import { useProfile } from '../hooks/useProfile';
import { useUserStats } from '../hooks/useProgress';
import { useTodayLesson } from '../hooks/useLessons';
import { useDismissCoachTip } from '../hooks/useCoachTips';
import useStore from '../store';
import Dashboard from '../components/Dashboard';

const defaultProfile = {
  petName: 'Buddy',
  streak: 3,
};

function Wrapper({ children }) {
  return (
    <ChakraProvider>
      <MemoryRouter>{children}</MemoryRouter>
    </ChakraProvider>
  );
}

beforeEach(() => {
  useStore.mockReturnValue({ userProfile: defaultProfile });
  useProfile.mockReturnValue({
    data: {
      onboardingCompleted: false,
      totalBones: 5,
      bones: {},
      stage: 'Знакомство',
    },
  });
  useUserStats.mockReturnValue({
    data: {
      streak: 3,
    },
  });
  useTodayLesson.mockReturnValue({ data: null, isLoading: false });
  useDismissCoachTip.mockReturnValue({ mutate: vi.fn(), isLoading: false });
});

describe('Dashboard', () => {
  test('ссылка на каталог ведёт в библиотеку', () => {
    render(<Dashboard />, { wrapper: Wrapper });

    const link = screen.getByRole('link', { name: /Библиотека/i });
    expect(link).toHaveAttribute('href', '/courses');
  });

  test('показывает сегодняшний шаг или заглушку', () => {
    render(<Dashboard />, { wrapper: Wrapper });

    expect(screen.getByText(/Сегодня всё сделано/i)).toBeInTheDocument();
  });
});
