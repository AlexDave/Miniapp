import { useQuery } from 'react-query';
import axios from 'axios';
import config from '../config';

const api = axios.create({ baseURL: config.baseUrl, withCredentials: true });

export function useSkillMap() {
  return useQuery(['skill-map'], async () => {
    const { data } = await api.get('/api/user/skill-map');
    return data;
  }, { staleTime: 1000 * 60 * 10 });
}

export function useActivity() {
  return useQuery(['activity'], async () => {
    const { data } = await api.get('/api/user/activity');
    return data;
  }, { staleTime: 1000 * 60 * 15 });
}

export function useUserStats() {
  return useQuery(['stats'], async () => {
    const { data } = await api.get('/api/user/stats');
    return data;
  }, { staleTime: 1000 * 60 * 5 });
}
