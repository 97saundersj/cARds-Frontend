import * as THREE from "three";
import { XRButton } from "three/addons/webxr/XRButton.js";
import { createDragCard } from "~/components/DragCard";

type SetArSupported = (supported: boolean) => void;

type SetupResult = {
  cleanup: () => void;
};

export function setupDragCardScene(
  container: HTMLDivElement,
  setIsARSupported: SetArSupported
): SetupResult {
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 10;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    10
  );
  camera.position.set(0, 1.6, 3);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
  light.position.set(0.5, 1, 0.25);
  scene.add(light);

  const group = new THREE.Group();
  scene.add(group);

  const dragCard = createDragCard();
  const cardGroup = dragCard.group;
  group.add(cardGroup);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.xr.enabled = true;
  if (renderer.xr.setReferenceSpaceType) {
    renderer.xr.setReferenceSpaceType("local-floor");
  }
  container.appendChild(renderer.domElement);
  renderer.domElement.style.touchAction = "none";
  renderer.domElement.style.userSelect = "none";

  const xrButton = XRButton.createButton(renderer, {
    optionalFeatures: ["local-floor"],
  }) as HTMLButtonElement;
  xrButton.style.position = "absolute";
  xrButton.style.bottom = "30%";
  xrButton.style.left = "50%";
  xrButton.style.transform = "translateX(-50%)";
  xrButton.style.zIndex = "1000";
  container.appendChild(xrButton);

  const hideControls = () => {
    controlsVisible = false;
    dragCard.setControlsVisible(false);
  };

  const raycaster = new THREE.Raycaster();
  const tempMatrix = new THREE.Matrix4();
  const clock = new THREE.Clock();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0.8);

  const controller1 = renderer.xr.getController(0);
  const controller2 = renderer.xr.getController(1);
  scene.add(controller1);
  scene.add(controller2);

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  ]);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const line = new THREE.Line(lineGeometry, lineMaterial);
  line.name = "line";
  line.scale.z = 5;
  controller1.add(line.clone());
  controller2.add(line.clone());

  const setRayFromController = (controller: THREE.Group) => {
    controller.updateMatrixWorld();

    if ((raycaster as any).setFromXRController) {
      (raycaster as any).setFromXRController(controller);
    } else {
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
    }
  };

  const getIntersections = (controller: THREE.Group) => {
    setRayFromController(controller);
    cardGroup.updateMatrixWorld(true);
    return raycaster.intersectObjects(dragCard.dragTargets, true);
  };

  let isOpen = false;
  let openAmount = 0;
  let selectStartTime = 0;
  let lastTapTime = 0;
  let toggleCooldownUntil = 0;
  let xrSessionActive = false;
  let lastClickTime = 0;
  let isDragging = false;
  let hasMoved = false;
  let pointerDownOnCard = false;
  let cardScale = 0.5;
  const cardPosition = new THREE.Vector3(0, 1.2, -0.8);
  const dragStartPoint = new THREE.Vector2();
  const lastPoint = new THREE.Vector2();
  let lastPinchDistance: number | null = null;
  let isSelected = false;
  let controlsVisible = true;

  const onSelectStart = (event: any) => {
    const controller = event.target as THREE.Group;
    if (controlsVisible) {
      setRayFromController(controller);
      const controlsHits = raycaster.intersectObject(
        dragCard.controlsButton,
        true
      );
      if (controlsHits.length > 0) {
        hideControls();
        return;
      }
    }
    const intersections = getIntersections(controller);
    const isScreenInput = event.data?.targetRayMode === "screen";

    if (intersections.length > 0 || isScreenInput) {
      selectStartTime = Date.now();
      isSelected = true;
      dragCard.setInteractionState(true, false);
      controller.attach(cardGroup);
      controller.userData.selected = cardGroup;
    } else {
      selectStartTime = 0;
    }

    controller.userData.targetRayMode = event.data?.targetRayMode;
  };

  const onSelectEnd = (event: any) => {
    const controller = event.target as THREE.Group;

    if (controller.userData.selected !== undefined) {
      const now = Date.now();
      const selectDuration = now - selectStartTime;

      isSelected = false;
      dragCard.setInteractionState(false, false);
      group.attach(cardGroup);
      controller.userData.selected = undefined;

      if (selectDuration < 500) {
        const timeSinceLastTap = now - lastTapTime;
        if (now >= toggleCooldownUntil) {
          if (timeSinceLastTap < 600 && timeSinceLastTap > 30) {
            isOpen = !isOpen;
            toggleCooldownUntil = now + 400;
            lastTapTime = 0;
          } else {
            lastTapTime = now;
          }
        }
      }
    }
  };

  controller1.addEventListener("selectstart", onSelectStart);
  controller1.addEventListener("selectend", onSelectEnd);
  controller2.addEventListener("selectstart", onSelectStart);
  controller2.addEventListener("selectend", onSelectEnd);

  const onSessionStart = () => {
    xrSessionActive = true;
  };

  const onSessionEnd = () => {
    xrSessionActive = false;
  };

  renderer.xr.addEventListener("sessionstart", onSessionStart);
  renderer.xr.addEventListener("sessionend", onSessionEnd);

  const applyCardTransform = () => {
    cardGroup.position.copy(cardPosition);
    cardGroup.scale.setScalar(cardScale);
  };

  applyCardTransform();

  const getPointerNdc = (clientX: number, clientY: number) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    return new THREE.Vector2(x, y);
  };

  const getPointerIntersections = (clientX: number, clientY: number) => {
    const ndc = getPointerNdc(clientX, clientY);
    raycaster.setFromCamera(ndc, camera);
    cardGroup.updateMatrixWorld(true);
    return raycaster.intersectObjects(dragCard.dragTargets, true);
  };

  const getPointerControlsHit = (clientX: number, clientY: number) => {
    const ndc = getPointerNdc(clientX, clientY);
    raycaster.setFromCamera(ndc, camera);
    cardGroup.updateMatrixWorld(true);
    return raycaster.intersectObject(dragCard.controlsButton, true).length > 0;
  };

  const getPlaneIntersection = (clientX: number, clientY: number) => {
    const ndc = getPointerNdc(clientX, clientY);
    raycaster.setFromCamera(ndc, camera);
    const target = new THREE.Vector3();
    const hit = raycaster.ray.intersectPlane(plane, target);
    return hit ? target : null;
  };

  const handleNonXrToggle = () => {
    const now = Date.now();
    if (now < toggleCooldownUntil) return;

    if (hasMoved) {
      hasMoved = false;
      return;
    }

    const timeSinceLastClick = now - lastClickTime;
    if (timeSinceLastClick < 500 && timeSinceLastClick > 30) {
      isOpen = !isOpen;
      toggleCooldownUntil = now + 400;
      lastClickTime = 0;
    } else {
      lastClickTime = now;
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (xrSessionActive) return;
    if (controlsVisible && getPointerControlsHit(event.clientX, event.clientY)) {
      hideControls();
      return;
    }
    const intersections = getPointerIntersections(
      event.clientX,
      event.clientY
    );
    if (intersections.length === 0) return;

    isDragging = true;
    hasMoved = false;
    pointerDownOnCard = true;

    const hit = getPlaneIntersection(event.clientX, event.clientY);
    if (hit) {
      lastPoint.set(hit.x, hit.y);
      dragStartPoint.set(hit.x, hit.y);
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (xrSessionActive || !isDragging) return;

    const hit = getPlaneIntersection(event.clientX, event.clientY);
    if (!hit) return;

    const deltaX = hit.x - lastPoint.x;
    const deltaY = hit.y - lastPoint.y;
    const distanceFromStart = Math.sqrt(
      Math.pow(hit.x - dragStartPoint.x, 2) +
        Math.pow(hit.y - dragStartPoint.y, 2)
    );

    if (distanceFromStart > 0.01) {
      hasMoved = true;
    }

    cardPosition.x += deltaX;
    cardPosition.y += deltaY;
    applyCardTransform();
    lastPoint.set(hit.x, hit.y);
  };

  const onPointerUp = () => {
    if (xrSessionActive) return;
    isDragging = false;
    if (pointerDownOnCard) {
      handleNonXrToggle();
    }
    pointerDownOnCard = false;
  };

  const onWheel = (event: WheelEvent) => {
    if (xrSessionActive) return;
    event.preventDefault();
    const delta = -event.deltaY * 0.001;
    cardScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, cardScale + delta));
    applyCardTransform();
  };

  const onTouchStart = (event: TouchEvent) => {
    if (!xrSessionActive && event.touches.length === 1) {
      const touch = event.touches[0];
      if (controlsVisible && getPointerControlsHit(touch.clientX, touch.clientY)) {
        hideControls();
        return;
      }
    }
    if (event.touches.length === 2) {
      const t1 = event.touches[0];
      const t2 = event.touches[1];
      lastPinchDistance = Math.hypot(
        t2.clientX - t1.clientX,
        t2.clientY - t1.clientY
      );
    }
  };

  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length !== 2) return;
    event.preventDefault();
    const t1 = event.touches[0];
    const t2 = event.touches[1];
    const distance = Math.hypot(
      t2.clientX - t1.clientX,
      t2.clientY - t1.clientY
    );

    if (lastPinchDistance !== null) {
      const delta = distance - lastPinchDistance;
      const scaleFactor = 1 + delta * 0.005;
      cardScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, cardScale * scaleFactor));
      applyCardTransform();
    }

    lastPinchDistance = distance;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (event.touches.length < 2) {
      lastPinchDistance = null;
    }
  };

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
  renderer.domElement.addEventListener("touchstart", onTouchStart, {
    passive: false,
  });
  renderer.domElement.addEventListener("touchmove", onTouchMove, {
    passive: false,
  });
  renderer.domElement.addEventListener("touchend", onTouchEnd, {
    passive: false,
  });

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };

  window.addEventListener("resize", onResize);

  const checkSupport = async () => {
    const xr = (navigator as any).xr;
    if (!xr?.isSessionSupported) {
      setIsARSupported(false);
      return;
    }

    try {
      const supported = await xr.isSessionSupported("immersive-ar");
      setIsARSupported(supported);
    } catch (error) {
      console.error("XR support check failed:", error);
      setIsARSupported(false);
    }
  };

  checkSupport();

  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();

    if (xrSessionActive) {
      const intersections0 = getIntersections(controller1);
      const intersections1 = getIntersections(controller2);
      const hovering =
        intersections0.length > 0 || intersections1.length > 0;
      if (!isSelected) {
        dragCard.setInteractionState(false, hovering);
      }
    }

    if (isOpen && openAmount < 1) {
      openAmount = Math.min(1, openAmount + delta * 2);
      dragCard.setOpenAmount(openAmount);
    } else if (!isOpen && openAmount > 0) {
      openAmount = Math.max(0, openAmount - delta * 2);
      dragCard.setOpenAmount(openAmount);
    }

    renderer.render(scene, camera);
  });

  const cleanup = () => {
    window.removeEventListener("resize", onResize);
    renderer.setAnimationLoop(null);

    controller1.removeEventListener("selectstart", onSelectStart);
    controller1.removeEventListener("selectend", onSelectEnd);
    controller2.removeEventListener("selectstart", onSelectStart);
    controller2.removeEventListener("selectend", onSelectEnd);

    renderer.xr.removeEventListener("sessionstart", onSessionStart);
    renderer.xr.removeEventListener("sessionend", onSessionEnd);

    renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    renderer.domElement.removeEventListener("pointermove", onPointerMove);
    renderer.domElement.removeEventListener("pointerup", onPointerUp);
    renderer.domElement.removeEventListener("pointerleave", onPointerUp);
    renderer.domElement.removeEventListener("pointercancel", onPointerUp);
    renderer.domElement.removeEventListener("wheel", onWheel);
    renderer.domElement.removeEventListener("touchstart", onTouchStart);
    renderer.domElement.removeEventListener("touchmove", onTouchMove);
    renderer.domElement.removeEventListener("touchend", onTouchEnd);

    dragCard.dispose();
    lineGeometry.dispose();
    lineMaterial.dispose();

    if (xrButton.parentElement) {
      xrButton.parentElement.removeChild(xrButton);
    }

    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }

    renderer.dispose();
  };

  return { cleanup };
}
