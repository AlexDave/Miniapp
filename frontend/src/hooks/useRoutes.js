import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';

export function useRoutes() {
  return useQuery(
    ['routes'],
    async () => {
      const { data } = await apiClient.get('/api/routes');
      if (Array.isArray(data)) {
        return { routes: data, route_paused: false, is_pro: false };
      }
      return {
        routes: Array.isArray(data?.routes) ? data.routes : [],
        route_paused: data?.route_paused === true,
        is_pro: data?.is_pro === true,
      };
    },
    { staleTime: 1000 * 60 * 2 }
  );
}

export function useSelectRoute() {
  const queryClient = useQueryClient();
  return useMutation(
    async (routeKey) => {
      const { data } = await apiClient.post(`/api/routes/${routeKey}/select`);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['routes']);
        queryClient.invalidateQueries(['profile']);
      },
    }
  );
}

export function usePauseRoute() {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const { data } = await apiClient.post('/api/routes/pause');
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['routes']);
        queryClient.invalidateQueries(['profile']);
      },
    }
  );
}

export function useResumeRoute() {
  const queryClient = useQueryClient();
  return useMutation(
    async () => {
      const { data } = await apiClient.post('/api/routes/resume');
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['routes']);
        queryClient.invalidateQueries(['profile']);
      },
    }
  );
}
