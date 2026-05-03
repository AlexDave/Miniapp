import { useQuery } from 'react-query';
import { apiClient } from './useApi';

export function useSkillTree() {
  return useQuery(
    ['skill-tree'],
    async () => {
      const { data } = await apiClient.get('/api/skills/tree');
      return data;
    },
    { staleTime: 1000 * 60 * 2 }
  );
}

export function useLessonsForSkill(skillKey) {
  return useQuery(
    ['skill-lessons', skillKey],
    async () => {
      const { data } = await apiClient.get(`/api/skills/${skillKey}/lessons`);
      return data;
    },
    { enabled: !!skillKey, staleTime: 1000 * 30 }
  );
}
