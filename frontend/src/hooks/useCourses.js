import { useQuery } from 'react-query';
import { apiClient } from './useApi';
import config from '../config';

export function useCourses() {
  return useQuery(['courses'], async () => {
    const { data } = await apiClient.get(config.api.endpoints.courses);
    return data;
  });
}

export function useCourse(id) {
  return useQuery(
    ['courses', id],
    async () => {
      const { data } = await apiClient.get(`${config.api.endpoints.courses}/${id}`);
      return data;
    },
    { enabled: !!id }
  );
}
