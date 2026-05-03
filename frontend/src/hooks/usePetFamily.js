import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';

export function usePetMine() {
  return useQuery(
    ['petMine'],
    async () => {
      const { data } = await apiClient.get('/api/pets/mine');
      return data;
    },
    { staleTime: 60_000 }
  );
}

export function usePetActivity(limit = 8) {
  return useQuery(
    ['petActivity', limit],
    async () => {
      const { data } = await apiClient.get('/api/pets/activity', { params: { limit } });
      return data;
    },
    { staleTime: 30_000 }
  );
}

export function usePetInvite() {
  const qc = useQueryClient();
  return useMutation(
    async (petId) => {
      const { data } = await apiClient.post(`/api/pets/${petId}/invite`);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['petMine']);
      },
    }
  );
}

export function usePetJoin() {
  const qc = useQueryClient();
  return useMutation(
    async (token) => {
      const trimmed = String(token).trim();
      const { data } = await apiClient.post(`/api/pets/join/${encodeURIComponent(trimmed)}`);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['petMine']);
        qc.invalidateQueries(['petActivity']);
        qc.invalidateQueries(['profile']);
        qc.invalidateQueries(['bones']);
        qc.invalidateQueries(['skillTree']);
      },
    }
  );
}
