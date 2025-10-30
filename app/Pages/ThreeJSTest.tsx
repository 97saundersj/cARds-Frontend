import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState } from "react";
import { OpenableCard } from "~/components/OpenableCard";

const store = createXRStore({
  emulate: true,
});

export function ThreeJSTest() {
  const [isARSupported, setIsARSupported] = useState(true);

  const handleEnterAR = async () => {
    try {
      await store.enterAR();
    } catch (error) {
      console.error("AR Error:", error);
      setIsARSupported(false);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <button
        onClick={handleEnterAR}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          padding: "12px 24px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Enter AR
      </button>

      {!isARSupported && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            padding: "12px 24px",
            backgroundColor: "#ff9800",
            color: "white",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          WebXR not supported on this device
        </div>
      )}

      <Canvas>
        <XR store={store}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <OpenableCard />
        </XR>
      </Canvas>
    </div>
  );
}
