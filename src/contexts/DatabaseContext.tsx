'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { testDatabaseConnection } from '@/lib/database';

interface DatabaseContextType {
  isConnected: boolean;
  isLoading: boolean;
  connectionError: string | null;
  useDatabase: boolean;
  toggleDatabaseMode: () => void;
  testConnection: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [useDatabase, setUseDatabase] = useState(false);

  const testConnection = async (): Promise<void> => {
    setIsLoading(true);
    setConnectionError(null);
    
    try {
      const connected = await testDatabaseConnection();
      setIsConnected(connected);
      
      if (!connected) {
        setConnectionError('Failed to connect to database');
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionError(error instanceof Error ? error.message : 'Unknown database error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDatabaseMode = () => {
    setUseDatabase(!useDatabase);
    localStorage.setItem('useDatabaseMode', (!useDatabase).toString());
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('useDatabaseMode');
    if (savedMode) {
      setUseDatabase(savedMode === 'true');
    }

    const hasRequiredEnvVars = 
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (hasRequiredEnvVars) {
      testConnection();
    } else {
      setIsLoading(false);
      setConnectionError('Database environment variables not configured');
    }
  }, []);

  const value: DatabaseContextType = {
    isConnected,
    isLoading,
    connectionError,
    useDatabase,
    toggleDatabaseMode,
    testConnection,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};