export interface CardData {
  cardName?: string;
  header: string;
  message: string;
  cardImage: string;
  cardTop: string;
  cardMiddle: string;
  cardBottom: string;
}

export interface UnityCardData {
  cardImage: string;
  cardTop: string;
  cardMiddle: string;
  cardBottom: string;
}

export type CardImageType =
  | "birthday"
  | "valentine"
  | "halloween"
  | "christmas"
  | "custom";

export interface UnityConfig {
  dataUrl: string;
  frameworkUrl: string;
  codeUrl: string;
  streamingAssetsUrl?: string;
  companyName?: string;
  productName?: string;
  productVersion?: string;
}
