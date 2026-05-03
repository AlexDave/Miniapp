import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      userProfile: {
        petName: 'Ваш питомец',
        avatar: null,
        level: 1,
        experience: 0,
        coins: 0,
        skills: { focus: 0, recall: 0, sit: 0 },
        totalCourses: 0,
        completedCourses: 0,
        streak: 0,
        lessonQuietMode: false,
        remindersEnabled: false,
        reminderTime: '19:00',
        reminderTz: 'Europe/Moscow',
        reminderQuietWeekends: false,
        reminderBotLinked: false,
        tier: 'free',
        tierExpiresAt: null,
        isPro: false,
        isProPaidPeriod: false,
      },

      theme: 'light',
      notifications: [],

      courses: [],
      currentCourse: null,
      courseProgress: {},

      chatMessages: [],
      chatContacts: [],

      setUser: (user) => set({ user }),

      updateUserProfile: (updates) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates },
        })),

      setTheme: (theme) => set({ theme }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id: Date.now() }],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      setCourses: (courses) => set({ courses }),

      setCurrentCourse: (course) => set({ currentCourse: course }),

      updateCourseProgress: (courseId, progress) =>
        set((state) => ({
          courseProgress: { ...state.courseProgress, [courseId]: progress },
        })),

      setChatMessages: (messages) => set({ chatMessages: messages }),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      setChatContacts: (contacts) => set({ chatContacts: contacts }),

      getCompletedCoursesCount: () => {
        const state = get();
        return state.courses.filter((course) => course.isCompleted).length;
      },

      getTotalExperience: () => {
        const state = get();
        return state.userProfile.experience + state.getCompletedCoursesCount() * 100;
      },
    }),
    {
      name: 'dog-course-storage-v3',
      partialize: (state) => ({
        userProfile: state.userProfile,
        theme: state.theme,
        courseProgress: state.courseProgress,
        chatMessages: state.chatMessages,
      }),
    }
  )
);

export default useStore;
