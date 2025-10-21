import type { UnityCardData } from "../../types/card";

export interface RendererLoadOptions {
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

export interface IARRenderer {
  initialize(
    canvas: HTMLCanvasElement,
    options?: RendererLoadOptions
  ): Promise<void>;
  updateCardData(data: UnityCardData): void;
  toggleAR(): void;
  cleanup(): void;
  isLoaded(): boolean;
}
