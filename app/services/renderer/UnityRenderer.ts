import type { IARRenderer, RendererLoadOptions } from "./IARRenderer";
import type { UnityCardData, UnityConfig } from "../../types/card";

declare global {
  interface Window {
    createUnityInstance: any;
  }
}

class UnityRenderer implements IARRenderer {
  private instance: any = null;
  private loaded = false;
  private scriptLoaded = false;
  private isInitializing = false;
  private readonly buildUrl: string;
  private readonly buildName: string;

  constructor() {
    const baseUrl = import.meta.env.VITE_UNITY_BUILD_URL;
    this.buildUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    this.buildName = import.meta.env.VITE_UNITY_BUILD_NAME;
  }

  async initialize(
    canvas: HTMLCanvasElement,
    options?: RendererLoadOptions
  ): Promise<void> {
    if (this.loaded && this.instance) {
      console.log("Unity already loaded, reusing instance");
      options?.onLoaded?.();
      return;
    }

    if (this.isInitializing) {
      console.log("Unity initialization already in progress");
      return;
    }

    this.isInitializing = true;

    try {
      await this.loadUnityScript();
      await this.createUnityInstance(canvas);
      this.loaded = true;
      options?.onLoaded?.();
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to initialize Unity");
      options?.onError?.(err);
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  private async loadUnityScript(): Promise<void> {
    if (this.scriptLoaded) return;

    const loaderUrl = `${this.buildUrl}/${this.buildName}.loader.js`;

    if (document.querySelector(`script[src="${loaderUrl}"]`)) {
      this.scriptLoaded = true;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = () =>
        reject(new Error("Failed to load Unity loader script"));
      document.body.appendChild(script);
    });
  }

  private async createUnityInstance(canvas: HTMLCanvasElement): Promise<void> {
    const config: UnityConfig = {
      dataUrl: `${this.buildUrl}/${this.buildName}.data.unityweb`,
      frameworkUrl: `${this.buildUrl}/${this.buildName}.framework.js.unityweb`,
      codeUrl: `${this.buildUrl}/${this.buildName}.wasm.unityweb`,
      streamingAssetsUrl: `${this.buildUrl}/StreamingAssets`,
      companyName: "DefaultCompany",
      productName: "WebXR",
      productVersion: "0.1",
    };

    await this.waitForUnityLoader();
    this.instance = await window.createUnityInstance(canvas, config);
  }

  private async waitForUnityLoader(): Promise<void> {
    const timeout = 5000;
    const start = Date.now();

    while (!window.createUnityInstance && Date.now() - start < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!window.createUnityInstance) {
      throw new Error("Unity loader timeout");
    }
  }

  updateCardData(data: UnityCardData): void {
    if (!this.loaded || !this.instance) {
      console.warn("Unity not loaded, cannot update card data");
      return;
    }

    try {
      // Ensure all text fields have values
      const safeData = {
        cardImage: data.cardImage || "birthday",
        cardTop: data.cardTop || "",
        cardMiddle: data.cardMiddle || "",
        cardBottom: data.cardBottom || "",
      };

      console.log("Sending card data to Unity:", {
        ...safeData,
        cardImage: safeData.cardImage.substring(0, 50) + "...", // Log truncated for readability
      });

      this.instance.SendMessage(
        "Card",
        "UpdateCardText",
        JSON.stringify(safeData)
      );
    } catch (error) {
      console.error("Failed to send data to Unity:", error);
    }
  }

  toggleAR(): void {
    if (!this.loaded) return;

    try {
      this.instance.Module?.WebXR?.toggleAR();
    } catch (error) {
      console.error("Failed to toggle AR:", error);
    }
  }

  cleanup(): void {
    // Don't destroy Unity instance - just leave it loaded for potential reuse
    // Unity cleanup causes errors when canvas is already removed from DOM
    // Instead, we'll just log that cleanup was called
    console.log("Unity renderer cleanup called (instance preserved for reuse)");
  }

  isLoaded(): boolean {
    return this.loaded && this.instance !== null;
  }
}

export const arRenderer: IARRenderer = new UnityRenderer();
