import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // User state
      user: null,
      userProfile: {
        petName: 'Ваш питомец',
        avatar: null,
        level: 1,
        experience: 0,
        totalCourses: 0,
        completedCourses: 0,
        streak: 0,
      },

      // UI state
      theme: 'light',
      sidebarOpen: false,
      notifications: [],

      // Course state
      courses: [],
      currentCourse: null,
      courseProgress: {},

      // Track state
      tracks: [],
      activeTracks: [],

      // Chat state
      chatMessages: [],
      chatContacts: [],

      // Actions
      setUser: (user) => set({ user }),
      
      updateUserProfile: (updates) => 
        set((state) => ({
          userProfile: { ...state.userProfile, ...updates }
        })),

      setTheme: (theme) => set({ theme }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      
      addNotification: (notification) => 
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id: Date.now() }]
        })),
      
      removeNotification: (id) => 
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),

      setCourses: (courses) => set({ courses }),
      
      setCurrentCourse: (course) => set({ currentCourse: course }),
      
      updateCourseProgress: (courseId, progress) => 
        set((state) => ({
          courseProgress: { ...state.courseProgress, [courseId]: progress }
        })),

      setTracks: (tracks) => set({ tracks }),
      
      addTrack: (track) => 
        set((state) => ({
          tracks: [...state.tracks, track],
          activeTracks: [...state.activeTracks, track]
        })),
      
      updateTrack: (trackId, updates) => 
        set((state) => ({
          tracks: state.tracks.map(t => t.trackId === trackId ? { ...t, ...updates } : t),
          activeTracks: state.activeTracks.map(t => t.trackId === trackId ? { ...t, ...updates } : t)
        })),

      setChatMessages: (messages) => set({ chatMessages: messages }),
      
      addChatMessage: (message) => 
        set((state) => ({
          chatMessages: [...state.chatMessages, message]
        })),

      setChatContacts: (contacts) => set({ chatContacts: contacts }),

      // Computed values
      getCompletedCoursesCount: () => {
        const state = get();
        return state.courses.filter(course => course.isCompleted).length;
      },

      getActiveTracksCount: () => {
        const state = get();
        return state.activeTracks.filter(track => !track.isCompleted).length;
      },

      getTotalExperience: () => {
        const state = get();
        return state.userProfile.experience + 
               (state.getCompletedCoursesCount() * 100) + 
               (state.getActiveTracksCount() * 50);
      },
    }),
    {
      name: 'dog-course-storage',
      partialize: (state) => ({
        userProfile: state.userProfile,
        theme: state.theme,
        courseProgress: state.courseProgress,
        tracks: state.tracks,
        chatMessages: state.chatMessages,
      }),
    }
  )
);

export default useStore;
