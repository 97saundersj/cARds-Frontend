import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { FirebaseStorage } from "firebase/storage";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { IApi, UploadResult, SaveCardResult } from "./IApi";
import type { CardData } from "../../types/card";

export class FirebaseApi implements IApi {
  private app: FirebaseApp;
  private storage: FirebaseStorage;
  private db: Firestore;

  constructor() {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
    this.db = getFirestore(this.app);
  }

  async uploadImage(file: File): Promise<UploadResult> {
    try {
      const storageRef = ref(this.storage, `images/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      return {
        url,
        fileName: file.name,
      };
    } catch (error) {
      console.error("Firebase upload failed:", error);
      throw new Error("Failed to upload image to storage");
    }
  }

  async saveCard(cardData: CardData, cardId?: string): Promise<SaveCardResult> {
    try {
      const cardsCollection = collection(this.db, "cards");
      const cardDocRef = cardId
        ? doc(this.db, "cards", cardId)
        : doc(cardsCollection);

      const dataToSave = cardId
        ? { ...cardData, updatedAt: new Date().toISOString() }
        : { ...cardData, createdAt: new Date().toISOString() };

      await setDoc(cardDocRef, dataToSave);

      return {
        id: cardDocRef.id,
      };
    } catch (error) {
      console.error("Failed to save card:", error);
      throw new Error("Failed to save card to database");
    }
  }

  async getCard(id: string): Promise<CardData | null> {
    try {
      const cardDocRef = doc(this.db, "cards", id);
      const cardSnap = await getDoc(cardDocRef);

      if (!cardSnap.exists()) {
        return null;
      }

      const data = cardSnap.data();
      return {
        cardName: data.cardName,
        header: data.header,
        message: data.message,
        cardImage: data.cardImage,
        cardTop: data.cardTop,
        cardMiddle: data.cardMiddle,
        cardBottom: data.cardBottom,
      };
    } catch (error) {
      console.error("Failed to get card:", error);
      throw new Error("Failed to retrieve card from database");
    }
  }
}
