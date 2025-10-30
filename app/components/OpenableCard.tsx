import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Text, Html } from "@react-three/drei";
import { useXR } from "@react-three/xr";

export function OpenableCard() {
  // Scale limits
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 10;

  const groupRef = useRef<THREE.Group>(null);
  const leftGroupRef = useRef<THREE.Group>(null);
  const sceneGroupRef = useRef<THREE.Group>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [openAmount, setOpenAmount] = useState(0);
  const isOpenRef = useRef(false);
  const [showControls, setShowControls] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [cardPosition, setCardPosition] = useState(
    new THREE.Vector3(0, 1.2, -0.8)
  );
  const [cardScale, setCardScale] = useState(0.5);
  const { gl, scene, raycaster, camera } = useThree();
  const xr = useXR();

  // XR controller state
  const selectedController = useRef<THREE.Group | null>(null);
  const selectStartTime = useRef<number>(0);
  const tempMatrix = useRef(new THREE.Matrix4());
  const lastTapTime = useRef<number>(0);
  const toggleCooldownUntil = useRef<number>(0);

  // Non-XR interaction state
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const hasMoved = useRef(false);
  const dragStartPoint = useRef(new THREE.Vector2());
  const lastPointRef = useRef(new THREE.Vector2());
  const lastPinchDistance = useRef<number | null>(null);

  useEffect(() => {
    // Initialize rotation to ensure card starts closed
    if (leftGroupRef.current) {
      leftGroupRef.current.rotation.y = 0;
    }

    // Apply CSS to prevent default touch behaviors
    const canvas = gl.domElement;
    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";
  }, [gl]);

  // Keep ref in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Non-XR touch and mouse interactions
  useEffect(() => {
    const canvas = gl.domElement;
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.8);

    const handleTouchStart = (event: TouchEvent) => {
      if (xr.session) return; // Skip if in XR mode

      if (event.touches.length === 2) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        lastPinchDistance.current = distance;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (xr.session) return; // Skip if in XR mode

      // Handle pinch zoom
      if (event.touches.length === 2) {
        event.preventDefault();
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );

        if (lastPinchDistance.current !== null) {
          const delta = distance - lastPinchDistance.current;
          const scaleFactor = 1 + delta * 0.005;
          setCardScale((prev) =>
            Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev * scaleFactor))
          );
        }

        lastPinchDistance.current = distance;
        return;
      }

      // Handle drag
      if (!isDraggingRef.current || event.touches.length !== 1) return;
      event.preventDefault();

      const touch = event.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

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

    const handleTouchEnd = (event: TouchEvent) => {
      if (xr.session) return; // Skip if in XR mode

      if (event.touches.length < 2) {
        lastPinchDistance.current = null;
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (xr.session) return; // Skip if in XR mode

      event.preventDefault();
      const delta = -event.deltaY * 0.001;
      setCardScale((prev) =>
        Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev + delta))
      );
    };

    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [gl, camera, raycaster, xr.session]);

  // XR pinch-to-zoom (mobile AR): enable two-finger scaling while in XR
  useEffect(() => {
    const canvas = gl.domElement;

    if (!xr.session) return; // Only attach when XR is active

    let xrLastPinch: number | null = null;

    const onTouchStart = (event: TouchEvent) => {
      if (!xr.session) return;
      if (event.touches.length === 2) {
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        xrLastPinch = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        );
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!xr.session) return;
      if (event.touches.length === 2) {
        event.preventDefault();
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        const distance = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY
        );
        if (xrLastPinch !== null) {
          const delta = distance - xrLastPinch;
          const scaleFactor = 1 + delta * 0.005;
          setCardScale((prev) =>
            Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev * scaleFactor))
          );
        }
        xrLastPinch = distance;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!xr.session) return;
      if (event.touches.length < 2) {
        xrLastPinch = null;
      }
    };

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [gl, xr.session]);

  // Get intersections with the card using raycasting
  const getIntersections = (controller: THREE.Group) => {
    if (!groupRef.current) return [];

    controller.updateMatrixWorld();
    tempMatrix.current.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix.current);

    return raycaster.intersectObject(groupRef.current, true);
  };

  // XR controller select start - grab the card
  const onSelectStart = (event: any) => {
    if (!groupRef.current || !sceneGroupRef.current) return;

    const controller = event.target;
    const intersections = getIntersections(controller);

    // Always record start time if pointing at card (for tap detection)
    if (intersections.length > 0) {
      const now = Date.now();
      selectStartTime.current = now;

      // Try to grab the card
      selectedController.current = controller;
      setIsSelected(true);

      controller.attach(groupRef.current);
      controller.userData.selected = groupRef.current;
    } else {
      // Not pointing at card, reset selectStartTime
      selectStartTime.current = 0;
    }
  };

  // XR controller select end - release the card or detect tap
  const onSelectEnd = (event: any) => {
    const now = Date.now();
    const controller = event.target;
    let wasQuickTap = false;

    // Check if card was grabbed
    if (controller.userData.selected !== undefined) {
      if (!sceneGroupRef.current) return;

      const selectDuration = now - selectStartTime.current;

      sceneGroupRef.current.attach(controller.userData.selected);
      controller.userData.selected = undefined;
      selectedController.current = null;
      setIsSelected(false);

      // Check if it was a quick tap (more forgiving timing)
      wasQuickTap = selectDuration < 500;
    } else {
      // Card wasn't grabbed, check if we had a valid start time (meaning we were pointing at it)
      if (selectStartTime.current > 0) {
        const selectDuration = now - selectStartTime.current;
        wasQuickTap = selectDuration < 500;
      }
    }

    // Handle double-tap detection for any quick tap
    if (wasQuickTap) {
      const timeSinceLastTap = now - lastTapTime.current;
      if (now < toggleCooldownUntil.current) return;

      // More forgiving timing: 30ms minimum, 600ms maximum
      if (timeSinceLastTap < 600 && timeSinceLastTap > 30) {
        // Double-tap detected - toggle card open/close
        setIsOpen((prev) => !prev);
        toggleCooldownUntil.current = now + 400;
        lastTapTime.current = 0; // Reset to prevent triple-tap
      } else {
        // First tap - record the time
        lastTapTime.current = now;
      }
    }
  };

  // Set up controller event listeners
  useEffect(() => {
    const renderer = gl;
    const controller0 = renderer.xr.getController(0);
    const controller1 = renderer.xr.getController(1);

    controller0.addEventListener("selectstart", onSelectStart);
    controller0.addEventListener("selectend", onSelectEnd);
    controller1.addEventListener("selectstart", onSelectStart);
    controller1.addEventListener("selectend", onSelectEnd);

    return () => {
      controller0.removeEventListener("selectstart", onSelectStart);
      controller0.removeEventListener("selectend", onSelectEnd);
      controller1.removeEventListener("selectstart", onSelectStart);
      controller1.removeEventListener("selectend", onSelectEnd);
    };
  }, [gl]);

  useFrame((state, delta) => {
    // Check for hover on controllers (for debugging)
    if (!xr.session) {
      setIsHovered(false);
    } else {
      const controller0 = gl.xr.getController(0);
      const controller1 = gl.xr.getController(1);

      let hovering = false;

      [controller0, controller1].forEach((controller) => {
        if (controller.userData.selected) return; // Skip if already selected

        const intersections = getIntersections(controller);
        if (intersections.length > 0) {
          hovering = true;
        }
      });

      setIsHovered(hovering);
    }

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
    const now = Date.now();
    if (now < toggleCooldownUntil.current) return;

    // Don't open if we actually dragged (moved more than a threshold)
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }

    const timeSinceLastClick = now - lastClickTime;

    // Double-click detection with more forgiving timing
    if (timeSinceLastClick < 500 && timeSinceLastClick > 30) {
      setIsOpen((prev) => !prev);
      toggleCooldownUntil.current = now + 400;
      setLastClickTime(0); // Reset to prevent triple-click
    } else {
      setLastClickTime(now);
    }
  };

  // Non-XR pointer handlers
  const handlePointerDown = (e: any) => {
    if (xr.session) return; // Skip if in XR mode

    e.stopPropagation();
    setIsDragging(false);
    isDraggingRef.current = true;
    hasMoved.current = false;

    if (e.point) {
      lastPointRef.current.set(e.point.x, e.point.y);
      dragStartPoint.current.set(e.point.x, e.point.y);
    }
  };

  const handlePointerMove = (e: any) => {
    if (xr.session) return; // Skip if in XR mode
    if (!isDraggingRef.current) return;

    if (e.point) {
      const deltaX = e.point.x - lastPointRef.current.x;
      const deltaY = e.point.y - lastPointRef.current.y;

      // Check if we've moved enough to consider it a drag (not just a click)
      const distanceFromStart = Math.sqrt(
        Math.pow(e.point.x - dragStartPoint.current.x, 2) +
          Math.pow(e.point.y - dragStartPoint.current.y, 2)
      );

      if (distanceFromStart > 0.01) {
        hasMoved.current = true;
      }

      setCardPosition((prev) => {
        const newPos = prev.clone();
        newPos.x += deltaX;
        newPos.y += deltaY;
        return newPos;
      });

      lastPointRef.current.set(e.point.x, e.point.y);
    }
  };

  const handlePointerUp = () => {
    if (xr.session) return; // Skip if in XR mode

    isDraggingRef.current = false;
    setIsDragging(false);
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
    <group ref={sceneGroupRef}>
      <group
        ref={groupRef}
        position={cardPosition}
        scale={cardScale}
        rotation={[0, 0, 0]}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Controls overlay - HTML for styling with 3D mesh for VR controller compatibility */}
        {showControls && (
          <group position={[controlsXOffset, 0.65, 0.05]}>
            {/* HTML overlay for nice styling */}
            <Html center transform scale={0.09}>
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
                  <div
                    className="fw-semibold mb-1"
                    style={{ fontSize: "15px" }}
                  >
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

            {/* Invisible 3D mesh for VR controller interaction with the "Got it" button */}
            <mesh
              position={[controlsWidth * 0.003, 0, 0.01]}
              onClick={(e) => {
                e.stopPropagation();
                handleDismissControls();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <boxGeometry args={[0.08, 0.04, 0.01]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </group>
        )}

        {/* Back cover - stays stationary */}
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[0.6, 0.9, 0.02]} />
          <meshStandardMaterial
            color="lightgray"
            emissive={
              isSelected ? "#4444ff" : isHovered ? "#2222ff" : "#000000"
            }
            emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.15 : 0}
            side={2}
          />
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
            <meshStandardMaterial
              color="white"
              emissive={
                isSelected ? "#4444ff" : isHovered ? "#2222ff" : "#000000"
              }
              emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.15 : 0}
              side={2}
            />
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
    </group>
  );
}
