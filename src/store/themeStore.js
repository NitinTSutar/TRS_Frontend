import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'black', // Default theme
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'black' ? 'lofi' : 'black',
        })),
    }),
    { name: 'theme-storage' } // Unique name for localStorage key
  )
);



export default useThemeStore;