import React, { useState, type ReactNode, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { UserContext, type User } from './UserContextBase';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [personnel, setPersonnel] = useState<User[]>([]);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const activeUserRef = useRef<User | null>(null);

  useEffect(() => {
    activeUserRef.current = activeUser;
  }, [activeUser]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const subscribe = async () => {
      if (!isMounted) return;
      unsubscribe = onSnapshot(collection(db, 'personnel'), (snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
        setPersonnel(users);

        const current = activeUserRef.current;
        if (!current && users.length > 0) {
          setActiveUser(users[0]);
          return;
        }

        if (current && !users.find((u) => u.id === current.id)) {
          setActiveUser(users[0] || null);
        }
      });
    };

    subscribe();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <UserContext.Provider value={{ personnel, activeUser, setActiveUser }}>
      {children}
    </UserContext.Provider>
  );
};
