import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import config from '../config';
import useStore from '../store';

const api = axios.create({ baseURL: config.baseUrl, withCredentials: true });

export function useProfile() {
  const updateUserProfile = useStore((s) => s.updateUserProfile);

  return useQuery(
    ['profile'],
    async () => {
      const { data } = await api.get(config.api.endpoints.profile);
      return data;
    },
    {
      onSuccess: (data) => {
        updateUserProfile({
          petName: data.petName,
          avatar: data.avatar,
          level: data.level,
          experience: data.experience,
          totalCourses: data.totalCourses,
          completedCourses: data.completedCourses,
          streak: data.streak,
        });
      },
    }
  );
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUserProfile = useStore((s) => s.updateUserProfile);

  return useMutation(
    async (updates) => {
      const { data } = await api.put(config.api.endpoints.profile, updates);
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['profile'], data);
        updateUserProfile({
          petName: data.petName,
          avatar: data.avatar,
          level: data.level,
          experience: data.experience,
        });
      },
    }
  );
}
