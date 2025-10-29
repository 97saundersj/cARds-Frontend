export interface FrontPageElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  imageUrl?: string;
}

export interface CardData {
  cardName?: string;
  header: string;
  message: string;
  cardImage: string;
  cardTop: string;
  cardMiddle: string;
  cardBottom: string;
  frontPageElements?: FrontPageElement[];
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
