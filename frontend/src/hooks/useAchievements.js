import { useQuery } from 'react-query';
import { apiClient } from './useApi';
import config from '../config';

export const ICON_MAP = { Star: 'Star', Calendar: 'Calendar', Target: 'Target', Heart: 'Heart', Crown: 'Crown', Zap: 'Zap', Trophy: 'Trophy', Award: 'Award' };

export function useAchievements() {
  return useQuery(['achievements'], async () => {
    const { data } = await apiClient.get(config.api.endpoints.achievements);
    return data;
  });
}
