import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { User, UserRole } from "@/lib/types";

export interface AuthState {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  profileError: string | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
