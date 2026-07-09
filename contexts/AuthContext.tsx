'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'coordinator' | 'candidate';

export interface User {
  id: string;
  idNumber: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  sector?: string;
  region?: string;
}

interface AuthCtx {
  user: User | null;
  login: (idNumber: string) => boolean;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({ user: null, login: () => false, logout: () => {}, loading: true });

const MOCK_USERS: User[] = [
  { id: '1', idNumber: 'ADMIN001', name: 'Admin TalentMap', email: 'admin@talentmap.ma', role: 'admin', phone: '+212 6 00 00 00 00', region: 'Casablanca-Settat' },
  { id: '2', idNumber: 'COORD001', name: 'Sara Moussaoui', email: 'sara@talentmap.ma', role: 'coordinator', phone: '+212 6 11 22 33 44', region: 'Rabat-Salé-Kénitra' },
  { id: '3', idNumber: 'COORD002', name: 'Khalid Benali', email: 'khalid@talentmap.ma', role: 'coordinator', phone: '+212 6 55 66 77 88', region: 'Fès-Meknès' },
  { id: '4', idNumber: 'CAN001', name: 'Mohammed Ait Aissa', email: 'mohammed@email.com', role: 'candidate', phone: '+212 6 11 00 11 00', sector: 'Numérique/TIC', region: 'Casablanca-Settat' },
  { id: '5', idNumber: 'CAN002', name: 'Sarah Benali', email: 'sarah@email.com', role: 'candidate', phone: '+212 6 22 00 22 00', sector: 'Artisanat', region: 'Fès-Meknès' },
  { id: '6', idNumber: 'CAN003', name: 'Karim Djebbar', email: 'karim@email.com', role: 'candidate', phone: '+212 6 33 00 33 00', sector: 'Agriculture/Élevage', region: 'Souss-Massa' },
  { id: '7', idNumber: 'CAN004', name: 'Fatima Zahra Ouali', email: 'fatima@email.com', role: 'candidate', phone: '+212 6 44 00 44 00', sector: 'Commerce/Services', region: 'Marrakech-Safi' },
  { id: '8', idNumber: 'CAN005', name: 'Youssef El Mansouri', email: 'youssef@email.com', role: 'candidate', phone: '+212 6 55 00 55 00', sector: 'BTP/Maçonnerie', region: 'Oriental' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('talentmap_user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setLoading(false);
  }, []);

  function login(idNumber: string): boolean {
    const match = MOCK_USERS.find(u => u.idNumber.toLowerCase() === idNumber.trim().toLowerCase());
    if (!match) return false;
    setUser(match);
    try { localStorage.setItem('talentmap_user', JSON.stringify(match)); } catch {}
    return true;
  }

  function logout() {
    setUser(null);
    try { localStorage.removeItem('talentmap_user'); } catch {}
    router.push('/login');
  }

  return <Ctx.Provider value={{ user, login, logout, loading }}>{children}</Ctx.Provider>;
}

export function useAuth() { return useContext(Ctx); }
