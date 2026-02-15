import * as THREE from "three";

type DragCard = {
  group: THREE.Group;
  dragTargets: THREE.Object3D[];
  controlsButton: THREE.Object3D;
  setInteractionState: (selected: boolean, hovered: boolean) => void;
  setOpenAmount: (amount: number) => void;
  setControlsVisible: (visible: boolean) => void;
  dispose: () => void;
};

type TextPlaneOptions = {
  color: string;
  fontSize: number;
  fontWeight?: string;
  maxWidth: number;
  maxHeight: number;
};

const createTextPlane = (text: string, options: TextPlaneOptions) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Object3D();
  }

  const fontWeight = options.fontWeight ?? "normal";
  const lines = text.split("\n");
  const lineHeight = Math.round(options.fontSize * 1.2);
  context.font = `${fontWeight} ${options.fontSize}px sans-serif`;

  const maxLineWidth = Math.max(
    ...lines.map((line) => context.measureText(line).width),
  );
  const padding = Math.round(options.fontSize * 0.5);

  canvas.width = Math.ceil(maxLineWidth + padding * 2);
  canvas.height = Math.ceil(lineHeight * lines.length + padding * 2);

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = `${fontWeight} ${options.fontSize}px sans-serif`;
  context.fillStyle = options.color;
  context.textAlign = "center";
  context.textBaseline = "middle";

  lines.forEach((line, index) => {
    const x = canvas.width / 2;
    const y = padding + lineHeight * index + lineHeight / 2;
    context.fillText(line, x, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  const aspect = canvas.width / canvas.height;
  let width = options.maxWidth;
  let height = width / aspect;

  if (height > options.maxHeight) {
    height = options.maxHeight;
    width = height * aspect;
  }

  const geometry = new THREE.PlaneGeometry(width, height);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.dispose = () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };

  return mesh;
};

export function createDragCard(): DragCard {
  const group = new THREE.Group();
  group.position.set(0, 1.2, -0.8);

  const leftGroup = new THREE.Group();
  leftGroup.position.set(-0.3, 0, 0);
  group.add(leftGroup);

  const backMaterial = new THREE.MeshStandardMaterial({
    color: "lightgray",
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0,
    side: THREE.DoubleSide,
  });
  const frontMaterial = new THREE.MeshStandardMaterial({
    color: "white",
    emissive: new THREE.Color("#000000"),
    emissiveIntensity: 0,
    side: THREE.DoubleSide,
  });

  const backGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.02);
  const backMesh = new THREE.Mesh(backGeometry, backMaterial);
  backMesh.position.set(0, 0, -0.01);
  group.add(backMesh);

  const frontGeometry = new THREE.BoxGeometry(0.6, 0.9, 0.02);
  const frontMesh = new THREE.Mesh(frontGeometry, frontMaterial);
  frontMesh.position.set(0.3, 0, 0.01);
  leftGroup.add(frontMesh);

  const backText = createTextPlane("Happy Birthday!\nHave a great day!", {
    color: "#000000",
    fontSize: 64,
    maxWidth: 0.5,
    maxHeight: 0.25,
  });
  backText.position.set(0, 0, 0.01);
  group.add(backText);

  const frontText = createTextPlane("Greetings", {
    color: "#8B4513",
    fontSize: 96,
    fontWeight: "bold",
    maxWidth: 0.4,
    maxHeight: 0.2,
  });
  frontText.position.set(0.3, 0, 0.031);
  leftGroup.add(frontText);

  const dragTargets: THREE.Object3D[] = [backMesh, frontMesh];

  const controlsGroup = new THREE.Group();
  controlsGroup.position.set(0, 0.65, 0.05);
  group.add(controlsGroup);

  const controlsBackgroundGeometry = new THREE.PlaneGeometry(0.55, 0.28);
  const controlsBackgroundMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.7,
  });
  const controlsBackground = new THREE.Mesh(
    controlsBackgroundGeometry,
    controlsBackgroundMaterial,
  );
  controlsGroup.add(controlsBackground);

  const controlsText = createTextPlane(
    "Drag to move\nPinch to zoom\nDouble-tap to open",
    {
      color: "#ffffff",
      fontSize: 48,
      maxWidth: 0.45,
      maxHeight: 0.18,
    },
  );
  controlsText.position.set(0, 0.02, 0.01);
  controlsGroup.add(controlsText);

  const controlsButtonGeometry = new THREE.BoxGeometry(0.12, 0.04, 0.01);
  const controlsButtonMaterial = new THREE.MeshBasicMaterial({
    color: 0x198754,
  });
  const controlsButton = new THREE.Mesh(
    controlsButtonGeometry,
    controlsButtonMaterial,
  );
  controlsButton.position.set(0.16, -0.09, 0.02);
  controlsButton.userData.role = "controlsButton";
  controlsGroup.add(controlsButton);

  const controlsButtonText = createTextPlane("Got it", {
    color: "#ffffff",
    fontSize: 48,
    maxWidth: 0.1,
    maxHeight: 0.04,
  });
  controlsButtonText.position.set(0, 0, 0.01);
  controlsButton.add(controlsButtonText);

  const setInteractionState = (selected: boolean, hovered: boolean) => {
    if (selected) {
      backMaterial.emissive.set("#4444ff");
      backMaterial.emissiveIntensity = 0.3;
      frontMaterial.emissive.set("#4444ff");
      frontMaterial.emissiveIntensity = 0.3;
      return;
    }

    if (hovered) {
      backMaterial.emissive.set("#2222ff");
      backMaterial.emissiveIntensity = 0.15;
      frontMaterial.emissive.set("#2222ff");
      frontMaterial.emissiveIntensity = 0.15;
      return;
    }

    backMaterial.emissive.set("#000000");
    backMaterial.emissiveIntensity = 0;
    frontMaterial.emissive.set("#000000");
    frontMaterial.emissiveIntensity = 0;
  };

  const setOpenAmount = (amount: number) => {
    leftGroup.rotation.y = -amount * Math.PI;
  };

  const setControlsVisible = (visible: boolean) => {
    controlsGroup.visible = visible;
  };

  const dispose = () => {
    backGeometry.dispose();
    frontGeometry.dispose();
    backMaterial.dispose();
    frontMaterial.dispose();
    controlsBackgroundGeometry.dispose();
    controlsBackgroundMaterial.dispose();
    controlsButtonGeometry.dispose();
    controlsButtonMaterial.dispose();

    if ((backText as any).userData.dispose) {
      (backText as any).userData.dispose();
    }
    if ((frontText as any).userData.dispose) {
      (frontText as any).userData.dispose();
    }
    if ((controlsText as any).userData.dispose) {
      (controlsText as any).userData.dispose();
    }
    if ((controlsButtonText as any).userData.dispose) {
      (controlsButtonText as any).userData.dispose();
    }
  };

  return {
    group,
    dragTargets,
    controlsButton,
    setInteractionState,
    setOpenAmount,
    setControlsVisible,
    dispose,
  };
}
