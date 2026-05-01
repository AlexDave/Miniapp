import { useQuery } from 'react-query';
import axios from 'axios';
import config from '../config';

const api = axios.create({ baseURL: config.baseUrl, withCredentials: true });

// Маппинг icon-строки из БД → иконка Lucide
export const ICON_MAP = {
  Star: 'Star',
  Calendar: 'Calendar',
  Target: 'Target',
  Heart: 'Heart',
  Crown: 'Crown',
  Zap: 'Zap',
  Trophy: 'Trophy',
  Award: 'Award',
};

export function useAchievements() {
  return useQuery(['achievements'], async () => {
    const { data } = await api.get(config.api.endpoints.achievements);
    return data;
  });
}
