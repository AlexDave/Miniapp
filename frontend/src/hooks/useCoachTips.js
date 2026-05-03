import { useMutation, useQueryClient } from 'react-query';
import { apiClient } from './useApi';
import config from '../config';

const PREF_KEY = {
  dashboard: 'coach_dashboard_tip_seen',
  train: 'coach_train_tip_seen',
  lesson: 'coach_lesson_tip_seen',
};

/** Одноразово отметить подсказку как показанную (в Profile.preferences). */
export function useDismissCoachTip() {
  const queryClient = useQueryClient();
  return useMutation(
    async (which) => {
      const key = PREF_KEY[which];
      if (!key) throw new Error('unknown tip');
      const { data } = await apiClient.put(config.api.endpoints.profile, {
        preferences: { [key]: true },
      });
      return data;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['profile'], data);
      },
    }
  );
}
