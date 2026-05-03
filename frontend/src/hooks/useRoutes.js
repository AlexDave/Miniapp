import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';

export function useRoutes() {
  return useQuery(
    ['routes'],
    async () => {
      const { data } = await apiClient.get('/api/routes');
      return data;
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
