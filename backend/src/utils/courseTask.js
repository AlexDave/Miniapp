/** Поля задания в формате, ожидаемом фронтендом (trackId = id задачи курса). */
function taskToClient(task) {
  return {
    id: task.id,
    trackId: task.id,
    course_id: task.course_id,
    title: task.title,
    description: task.description,
    videoUrl: task.video_url,
    requiredPerDay: task.required_per_day,
    daysRemaining: task.duration_days,
    order_index: task.order_index,
    is_active: task.is_active,
  };
}

function courseToClient(course) {
  const { tasks, video_url, ...rest } = course;
  const out = { ...rest, videoUrl: video_url };
  if (tasks) {
    out.tasks = tasks.map(taskToClient);
  }
  return out;
}

module.exports = { taskToClient, courseToClient };
