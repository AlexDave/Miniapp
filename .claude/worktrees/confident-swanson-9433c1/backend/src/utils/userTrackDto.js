/** Ответ API /api/user/tracks — тот же camelCase, что при вложенных документах MongoDB. */
function userTaskToTrackDto(userTask) {
  const task = userTask.task;
  return {
    trackId: userTask.task_id,
    title: task.title,
    completedToday: userTask.completed_today,
    requiredPerDay: task.required_per_day,
    lastCompletedAt: userTask.last_completed_at,
    daysRemaining: userTask.days_remaining,
    isCompleted: userTask.is_completed,
  };
}

module.exports = { userTaskToTrackDto };
