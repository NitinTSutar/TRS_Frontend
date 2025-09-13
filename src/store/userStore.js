import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
       name: "user-storage", // unique name for localStorage key
      // Only persist the 'user' part of the state, excluding actions.
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);

export default useUserStore;
