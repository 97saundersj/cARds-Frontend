import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Text, Html } from "@react-three/drei";

export function OpenableCard() {
  // Scale limits
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 10;

  const groupRef = useRef<any>(null);
  const leftGroupRef = useRef<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [openAmount, setOpenAmount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPlanePoint, setDragPlanePoint] = useState<THREE.Vector2 | null>(
    null
  );
  const [cardPosition, setCardPosition] = useState(new THREE.Vector3(0, 1, -2));
  const [cardScale, setCardScale] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const { gl, camera, raycaster } = useThree();
  const isDraggingRef = useRef(false);
  const lastPointRef = useRef(new THREE.Vector2());
  const lastPinchDistance = useRef<number | null>(null);
  const isShiftPinching = useRef(false);
  const shiftStartY = useRef<number | null>(null);

  useEffect(() => {
    // Initialize rotation to ensure card starts closed
    if (leftGroupRef.current) {
      leftGroupRef.current.rotation.y = 0;
    }
  }, []);

  useEffect(() => {
    const canvas = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 2);

    // Apply CSS to prevent default touch/gesture behaviors
    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";

    // Prevent browser zoom when actively interacting with card
    const preventBrowserZoom = (e: Event) => {
      if ((e as any).shiftKey || (e as any).ctrlKey || (e as any).metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const handleGlobalMove = (event: PointerEvent | TouchEvent) => {
      // Handle pinch zoom on real devices
      if ("touches" in event && event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (lastPinchDistance.current !== null) {
          const delta = distance - lastPinchDistance.current;
          const scaleFactor = 1 + delta * 0.01;
          setCardScale((prev) =>
            Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev * scaleFactor))
          );
        }

        lastPinchDistance.current = distance;
        return;
      }

      // Handle Shift+drag pinch for DevTools testing
      if ("clientY" in event && event.shiftKey && isDraggingRef.current) {
        event.preventDefault();
        event.stopPropagation();
        isShiftPinching.current = true;

        if (shiftStartY.current !== null) {
          const deltaY = shiftStartY.current - event.clientY;
          const scaleDelta = deltaY * 0.01;
          setCardScale((prev) =>
            Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + scaleDelta))
          );
        }

        shiftStartY.current = event.clientY;
        return;
      }

      // Handle drag
      if (!isDraggingRef.current || isShiftPinching.current) return;
      event.preventDefault();

      let clientX: number, clientY: number;
      if ("touches" in event && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if ("clientX" in event) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const target = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, target);

      if (target) {
        const deltaX = target.x - lastPointRef.current.x;
        const deltaY = target.y - lastPointRef.current.y;

        setCardPosition((prev) => {
          const newPos = prev.clone();
          newPos.x += deltaX;
          newPos.y += deltaY;
          return newPos;
        });

        lastPointRef.current.set(target.x, target.y);
      }
    };

    const handleGlobalUp = () => {
      isDraggingRef.current = false;
      lastPinchDistance.current = null;
      isShiftPinching.current = false;
      shiftStartY.current = null;
      setDragPlanePoint(null);
      setTimeout(() => setIsDragging(false), 100);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const delta = -event.deltaY * 0.001;
      setCardScale((prev) =>
        Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta))
      );
    };

    canvas.addEventListener("pointermove", handleGlobalMove as any);
    canvas.addEventListener("pointerup", handleGlobalUp);
    canvas.addEventListener("pointercancel", handleGlobalUp);
    canvas.addEventListener("touchmove", handleGlobalMove as any, {
      passive: false,
    });
    canvas.addEventListener("touchend", handleGlobalUp);
    canvas.addEventListener("touchcancel", handleGlobalUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("mousedown", preventBrowserZoom, {
      passive: false,
    });
    canvas.addEventListener("mousemove", preventBrowserZoom, {
      passive: false,
    });
    document.addEventListener("wheel", preventBrowserZoom, { passive: false });
    document.addEventListener("gesturestart", preventBrowserZoom, {
      passive: false,
    });
    document.addEventListener("gesturechange", preventBrowserZoom, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("pointermove", handleGlobalMove as any);
      canvas.removeEventListener("pointerup", handleGlobalUp);
      canvas.removeEventListener("pointercancel", handleGlobalUp);
      canvas.removeEventListener("touchmove", handleGlobalMove as any);
      canvas.removeEventListener("touchend", handleGlobalUp);
      canvas.removeEventListener("touchcancel", handleGlobalUp);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("mousedown", preventBrowserZoom);
      canvas.removeEventListener("mousemove", preventBrowserZoom);
      document.removeEventListener("wheel", preventBrowserZoom);
      document.removeEventListener("gesturestart", preventBrowserZoom);
      document.removeEventListener("gesturechange", preventBrowserZoom);
    };
  }, [gl, camera, raycaster]);

  useFrame((state, delta) => {
    // Animate opening/closing
    if (isOpen && openAmount < 1) {
      setOpenAmount(Math.min(1, openAmount + delta * 2));
    } else if (!isOpen && openAmount > 0) {
      setOpenAmount(Math.max(0, openAmount - delta * 2));
    }

    // Apply rotation to front cover
    const degrees = 180;
    if (leftGroupRef.current) {
      leftGroupRef.current.rotation.y =
        -openAmount * ((degrees * Math.PI) / 180);
    }
  });

  const handleClick = () => {
    if (isDragging) return; // Don't open if dragging
    const now = Date.now();
    if (now - lastClickTime < 300) {
      setIsOpen(!isOpen);
    }
    setLastClickTime(now);
  };

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    e.nativeEvent?.preventDefault();
    setIsDragging(false);
    isDraggingRef.current = true;
    if (e.point) {
      lastPointRef.current.set(e.point.x, e.point.y);
      setDragPlanePoint(new THREE.Vector2(e.point.x, e.point.y));
    }
    // Reset shift pinch state
    shiftStartY.current = null;
  };

  const handleDismissControls = () => {
    setShowControls(false);
  };

  // Card geometry
  const cardWidth = 0.6;
  const cardHalfWidth = cardWidth / 2;

  // Card is 0.6 units wide when closed, 0.9 units total when open (from -0.6 to 0.3)
  // Width grows proportionally: 280px base, up to 420px when fully open (50% growth)
  const controlsWidth = 280 + openAmount * 140;

  // Position shifts left as card opens
  // The front cover rotates around x=-0.3, moving its center from x=0 to x=-0.6
  // Shift by half the card width (0.3) to align with the expanding card
  const controlsXOffset = -cardHalfWidth * openAmount;

  return (
    <group
      ref={groupRef}
      position={cardPosition}
      scale={cardScale}
      rotation={[0, 0, 0]}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
    >
      {/* Controls overlay */}
      {showControls && (
        <Html
          position={[controlsXOffset, 0.65, 0.05]}
          center
          transform
          scale={0.09}
        >
          <div
            className="d-flex align-items-center justify-content-between gap-3 p-3 rounded-3 shadow text-white"
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(10px)",
              pointerEvents: "auto",
              width: `${controlsWidth}px`,
              transition: "width 0.3s ease",
            }}
          >
            <div className="d-flex flex-column gap-2 flex-grow-1">
              <div className="fw-semibold mb-1" style={{ fontSize: "15px" }}>
                Card Controls
              </div>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "16px" }}>✥</span>
                <span className="small">Drag to move</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "16px" }}>🔍</span>
                <span className="small">Pinch to zoom</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span style={{ fontSize: "16px" }}>👆</span>
                <span className="small">Double-tap to open</span>
              </div>
            </div>
            <button
              onClick={handleDismissControls}
              className="btn btn-success text-nowrap flex-shrink-0"
            >
              Got it!
            </button>
          </div>
        </Html>
      )}

      {/* Back cover - stays stationary */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[0.6, 0.9, 0.02]} />
        <meshStandardMaterial color="lightgray" side={2} />
      </mesh>
      {/* Text on inside of back cover */}
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.06}
        color="black"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.5}
        textAlign="center"
      >
        Happy Birthday!{"\n"}
        Have a great day!
      </Text>

      {/* Front cover - rotates open around left edge */}
      <group ref={leftGroupRef} position={[-0.3, 0, 0]} rotation={[0, 0, 0]}>
        <mesh position={[0.3, 0, 0.01]}>
          <boxGeometry args={[0.6, 0.9, 0.02]} />
          <meshStandardMaterial color="white" side={2} />
        </mesh>
        {/* Text on front of card */}
        <Text
          position={[0.3, 0, 0.031]}
          fontSize={0.1}
          color="#8B4513"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          Greetings
        </Text>
      </group>
    </group>
  );
}
