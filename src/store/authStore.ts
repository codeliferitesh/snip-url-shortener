// ============================================================
// Auth Store — Zustand
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  // Actions
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
  setInitialized: (v: boolean) => void;
}

function mapFirebaseUser(u: FirebaseUser): User {
  return {
    uid:         u.uid,
    email:       u.email,
    displayName: u.displayName,
    photoURL:    u.photoURL,
    createdAt:   new Date(u.metadata.creationTime || Date.now()),
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:        null,
      loading:     true,
      initialized: false,

      setUser:        (user)    => set({ user }),
      setLoading:     (loading) => set({ loading }),
      setInitialized: (v)       => set({ initialized: v }),

      signInWithGoogle: async () => {
        set({ loading: true });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          set({ user: mapFirebaseUser(result.user) });
        } finally {
          set({ loading: false });
        }
      },

      signInWithEmail: async (email, password) => {
        set({ loading: true });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          set({ user: mapFirebaseUser(result.user) });
        } finally {
          set({ loading: false });
        }
      },

      registerWithEmail: async (email, password, name) => {
        set({ loading: true });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(result.user, { displayName: name });
          set({ user: mapFirebaseUser({ ...result.user, displayName: name }) });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        await signOut(auth);
        set({ user: null });
      },
    }),
    {
      name: 'snip-auth',
      partialize: (state) => ({ user: state.user }), // Only persist user
    }
  )
);

/** Initialize auth listener — call once at app root */
export function initAuthListener() {
  return onAuthStateChanged(auth, (firebaseUser) => {
    const { setUser, setLoading, setInitialized } = useAuthStore.getState();
    setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    setLoading(false);
    setInitialized(true);
  });
}
