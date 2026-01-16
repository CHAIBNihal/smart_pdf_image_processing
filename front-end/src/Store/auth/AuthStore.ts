import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  signUp,
  login as loginService,
  verifyToken as verifyTokenService,
} from "../../api/services/authService";

interface AuthState {
  isLoggingIn: boolean;
  token?: string | null;
  user: null | {
    sub: string;
    email: string;
    username: string;
    role: string;
  };
  isRegisterLoading: boolean;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyToken?: () => Promise<boolean>;
}

export const AuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        isLoggingIn: false,
        token: null,
        user: null,
        isRegisterLoading: false,
        register: async (
          fullName: string,
          email: string,
          password: string
        ): Promise<boolean> => {
          set({ isRegisterLoading: true });
          try {
            await signUp(fullName, email, password);
            return true;
          } catch (error) {
            console.error("Register error:", error);
            return false;
          } finally {
            set({ isRegisterLoading: false });
          }
        },
        login: async (email: string, password: string): Promise<boolean> => {
          set({ isLoggingIn: true });
          try {
            const res = await loginService(email, password);
            console.log("Response Login :: ", res)
            if (res && res.access_token) {
              set({ token: res.access_token });
            }
            return true;
          } catch (error) {
            console.error("Login error:", error);
            return false;
          } finally {
            set({ isLoggingIn: false });
          }
        },
        logout: (): void => {
          set({
            isLoggingIn: false,
            isRegisterLoading: false,
            token: null,
            user: null,
          });
        },
        verifyToken: async (): Promise<boolean> => {
          const token = AuthStore.getState().token;
          if (!token) {
            console.debug("verifyToken: no token present, skipping verification");
            return false;
          }
          try {
            const userPayload = await verifyTokenService(); // ← API call
            set({
              user: userPayload,
            });
            return true;
          } catch (error) {
            console.error("Verify token error:", error);
            // Clear auth state on failed verification
            try {
              AuthStore.getState().logout();
            } catch (e) {
              console.error("Logout after failed verify failed:", e);
            }
            return false;
          }
        },
      }),

      {
        name: "auth-storage",
        partialize: (state) => ({
          isLoggingIn: state.isLoggingIn,
          isRegisterLoading: state.isRegisterLoading,
          token: state.token,
        }),
        onRehydrateStorage: () => (state) => {
          try {
            if (state?.token) {
              localStorage.setItem("token", state.token);
            }
          } catch (error) {
            console.error("Error during rehydration:", error);
          }
        },
      }
    ),
    { name: "auth-store" }
  )
);
