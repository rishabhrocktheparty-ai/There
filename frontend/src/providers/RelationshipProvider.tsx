import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Relationship, CreateRelationshipRequest } from '../types/relationship';
import { relationshipService } from '../services/relationshipService';
import { useNotifications } from './NotificationProvider';

interface RelationshipContextType {
  relationships: Relationship[];
  activeRelationship: Relationship | null;
  loading: boolean;
  setActiveRelationship: (relationship: Relationship | null) => void;
  switchRelationship: (id: string) => void;
  createRelationship: (request: CreateRelationshipRequest) => Promise<Relationship>;
  updateRelationship: (id: string, updates: any) => Promise<void>;
  deleteRelationship: (id: string) => Promise<void>;
  refreshRelationships: () => Promise<void>;
}

const RelationshipContext = createContext<RelationshipContextType | undefined>(undefined);

export const useRelationships = () => {
  const context = useContext(RelationshipContext);
  if (!context) {
    throw new Error('useRelationships must be used within RelationshipProvider');
  }
  return context;
};

interface RelationshipProviderProps {
  children: React.ReactNode;
}

export const RelationshipProvider: React.FC<RelationshipProviderProps> = ({ children }) => {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [activeRelationship, setActiveRelationship] = useState<Relationship | null>(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const loadRelationships = useCallback(async () => {
    try {
      setLoading(true);
      const data = await relationshipService.getRelationships();
      setRelationships(data);
      
      // Set first active relationship as default if none selected
      if (!activeRelationship && data.length > 0) {
        const firstActive = data.find((r) => r.status === 'active');
        if (firstActive) {
          setActiveRelationship(firstActive);
        }
      }
    } catch (error) {
      console.error('Failed to load relationships:', error);
      addNotification({
        id: `error-${Date.now()}`,
        message: 'Failed to load relationships',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [activeRelationship, addNotification]);

  useEffect(() => {
    loadRelationships();
  }, []);

  const switchRelationship = useCallback(
    (id: string) => {
      const relationship = relationships.find((r) => r.id === id);
      if (relationship) {
        setActiveRelationship(relationship);
        addNotification({
          id: `switch-${Date.now()}`,
          message: `Switched to ${relationship.roleName}`,
          type: 'info',
        });
      }
    },
    [relationships, addNotification]
  );

  const createRelationship = useCallback(
    async (request: CreateRelationshipRequest): Promise<Relationship> => {
      try {
        const newRelationship = await relationshipService.createRelationship(request);
        setRelationships((prev) => [...prev, newRelationship]);
        setActiveRelationship(newRelationship);
        
        addNotification({
          id: `created-${Date.now()}`,
          message: 'Relationship created successfully',
          type: 'success',
        });
        
        return newRelationship;
      } catch (error) {
        console.error('Failed to create relationship:', error);
        addNotification({
          id: `error-${Date.now()}`,
          message: 'Failed to create relationship',
          type: 'error',
        });
        throw error;
      }
    },
    [addNotification]
  );

  const updateRelationship = useCallback(
    async (id: string, updates: any) => {
      try {
        const updated = await relationshipService.updateRelationship(id, updates);
        
        setRelationships((prev) =>
          prev.map((r) => (r.id === id ? updated : r))
        );
        
        if (activeRelationship?.id === id) {
          setActiveRelationship(updated);
        }
        
        addNotification({
          id: `updated-${Date.now()}`,
          message: 'Relationship updated successfully',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to update relationship:', error);
        addNotification({
          id: `error-${Date.now()}`,
          message: 'Failed to update relationship',
          type: 'error',
        });
        throw error;
      }
    },
    [activeRelationship, addNotification]
  );

  const deleteRelationship = useCallback(
    async (id: string) => {
      try {
        await relationshipService.deleteRelationship(id);
        
        setRelationships((prev) => prev.filter((r) => r.id !== id));
        
        if (activeRelationship?.id === id) {
          const remaining = relationships.filter((r) => r.id !== id);
          setActiveRelationship(remaining.length > 0 ? remaining[0] : null);
        }
        
        addNotification({
          id: `deleted-${Date.now()}`,
          message: 'Relationship deleted successfully',
          type: 'success',
        });
      } catch (error) {
        console.error('Failed to delete relationship:', error);
        addNotification({
          id: `error-${Date.now()}`,
          message: 'Failed to delete relationship',
          type: 'error',
        });
        throw error;
      }
    },
    [relationships, activeRelationship, addNotification]
  );

  const refreshRelationships = useCallback(async () => {
    await loadRelationships();
  }, [loadRelationships]);

  const value: RelationshipContextType = {
    relationships,
    activeRelationship,
    loading,
    setActiveRelationship,
    switchRelationship,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    refreshRelationships,
  };

  return (
    <RelationshipContext.Provider value={value}>
      {children}
    </RelationshipContext.Provider>
  );
};
