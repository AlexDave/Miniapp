import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

vi.mock('../hooks/useCourses', () => ({
  useCourses: vi.fn(),
}));
vi.mock('../hooks/useTracks', () => ({
  useTracks: vi.fn(),
}));
vi.mock('../hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));
vi.mock('../hooks/useProgress', () => ({
  useUserStats: vi.fn(),
}));
vi.mock('../hooks/useLessons', () => ({
  useTodayLesson: vi.fn(),
}));
vi.mock('../store', () => ({
  default: vi.fn(),
}));

import { useCourses } from '../hooks/useCourses';
import { useTracks } from '../hooks/useTracks';
import { useProfile } from '../hooks/useProfile';
import { useUserStats } from '../hooks/useProgress';
import { useTodayLesson } from '../hooks/useLessons';
import useStore from '../store';
import Dashboard from '../components/Dashboard';

const defaultProfile = {
  petName: 'Buddy',
  level: 2,
  experience: 150,
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
  useProfile.mockReturnValue({});
  useUserStats.mockReturnValue({
    data: {
      total_xp: 120,
      level: 2,
      streak: 3,
      skills: { focus: 40, sit: 20, recall: 10 },
      xp_to_next: 80,
      next_level_xp: 200,
      level_name: 'Практик',
    },
  });
  useTodayLesson.mockReturnValue({ data: null, isLoading: false });
});

describe('Dashboard', () => {
  test('показывает спиннер пока данные загружаются', () => {
    useCourses.mockReturnValue({ data: [], isLoading: true });
    useTracks.mockReturnValue({ data: [], isLoading: true });

    render(<Dashboard />, { wrapper: Wrapper });

    const spinners = document.querySelectorAll('.chakra-spinner');
    expect(spinners.length).toBeGreaterThan(0);
  });

  test('отображает приветствие с именем питомца', () => {
    useCourses.mockReturnValue({ data: [], isLoading: false });
    useTracks.mockReturnValue({ data: [], isLoading: false });

    render(<Dashboard />, { wrapper: Wrapper });

    expect(screen.getByText(/Buddy/)).toBeInTheDocument();
  });

  test('отображает статистику курсов и треков', () => {
    const courses = [
      { id: 1, title: 'Курс 1', description: 'Описание', difficulty: 'easy', rating: 4.5 },
      { id: 2, title: 'Курс 2', description: 'Описание', difficulty: 'medium', rating: 0 },
    ];
    const tracks = [
      { id: 1, track_id: 10, is_completed: false },
      { id: 2, track_id: 11, is_completed: true },
    ];

    useCourses.mockReturnValue({ data: courses, isLoading: false });
    useTracks.mockReturnValue({ data: tracks, isLoading: false });

    render(<Dashboard />, { wrapper: Wrapper });

    expect(screen.getByText('2')).toBeInTheDocument(); // totalCourses
    expect(screen.getByText('Всего курсов')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // activeTracks
    expect(screen.getByText('Активных треков')).toBeInTheDocument();
  });

  test('отображает серию обучения из профиля', () => {
    useCourses.mockReturnValue({ data: [], isLoading: false });
    useTracks.mockReturnValue({ data: [], isLoading: false });

    render(<Dashboard />, { wrapper: Wrapper });

    expect(screen.getByText(/3.*дней подряд/i)).toBeInTheDocument();
  });

  test('отображает карточки курсов', () => {
    const courses = [
      { id: 1, title: 'Послушание', description: 'Базовые команды', difficulty: 'easy', rating: 4.5 },
    ];
    useCourses.mockReturnValue({ data: courses, isLoading: false });
    useTracks.mockReturnValue({ data: [], isLoading: false });

    render(<Dashboard />, { wrapper: Wrapper });

    expect(screen.getByText('Послушание')).toBeInTheDocument();
    expect(screen.getByText('Базовые команды')).toBeInTheDocument();
  });
});
