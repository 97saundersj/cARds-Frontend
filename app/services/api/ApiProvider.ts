import type { IApi } from "./IApi";
import { FirebaseApi } from "./FirebaseApi";

let apiInstance: IApi | null = null;

export function getApi(): IApi {
  if (!apiInstance) {
    apiInstance = new FirebaseApi();
  }
  return apiInstance;
}
