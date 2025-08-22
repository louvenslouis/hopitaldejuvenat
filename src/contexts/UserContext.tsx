import React, { createContext, useState, useContext, type ReactNode, useEffect } from 'react';
import { getCollection } from '../firebase/firestoreService';

interface User {
  id: string;
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
      const users = await getCollection('personnel');
      setPersonnel(users as User[]);
      if (!activeUser && users.length > 0) {
        // Set a default active user
        setActiveUser(users[0] as User);
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