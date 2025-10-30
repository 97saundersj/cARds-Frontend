import { Canvas, useThree } from "@react-three/fiber";
import { XR, createXRStore, useXR } from "@react-three/xr";
import { useState, useEffect, useRef } from "react";
import { OpenableCard } from "~/components/OpenableCard";
import * as THREE from "three";

const store = createXRStore({
  emulate: true,
});

function ControllerRays() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const controller0 = gl.xr.getController(0);
    const controller1 = gl.xr.getController(1);

    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -5),
    ]);

    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const line0 = new THREE.Line(geometry, material);
    const line1 = new THREE.Line(geometry, material.clone());

    controller0.add(line0);
    controller1.add(line1);
    scene.add(controller0);
    scene.add(controller1);

    return () => {
      scene.remove(controller0);
      scene.remove(controller1);
    };
  }, [gl, scene]);

  return null;
}

export function ThreeJSTest() {
  const [isARSupported, setIsARSupported] = useState(true);
  const [inAR, setInAR] = useState(false);

  const handleEnterAR = async () => {
    try {
      await store.enterAR();
      setInAR(true);
    } catch (error) {
      console.error("AR Error:", error);
      setIsARSupported(false);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {!inAR && (
        <button
          onClick={handleEnterAR}
          style={{
            position: "absolute",
            bottom: "30%",
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
      )}

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
          <ControllerRays />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <OpenableCard />
        </XR>
      </Canvas>
    </div>
  );
}
