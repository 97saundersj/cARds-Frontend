import type { CardData } from "../../types/card";

const SESSION_KEY = "userCards";

export interface SavedCard {
  id: string;
  name: string;
  data: CardData;
  lastModified: string;
}

export const sessionCards = {
  getAll(): SavedCard[] {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to get cards from session:", error);
      return [];
    }
  },

  save(name: string, data: CardData, existingId?: string): SavedCard {
    const cards = this.getAll();
    const id = existingId || crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const savedCard: SavedCard = {
      id,
      name,
      data,
      lastModified: timestamp,
    };

    const existingIndex = cards.findIndex((c) => c.id === id);
    if (existingIndex >= 0) {
      cards[existingIndex] = savedCard;
    } else {
      cards.push(savedCard);
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(cards));
    return savedCard;
  },

  getById(id: string): SavedCard | null {
    const cards = this.getAll();
    return cards.find((c) => c.id === id) || null;
  },

  delete(id: string): void {
    const cards = this.getAll();
    const filtered = cards.filter((c) => c.id !== id);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(filtered));
  },
};
