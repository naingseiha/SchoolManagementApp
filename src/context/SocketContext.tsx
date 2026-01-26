"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { socketClient } from "@/lib/socket";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  isConnected: boolean;
  emit: (event: string, data?: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  emit: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Connect socket when user is authenticated
    if (currentUser) {
      const token = localStorage.getItem("token");
      if (token) {
        socketClient.connect(token);
        console.log("Socket connection initiated for user:", currentUser.id);
      }
    }

    // Disconnect on unmount or when user logs out
    return () => {
      if (!currentUser) {
        socketClient.disconnect();
      }
    };
  }, [currentUser]);

  const value: SocketContextType = {
    isConnected: socketClient.isConnected(),
    emit: (event: string, data?: any) => {
      socketClient.emit(event, data);
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}
