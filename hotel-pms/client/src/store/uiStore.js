import { create } from "zustand";

export const useUiStore = create((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  activeHotelId: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  openModal: (name, payload = null) =>
    set({ activeModal: { name, payload } }),
  closeModal: () => set({ activeModal: null }),

  setActiveHotel: (hotelId) => set({ activeHotelId: hotelId }),
}));
