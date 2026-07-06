import { create } from 'zustand';

const useAuthStore = create((set) => ({
  email: '', // Initial state is empty
  setEmail: (newEmail) => set({ email: newEmail }), // Action to update email
  clearEmail: () => set({ email: '' }), // Action to clear email after successful verification
}));

export default useAuthStore;
