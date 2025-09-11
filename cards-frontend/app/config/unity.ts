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

// Function to find Unity build name automatically
export async function findUnityBuildName(): Promise<string | null> {
  const config = getUnityConfig();
  const normalizedUnityUrl = config.unityUrl.endsWith("/")
    ? config.unityUrl.slice(0, -1)
    : config.unityUrl;

  // Common Unity build names to try
  const commonBuildNames = [
    "WebXR-gh-pages",
    "Build",
    "WebGL",
    "UnityBuild",
    "WebXR",
  ];

  for (const buildName of commonBuildNames) {
    const loaderUrl = `${normalizedUnityUrl}/${buildName}.loader.js`;
    try {
      const response = await fetch(loaderUrl, { method: "HEAD" });
      if (response.ok) {
        console.log(`✅ Found Unity build: ${buildName}`);
        return buildName;
      }
    } catch (error) {
      // Continue to next build name
      console.log(`❌ Build ${buildName} not found:`, error);
    }
  }

  console.warn("⚠️ No Unity build found, using default");
  return null;
}

// Test function to check if Unity URL is accessible
export async function testUnityUrl() {
  const config = getUnityConfig();
  // Handle trailing slashes properly
  const normalizedUnityUrl = config.unityUrl.endsWith("/")
    ? config.unityUrl.slice(0, -1)
    : config.unityUrl;
  const loaderUrl = `${normalizedUnityUrl}/${config.buildName}.loader.js`;

  console.log("🧪 Unity Test: Testing Unity URL accessibility");
  console.log("🧪 Unity Test: Loader URL:", loaderUrl);

  try {
    const response = await fetch(loaderUrl);
    console.log("🧪 Unity Test: Response status:", response.status);
    console.log("🧪 Unity Test: Response headers:", response.headers);

    if (response.ok) {
      console.log("✅ Unity Test: Unity URL is accessible");
      return true;
    } else {
      console.error(
        "❌ Unity Test: Unity URL returned error:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ Unity Test: Failed to fetch Unity URL:", error);
    return false;
  }
}
