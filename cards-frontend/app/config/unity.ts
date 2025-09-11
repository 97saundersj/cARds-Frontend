// Unity Configuration - Set these values for your application
export const UNITY_CONFIG = {
  // Set your Unity build URL here (e.g., for localhost development)
  unityUrl: "http://192.168.0.182:8001/Build/",

  // Set your Unity build name here
  buildName: "WebXR-gh-pages",

  // Alternative: Set to empty string to use local Build folder
  // unityUrl: "",

  // Alternative: Use a production CDN URL
  // unityUrl: "https://your-cdn.com/unity-build/",
};

// Helper function to get Unity configuration
export function getUnityConfig() {
  return {
    unityUrl: UNITY_CONFIG.unityUrl,
    buildName: UNITY_CONFIG.buildName,
  };
}
