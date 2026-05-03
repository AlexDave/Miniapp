import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';

export function useTodayLesson() {
  return useQuery(['lesson', 'today'], async () => {
    const { data } = await apiClient.get('/api/lessons/today');
    return data;
  }, { staleTime: 1000 * 60 * 5 });
}

export function useLesson(lessonId) {
  return useQuery(
    ['lesson', lessonId],
    async () => {
      const { data } = await apiClient.get(`/api/lessons/${lessonId}`);
      return data;
    },
    { enabled: !!lessonId }
  );
}

export function useCourseModules(courseId) {
  return useQuery(
    ['modules', courseId],
    async () => {
      const { data } = await apiClient.get(`/api/lessons/course/${courseId}/modules`);
      return data;
    },
    { enabled: !!courseId }
  );
}

/** Плоский список уроков курса (все модули подряд) для экрана курса */
export function useCourseLessons(courseId) {
  return useQuery(
    ['course-lessons-flat', courseId],
    async () => {
      const { data: modules } = await apiClient.get(`/api/lessons/course/${courseId}/modules`);
      if (!modules?.length) return [];
      const responses = await Promise.all(
        modules.map((m) => apiClient.get(`/api/lessons/module/${m.id}`))
      );
      const flat = [];
      for (const { data: modData } of responses) {
        const lessons = modData?.lessons ?? [];
        for (const l of lessons) {
          flat.push({
            id: l.id,
            title: l.title,
            description: l.description,
            order_index: l.order_index,
            xp_reward: l.xp_reward,
            is_completed: l.status === 'completed',
          });
        }
      }
      return flat;
    },
    { enabled: !!courseId }
  );
}

export function useModuleLessons(moduleId) {
  return useQuery(
    ['lessons', 'module', moduleId],
    async () => {
      const { data } = await apiClient.get(`/api/lessons/module/${moduleId}`);
      return data;
    },
    { enabled: !!moduleId }
  );
}

export function useLessonsBySkill(skillKey) {
  return useQuery(
    ['lessons-by-skill', skillKey],
    async () => {
      const { data } = await apiClient.get(`/api/lessons/by-skill/${skillKey}`);
      return data;
    },
    { enabled: !!skillKey, staleTime: 1000 * 60 }
  );
}

export function useRetryAfterFail() {
  const queryClient = useQueryClient();
  return useMutation(
    async (lessonId) => {
      const { data } = await apiClient.post(`/api/lessons/${lessonId}/retry-after-fail`);
      return data;
    },
    {
      onSuccess: (_, lessonId) => {
        queryClient.invalidateQueries(['lesson', lessonId]);
        queryClient.invalidateQueries(['lesson', 'today']);
      },
    }
  );
}

export function useSubmitReport() {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ lessonId, steps_data, success, note, from_fallback_tier }) => {
      const body = { steps_data, success, note };
      if (from_fallback_tier != null) body.from_fallback_tier = from_fallback_tier;
      const { data } = await apiClient.post(`/api/lessons/${lessonId}/report`, body);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['lesson', 'today']);
        queryClient.invalidateQueries(['lesson']);
        queryClient.invalidateQueries(['profile']);
        queryClient.invalidateQueries(['stats']);
        queryClient.invalidateQueries(['activity']);
        queryClient.invalidateQueries(['skill-map']);
        queryClient.invalidateQueries(['trophy-videos']);
      },
    }
  );
}

export function useTrophyVideos() {
  return useQuery(
    ['trophy-videos'],
    async () => {
      const { data } = await apiClient.get('/api/user/trophy-videos');
      return data?.videos ?? [];
    },
    { staleTime: 1000 * 60 }
  );
}

export function useMarkTheorySeen() {
  const queryClient = useQueryClient();
  return useMutation(
    async (lessonId) => {
      const { data } = await apiClient.post(`/api/lessons/${lessonId}/theory-seen`);
      return data;
    },
    {
      onSuccess: (_, lessonId) => {
        queryClient.invalidateQueries(['lesson', lessonId]);
      },
    }
  );
}

export function useStartTask() {
  const queryClient = useQueryClient();
  return useMutation(
    async (lessonId) => {
      const { data } = await apiClient.post(`/api/lessons/${lessonId}/start-task`);
      return data;
    },
    {
      onSuccess: (_, lessonId) => {
        queryClient.invalidateQueries(['lesson', lessonId]);
      },
    }
  );
}

export function useRepeatLesson() {
  const queryClient = useQueryClient();
  return useMutation(
    async (lessonId) => {
      const { data } = await apiClient.post(`/api/lessons/${lessonId}/repeat-start`);
      return data;
    },
    {
      onSuccess: (_, lessonId) => {
        queryClient.invalidateQueries(['lesson', lessonId]);
      },
    }
  );
}

export function useLessonHistory(lessonId) {
  return useQuery(
    ['lesson-history', lessonId],
    async () => {
      const { data } = await apiClient.get(`/api/lessons/${lessonId}/history`);
      return data;
    },
    { enabled: !!lessonId }
  );
}
