import { useQuery } from 'react-query';
import axios from 'axios';
import config from '../config';

const api = axios.create({ baseURL: config.baseUrl, withCredentials: true });

export function useCourses() {
  return useQuery(['courses'], async () => {
    const { data } = await api.get(config.api.endpoints.courses);
    return data;
  });
}

export function useCourse(id) {
  return useQuery(
    ['courses', id],
    async () => {
      const { data } = await api.get(`${config.api.endpoints.courses}/${id}`);
      return data;
    },
    { enabled: !!id }
  );
}
