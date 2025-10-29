import React from "react";
import { Stage, Layer, Text, Image, Transformer, Rect } from "react-konva";
import type { FrontPageElement } from "../../types/card";
import Konva from "konva";

interface CanvasEditorProps {
  elements: FrontPageElement[];
  selectedId: string | null;
  onElementsChange: (elements: FrontPageElement[]) => void;
  onSelectElement: (id: string | null) => void;
  onExport?: () => Promise<string>;
}

export const CanvasEditor = React.forwardRef<Konva.Stage, CanvasEditorProps>(
  ({ elements, selectedId, onElementsChange, onSelectElement }, ref) => {
    const transformerRef = React.useRef<Konva.Transformer>(null);
    const layerRef = React.useRef<Konva.Layer>(null);
    const canvasContainerRef = React.useRef<HTMLDivElement>(null);

    const [canvasDimensions, setCanvasDimensions] = React.useState({
      width: 400,
      height: 600,
    });

    const CANVAS_WIDTH = canvasDimensions.width;
    const CANVAS_HEIGHT = canvasDimensions.height;

    // Update canvas dimensions on mount and resize
    React.useEffect(() => {
      const updateCanvasSize = () => {
        if (canvasContainerRef.current) {
          const containerWidth = canvasContainerRef.current.clientWidth;
          const maxWidth = Math.min(containerWidth - 32, 400);
          const height = (maxWidth * 3) / 2;
          setCanvasDimensions({ width: maxWidth, height });
        }
      };

      updateCanvasSize();
      window.addEventListener("resize", updateCanvasSize);
      return () => window.removeEventListener("resize", updateCanvasSize);
    }, []);

    // Update transformer when selection changes
    React.useEffect(() => {
      if (transformerRef.current && layerRef.current) {
        if (selectedId) {
          const selectedNode = layerRef.current.findOne(`#${selectedId}`);
          if (selectedNode) {
            transformerRef.current.nodes([selectedNode]);
            transformerRef.current.getLayer()?.batchDraw();
          }
        } else {
          transformerRef.current.nodes([]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      }
    }, [selectedId]);

    const updateElement = (id: string, updates: Partial<FrontPageElement>) => {
      const newElements = elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      );
      onElementsChange(newElements);
    };

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedOnStage = e.target.getStage() === e.target;
      if (clickedOnStage) {
        onSelectElement(null);
      }
    };

    return (
      <div
        ref={canvasContainerRef}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <Stage
          ref={ref}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            border: "2px solid #dee2e6",
            background: "white",
            maxWidth: "100%",
          }}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer ref={layerRef}>
            <Rect
              x={0}
              y={0}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              fill="white"
            />
            {elements.map((element) => {
              if (element.type === "text") {
                return (
                  <EditableText
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                    onSelect={() => onSelectElement(element.id)}
                    onChange={(updates) => updateElement(element.id, updates)}
                  />
                );
              } else if (element.type === "image") {
                return (
                  <KonvaImage
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                    onSelect={() => onSelectElement(element.id)}
                    onChange={(updates) => updateElement(element.id, updates)}
                  />
                );
              }
              return null;
            })}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 10 || newBox.height < 10) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    );
  }
);

CanvasEditor.displayName = "CanvasEditor";

interface EditableTextProps {
  element: FrontPageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<FrontPageElement>) => void;
}

function EditableText({
  element,
  isSelected,
  onSelect,
  onChange,
}: EditableTextProps) {
  const textRef = React.useRef<Konva.Text>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleDblClick = (e?: any) => {
    if (e && e.evt) {
      e.evt.preventDefault();
    }
    setIsEditing(true);
    onSelect();
  };

  React.useEffect(() => {
    if (isEditing && textRef.current) {
      const textNode = textRef.current;
      const stage = textNode.getStage();
      if (!stage) return;

      const textPosition = textNode.absolutePosition();
      const stageBox = stage.container().getBoundingClientRect();

      const scrollX = window.scrollX || window.pageXOffset;
      const scrollY = window.scrollY || window.pageYOffset;

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);

      textarea.value = element.text || "";
      textarea.style.position = "fixed";
      textarea.style.top = `${stageBox.top + textPosition.y}px`;
      textarea.style.left = `${stageBox.left + textPosition.x}px`;
      textarea.style.width = `${textNode.width()}px`;
      textarea.style.fontSize = `${element.fontSize}px`;
      textarea.style.border = "2px solid #007bff";
      textarea.style.padding = "4px";
      textarea.style.margin = "0";
      textarea.style.overflow = "hidden";
      textarea.style.background = "white";
      textarea.style.outline = "none";
      textarea.style.resize = "none";
      textarea.style.lineHeight = "1.2";
      textarea.style.fontFamily = element.fontFamily || "Arial";
      textarea.style.color = "black";
      textarea.style.zIndex = "1000";
      textarea.style.touchAction = "manipulation";
      textarea.style.textAlign = "center";

      textarea.focus({ preventScroll: true });
      textarea.select();

      window.scrollTo(scrollX, scrollY);

      const removeTextarea = () => {
        if (textarea.parentNode) {
          textarea.parentNode.removeChild(textarea);
        }
        setIsEditing(false);
      };

      textarea.addEventListener("blur", () => {
        onChange({ text: textarea.value });
        removeTextarea();
      });

      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onChange({ text: textarea.value });
          removeTextarea();
        } else if (e.key === "Escape") {
          e.preventDefault();
          removeTextarea();
        }
      });

      return removeTextarea;
    }
  }, [isEditing]);

  const strokeWidth = element.strokeWidth || 0;

  return (
    <Text
      ref={textRef}
      id={element.id}
      x={element.x}
      y={element.y}
      text={element.text}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily || "Arial"}
      fill={element.fill || "#000000"}
      stroke={strokeWidth > 0 ? element.stroke || "#ffffff" : undefined}
      strokeWidth={strokeWidth}
      draggable
      width={element.width}
      rotation={element.rotation}
      align="center"
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragStart={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(node.width() * scaleX, 20),
          rotation: node.rotation(),
        });
      }}
    />
  );
}

interface KonvaImageProps {
  element: FrontPageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<FrontPageElement>) => void;
}

function KonvaImage({
  element,
  isSelected,
  onSelect,
  onChange,
}: KonvaImageProps) {
  const [image, setImage] = React.useState<HTMLImageElement | null>(null);
  const [isNewlyAdded, setIsNewlyAdded] = React.useState(true);
  const imageRef = React.useRef<Konva.Image>(null);

  React.useEffect(() => {
    if (element.imageUrl) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = element.imageUrl;
      img.onload = () => {
        setImage(img);
        if (isNewlyAdded) {
          setTimeout(() => {
            onSelect();
            setIsNewlyAdded(false);
          }, 10);
        }
      };
    }
  }, [element.imageUrl, isNewlyAdded, onSelect]);

  if (!image) {
    return null;
  }

  return (
    <Image
      ref={imageRef}
      id={element.id}
      image={image}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragStart={onSelect}
      onDragEnd={(e) => {
        onChange({
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(node.width() * scaleX, 20),
          height: Math.max(node.height() * scaleY, 20),
          rotation: node.rotation(),
        });
      }}
    />
  );
}
