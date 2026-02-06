import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  adminId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    adminId: string;
    email: string;
  }) => void;
  setUserDetails: (data: {
    firstName: string;
    lastName: string;
    email: string;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      adminId: null,
      email: null,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          adminId: data.adminId,
          email: data.email,
          isAuthenticated: true,
        }),
      setUserDetails: (data) =>
        set({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          adminId: null,
          email: null,
          firstName: null,
          lastName: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage", // localStorage key
    }
  )
);
