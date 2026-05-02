import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';
import config from '../config';

export function useTracks() {
  return useQuery(['tracks'], async () => {
    const { data } = await apiClient.get(config.api.endpoints.tracks);
    return data;
  });
}

export function useCompleteTrack() {
  const queryClient = useQueryClient();
  return useMutation(
    async (trackId) => {
      const { data } = await apiClient.put(`${config.api.endpoints.tracks}/${trackId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tracks']);
        queryClient.invalidateQueries(['profile']);
      },
    }
  );
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  return useMutation(
    async (trackId) => {
      await apiClient.delete(`${config.api.endpoints.tracks}/${trackId}`);
    },
    { onSuccess: () => queryClient.invalidateQueries(['tracks']) }
  );
}

export function useAddTrack() {
  const queryClient = useQueryClient();
  return useMutation(
    async (trackId) => {
      const { data } = await apiClient.post(config.api.endpoints.tracks, { track_id: trackId });
      return data;
    },
    { onSuccess: () => queryClient.invalidateQueries(['tracks']) }
  );
}
