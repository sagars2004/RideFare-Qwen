"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type User = {
  email: string;
  name: string;
  state: string;
  cc_last4: string;
} | null;

interface AuthContextType {
  user: User;
  setUser: (user: User) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  showAuthModal: false,
  setShowAuthModal: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("ridefare_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSetUser = (newUser: User) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("ridefare_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("ridefare_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, showAuthModal, setShowAuthModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
