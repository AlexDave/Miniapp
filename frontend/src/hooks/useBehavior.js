import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';

export function useBehavior(days = 30) {
  return useQuery(
    ['behavior', days],
    async () => {
      const { data } = await apiClient.get('/api/behavior', { params: { days } });
      return data;
    },
    { staleTime: 1000 * 60 * 2 }
  );
}

export function useLogBehaviorIncident() {
  const qc = useQueryClient();
  return useMutation(
    async ({ type, note, severity }) => {
      const { data } = await apiClient.post('/api/behavior/log', { type, note, severity });
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['behavior']);
      },
    }
  );
}
