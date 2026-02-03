import { createContext } from 'react';

export interface User {
  id: string;
  nom: string;
}

export interface UserContextType {
  personnel: User[];
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
