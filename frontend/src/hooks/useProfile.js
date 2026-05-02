import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';
import config from '../config';
import useStore from '../store';

export function useProfile() {
  const updateUserProfile = useStore((s) => s.updateUserProfile);
  return useQuery(
    ['profile'],
    async () => {
      const { data } = await apiClient.get(config.api.endpoints.profile);
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
      const { data } = await apiClient.put(config.api.endpoints.profile, updates);
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['profile'], data);
        updateUserProfile({ petName: data.petName, avatar: data.avatar, level: data.level, experience: data.experience });
      },
    }
  );
}
