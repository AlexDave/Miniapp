import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { vi, describe, test, expect, beforeEach } from 'vitest';

vi.mock('../hooks/useTracks', () => ({
  useTracks: vi.fn(),
  useCompleteTrack: vi.fn(),
  useDeleteTrack: vi.fn(),
}));
vi.mock('../store', () => ({
  default: vi.fn(),
}));

import { useTracks, useCompleteTrack, useDeleteTrack } from '../hooks/useTracks';
import useStore from '../store';
import Tracks from '../components/Tracks';

function Wrapper({ children }) {
  return <ChakraProvider>{children}</ChakraProvider>;
}

const mockMutation = { mutateAsync: vi.fn(), isLoading: false, variables: null };

beforeEach(() => {
  vi.clearAllMocks();
  useStore.mockReturnValue({ addNotification: vi.fn() });
  useCompleteTrack.mockReturnValue(mockMutation);
  useDeleteTrack.mockReturnValue(mockMutation);
});

describe('Tracks', () => {
  test('показывает спиннер при загрузке', () => {
    useTracks.mockReturnValue({ data: [], isLoading: true, isError: false });

    render(<Tracks />, { wrapper: Wrapper });

    const spinners = document.querySelectorAll('.chakra-spinner');
    expect(spinners.length).toBeGreaterThan(0);
  });

  test('показывает сообщение об ошибке', () => {
    useTracks.mockReturnValue({ data: [], isLoading: false, isError: true });

    render(<Tracks />, { wrapper: Wrapper });

    expect(screen.getByText('Ошибка загрузки')).toBeInTheDocument();
  });

  test('показывает пустое состояние когда треков нет', () => {
    useTracks.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(<Tracks />, { wrapper: Wrapper });

    expect(screen.getByText('Нет активных треков')).toBeInTheDocument();
    expect(screen.getByText(/Добавьте задания из курсов/)).toBeInTheDocument();
  });

  test('отображает активные треки', () => {
    const tracks = [
      {
        id: 1,
        track_id: 10,
        is_completed: false,
        days_remaining: 4,
        last_completed_at: null,
        track: { title: 'Сидеть', description: 'Учим команду сидеть' },
      },
    ];
    useTracks.mockReturnValue({ data: tracks, isLoading: false, isError: false });

    render(<Tracks />, { wrapper: Wrapper });

    expect(screen.getByText('Сидеть')).toBeInTheDocument();
    expect(screen.getByText('Учим команду сидеть')).toBeInTheDocument();
    expect(screen.getByText('4 дн. осталось')).toBeInTheDocument();
  });

  test('показывает кнопку "Выполнить" активной когда cooldown истёк', () => {
    const tracks = [
      {
        id: 1,
        track_id: 10,
        is_completed: false,
        days_remaining: 3,
        last_completed_at: null,
        track: { title: 'Лежать', description: 'Команда лечь' },
      },
    ];
    useTracks.mockReturnValue({ data: tracks, isLoading: false, isError: false });

    render(<Tracks />, { wrapper: Wrapper });

    const btn = screen.getByRole('button', { name: /Выполнить/i });
    expect(btn).not.toBeDisabled();
  });

  test('отображает cooldown таймер если недавно выполнено', () => {
    const recentCompletion = new Date(Date.now() - 5 * 60 * 1000).toISOString(); // 5 min ago
    const tracks = [
      {
        id: 1,
        track_id: 10,
        is_completed: false,
        days_remaining: 3,
        last_completed_at: recentCompletion,
        track: { title: 'Стоять', description: 'Команда стоять' },
      },
    ];
    useTracks.mockReturnValue({ data: tracks, isLoading: false, isError: false });

    render(<Tracks />, { wrapper: Wrapper });

    // Should show a time like "10:00" (roughly 10 minutes remaining)
    expect(screen.getByText(/\d+:\d{2}/)).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: /Выполнить/i });
    expect(btn).toBeDisabled();
  });

  test('отображает счётчики статистики', () => {
    const tracks = [
      {
        id: 1,
        track_id: 10,
        is_completed: false,
        days_remaining: 3,
        last_completed_at: null,
        track: { title: 'Апорт', description: 'Подноска' },
      },
      {
        id: 2,
        track_id: 11,
        is_completed: true,
        days_remaining: 0,
        last_completed_at: null,
        track: { title: 'Фу', description: 'Запрет' },
      },
    ];
    useTracks.mockReturnValue({ data: tracks, isLoading: false, isError: false });

    render(<Tracks />, { wrapper: Wrapper });

    expect(screen.getByText('Активных')).toBeInTheDocument();
    // "Завершено" appears in stats label + track badge — at least one instance
    expect(screen.getAllByText('Завершено').length).toBeGreaterThan(0);
    expect(screen.getByText('Прогресс')).toBeInTheDocument();
  });
});
