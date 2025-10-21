import type { CardData } from "../../types/card";

export interface UploadResult {
  url: string;
  fileName: string;
}

export interface SaveCardResult {
  id: string;
}

export interface IApi {
  uploadImage(file: File): Promise<UploadResult>;
  saveCard(cardData: CardData, cardId?: string): Promise<SaveCardResult>;
  getCard(id: string): Promise<CardData | null>;
}
