import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteKeys, setFavoriteKeys] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshFavorites = async () => {
    if (!user) {
      setFavoriteKeys(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await api.getFavorites();
      setFavoriteKeys(new Set(res.favoriteKeys || []));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user]);

  const isFavorite = (itemType, itemId) => {
    return favoriteKeys.has(`${itemType}:${itemId}`);
  };

  const toggleFavorite = async (itemType, itemId) => {
    const key = `${itemType}:${itemId}`;
    const wasFav = favoriteKeys.has(key);

    // Optimistic UI update
    setFavoriteKeys((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(key);
      else next.add(key);
      return next;
    });

    try {
      const res = await api.toggleFavorite(itemType, itemId);
      return res.isFavorite;
    } catch (error) {
      // Revert if error
      setFavoriteKeys((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(key);
        else next.delete(key);
        return next;
      });
      return wasFav;
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteKeys,
        loading,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
