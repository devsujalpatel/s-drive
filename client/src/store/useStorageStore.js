
import { create } from 'zustand';

const useStorageStore = create((set) => ({
  availableSpace: 0,
  setAvailableSpace: (space) => set({ availableSpace: space }),
}));

export default useStorageStore;