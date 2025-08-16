
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getDB } from './db';

interface User {
  id: number;
  nom: string;
}

interface UserContextType {
  personnel: User[];
  activeUser: User | null;
  setActiveUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchPersonnel = async () => {
      const db = await getDB();
      const result = db.exec("SELECT id, nom FROM personnel");
      if (result.length > 0) {
        const users = result[0].values.map(v => ({ id: v[0] as number, nom: v[1] as string }));
        setPersonnel(users);
        if (!activeUser && users.length > 0) {
          // Set a default active user
          setActiveUser(users[0]);
        }
      }
    };
    fetchPersonnel();
  }, [activeUser]);

  return (
    <UserContext.Provider value={{ personnel, activeUser, setActiveUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
