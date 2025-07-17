"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useState, useEffect } from "react";
import type { User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  favorites: string[];
  login: (user: User) => void;
  logout: () => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
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

  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem("click-shop-user", JSON.stringify(userData));
    if (userData.role === 'Customer') {
        const userFavorites = localStorage.getItem(`click-shop-favorites-${userData.id}`);
        setFavorites(userFavorites ? JSON.parse(userFavorites) : []);
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
