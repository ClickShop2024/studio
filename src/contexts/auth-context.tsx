"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useState, useEffect } from "react";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  favorites: string[];
  login: (user: User) => boolean;
  logout: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  getAllUsers: () => User[];
  updateUser: (updatedUser: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("click-shop-user");
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'Customer') {
            const storedFavorites = localStorage.getItem(`click-shop-favorites-${parsedUser.id}`);
            if (storedFavorites) {
              setFavorites(JSON.parse(storedFavorites));
            }
        }
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      localStorage.removeItem("click-shop-user");
    } finally {
        setIsLoaded(true);
    }
  }, []);

  const login = useCallback((userData: User): boolean => {
    // Check if user is blocked
    const storedUser = localStorage.getItem(`user-${userData.email}`);
    if (storedUser) {
        const fullUserData: User = JSON.parse(storedUser);
        if (fullUserData.status === 'blocked') {
            return false; // Indicate login failure
        }
        // Update last login
        fullUserData.lastLogin = new Date().toISOString();
        localStorage.setItem(`user-${fullUserData.email}`, JSON.stringify(fullUserData));
        setUser(fullUserData);
        localStorage.setItem("click-shop-user", JSON.stringify(fullUserData));
         if (fullUserData.role === 'Customer') {
            const userFavorites = localStorage.getItem(`click-shop-favorites-${fullUserData.id}`);
            setFavorites(userFavorites ? JSON.parse(userFavorites) : []);
        }
        return true; // Indicate login success
    }
    
    // Fallback for users not fully stored (e.g. from previous app versions)
    setUser(userData);
    localStorage.setItem("click-shop-user", JSON.stringify(userData));
    return true;
  }, []);

  const logout = useCallback(() => {
    if (user && user.role === 'Customer') {
        localStorage.removeItem(`click-shop-favorites-${user.id}`);
    }
    setUser(null);
    setFavorites([]);
    localStorage.removeItem("click-shop-user");
  }, [user]);

  const toggleFavorite = useCallback((productId: string) => {
    if (!user || user.role !== 'Customer') return; 

    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(productId)
        ? prevFavorites.filter(id => id !== productId)
        : [...prevFavorites, productId];
      
      localStorage.setItem(`click-shop-favorites-${user.id}`, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, [user]);

  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId);
  }, [favorites]);

  const getAllUsers = useCallback((): User[] => {
    const users: User[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('user-')) {
            const userString = localStorage.getItem(key);
            if (userString) {
                users.push(JSON.parse(userString));
            }
        }
    }
    return users;
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
     localStorage.setItem(`user-${updatedUser.email}`, JSON.stringify(updatedUser));
     // If the updated user is the currently logged-in user, update the context as well
     if (user && user.id === updatedUser.id) {
         setUser(updatedUser);
         localStorage.setItem("click-shop-user", JSON.stringify(updatedUser));
     }
  }, [user]);
  
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        favorites,
        toggleFavorite,
        isFavorite,
        getAllUsers,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
