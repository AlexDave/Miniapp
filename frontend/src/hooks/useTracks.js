import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import config from '../config';

const api = axios.create({ baseURL: config.baseUrl, withCredentials: true });

export function useTracks() {
  return useQuery(['tracks'], async () => {
    const { data } = await api.get(config.api.endpoints.tracks);
    return data;
  });
}

export function useCompleteTrack() {
  const queryClient = useQueryClient();

  return useMutation(
    async (trackId) => {
      const { data } = await api.put(`${config.api.endpoints.tracks}/${trackId}`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tracks']);
      },
    }
  );
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();

  return useMutation(
    async (trackId) => {
      await api.delete(`${config.api.endpoints.tracks}/${trackId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tracks']);
      },
    }
  );
}

export function useAddTrack() {
  const queryClient = useQueryClient();

  return useMutation(
    async (trackId) => {
      const { data } = await api.post(config.api.endpoints.tracks, { track_id: trackId });
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tracks']);
      },
    }
  );
}
