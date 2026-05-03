import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';
import config from '../config';
import useStore from '../store';

function mapProfileData(data) {
  return {
    petName: data.petName,
    avatar: data.avatar,
    level: data.level,
    experience: data.experience,
    coins: data.coins ?? 0,
    skills: data.skills ?? { focus: 0, recall: 0, sit: 0 },
    totalCourses: data.totalCourses,
    completedCourses: data.completedCourses,
    streak: data.streak,
    onboardingCompleted: data.onboardingCompleted,
    dogAgeBucket: data.dogAgeBucket,
    learningGoals: data.learningGoals,
    primaryProblem: data.primaryProblem,
    coachTips: data.coachTips,
    // Косточки
    totalBones: data.totalBones ?? 0,
    specialBones: data.specialBones ?? 0,
    stage: data.stage ?? 'Знакомство',
    bones: data.bones ?? {},
  };
}

export function useProfile() {
  const updateUserProfile = useStore((s) => s.updateUserProfile);
  return useQuery(
    ['profile'],
    async () => {
      const { data } = await apiClient.get(config.api.endpoints.profile);
      return data;
    },
    {
      onSuccess: (data) => updateUserProfile(mapProfileData(data)),
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
        updateUserProfile(mapProfileData(data));
      },
    }
  );
}

export function useBones() {
  return useQuery(
    ['bones'],
    async () => {
      const { data } = await apiClient.get('/api/user/profile/bones');
      return data;
    },
    { staleTime: 1000 * 60 }
  );
}
