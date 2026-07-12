'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'coordinator' | 'candidate';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  idNumber: string;
}

interface AuthContextValue {
  user: User | null;
  initialized: boolean;
  login: (idNumber: string) => boolean;
  logout: () => void;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    idNumber: 'ADMIN001',
    name: 'Admin User',
    email: 'admin@talentmap.ma',
    role: 'admin',
  },
  {
    id: '2',
    idNumber: 'COORD001',
    name: 'Sara Coordinator',
    email: 'sara@talentmap.ma',
    role: 'coordinator',
  },
  {
    id: '3',
    idNumber: 'CAN001',
    name: 'Mohammed Ait Aissa',
    email: 'mohammed@email.com',
    role: 'candidate',
  },
  {
    id: '4',
    idNumber: 'CAN002',
    name: 'Sarah Benali',
    email: 'sarah@email.com',
    role: 'candidate',
  },
  {
    id: '5',
    idNumber: 'CAN003',
    name: 'Karim Djebbar',
    email: 'karim@email.com',
    role: 'candidate',
  },
];

const STORAGE_KEY = 'talentmap_user';

const RE_CANDIDATE = /^[A-Z]{2,3}\d{3,}$/;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  // Initialize user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setInitialized(true);
    }
  }, []);

  const login = (idNumber: string): boolean => {
    const normalised = idNumber.trim().toUpperCase();

    // Check hardcoded users first (admin, coordinator, known candidates)
    const found = MOCK_USERS.find(
      (u) => u.idNumber.toLowerCase() === normalised.toLowerCase()
    );
    if (found) {
      setUser(found);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
      return true;
    }

    // Accept any valid candidate code: 2–3 uppercase letters + 3+ digits (e.g. AB12345)
    if (RE_CANDIDATE.test(normalised)) {
      const dynamic: User = {
        id: normalised,
        idNumber: normalised,
        name: `Candidat ${normalised}`,
        email: `${normalised.toLowerCase()}@talentmap.ma`,
        role: 'candidate',
      };
      setUser(dynamic);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dynamic));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, initialized, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
