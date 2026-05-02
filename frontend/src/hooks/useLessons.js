import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';

export function useCourseLessons(courseId) {
  return useQuery(
    ['lessons', courseId],
    async () => {
      const { data } = await apiClient.get(`/api/courses/${courseId}/lessons`);
      return data;
    },
    { enabled: !!courseId }
  );
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

export function useTodayLesson() {
  return useQuery(['today-lesson'], async () => {
    const { data } = await apiClient.get('/api/user/today-lesson');
    return data;
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation(
    async (lessonId) => {
      const { data } = await apiClient.post(`/api/lessons/${lessonId}/complete`);
      return data;
    },
    {
      onSuccess: (_, lessonId) => {
        queryClient.invalidateQueries(['lesson', lessonId]);
        queryClient.invalidateQueries(['lessons']);
        queryClient.invalidateQueries(['today-lesson']);
        queryClient.invalidateQueries(['profile']);
        queryClient.invalidateQueries(['achievements']);
      },
    }
  );
}
