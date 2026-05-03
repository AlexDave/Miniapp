/**
 * Собирает steps_data для API: чекбоксы из пошагового потока + rating из эмоционального выбора.
 */
export function mergeDailyTaskStepsData(task, checkboxRows, success) {
  if (!task?.steps?.length) return [];

  return task.steps.map((s) => {
    if (s.type === 'checkbox') {
      const hit = checkboxRows?.find((r) => r.step_id === s.id);
      return { step_id: s.id, value: !!hit };
    }
    if (s.type === 'rating') {
      const v = success === 'yes' ? 3 : success === 'partial' ? 2 : 1;
      return { step_id: s.id, value: v };
    }
    if (s.type === 'counter') {
      return { step_id: s.id, value: 0 };
    }
    if (s.type === 'text') {
      return { step_id: s.id, value: '' };
    }
    return { step_id: s.id, value: null };
  });
}
