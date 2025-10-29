import React from "react";
import { Stage, Layer, Text, Image, Transformer, Rect } from "react-konva";
import type { CardData, FrontPageElement } from "../../types/card";
import Konva from "konva";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface CardFrontPageStepProps {
  cardData: CardData;
  handleFrontPageElementsChange: (elements: FrontPageElement[]) => void;
  customImageUrl: string;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCanvas: (imageUrl: string) => void;
  isUploading: boolean;
  previousStep?: () => void;
  nextStep?: () => void;
}

export function CardFrontPageStep({
  cardData,
  handleFrontPageElementsChange,
  customImageUrl,
  handleFileUpload,
  onExportCanvas,
  isUploading,
  previousStep,
  nextStep,
}: CardFrontPageStepProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [elements, setElements] = React.useState<FrontPageElement[]>([]);
  const [lastUploadedUrl, setLastUploadedUrl] = React.useState("");
  const [isInitialized, setIsInitialized] = React.useState(false);
  const stageRef = React.useRef<Konva.Stage>(null);
  const transformerRef = React.useRef<Konva.Transformer>(null);
  const layerRef = React.useRef<Konva.Layer>(null);

  const [canvasDimensions, setCanvasDimensions] = React.useState({
    width: 400,
    height: 600,
  });
  const canvasContainerRef = React.useRef<HTMLDivElement>(null);

  const CANVAS_WIDTH = canvasDimensions.width;
  const CANVAS_HEIGHT = canvasDimensions.height;

  // Update canvas dimensions on mount and resize
  React.useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasContainerRef.current) {
        const containerWidth = canvasContainerRef.current.clientWidth;
        // Maintain 2:3 aspect ratio (400:600)
        const maxWidth = Math.min(containerWidth - 32, 400); // 32px for padding
        const height = (maxWidth * 3) / 2;
        setCanvasDimensions({ width: maxWidth, height });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  const elementsRef = React.useRef(elements);

  // Keep ref in sync with latest elements
  React.useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Load elements from cardData on mount or when cardData changes
  React.useEffect(() => {
    const hasElementsInData =
      cardData.frontPageElements && cardData.frontPageElements.length > 0;
    const currentlyHasElements = elements.length > 0;

    // Load from cardData if:
    // 1. We have data and haven't initialized yet, OR
    // 2. We have data and currently have no elements (coming back to step)
    if (hasElementsInData && (!isInitialized || !currentlyHasElements)) {
      console.log("Loading front page elements:", cardData.frontPageElements);
      setElements(cardData.frontPageElements!);
      setIsInitialized(true);
    } else if (!isInitialized && !hasElementsInData) {
      // Initialize to empty only if we haven't initialized yet and no data
      console.log("Initializing empty front page");
      setElements([]);
      setIsInitialized(true);
    }
  }, [cardData.frontPageElements, isInitialized, elements.length]);

  // Save elements when component unmounts (navigating away)
  React.useEffect(() => {
    return () => {
      handleFrontPageElementsChange(elementsRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFrontPageElementsChange]);

  React.useEffect(() => {
    if (transformerRef.current && layerRef.current) {
      if (selectedId) {
        const selectedNode = layerRef.current.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        // Clear transformer when nothing is selected
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedId]);

  React.useEffect(() => {
    // Only add images from user uploads, not canvas exports
    // Canvas exports are data URLs (data:image/...), user uploads are HTTP URLs
    const isCanvasExport =
      customImageUrl && customImageUrl.startsWith("data:image");

    if (
      customImageUrl &&
      customImageUrl !== lastUploadedUrl &&
      !isCanvasExport
    ) {
      setLastUploadedUrl(customImageUrl);
      const newElement: FrontPageElement = {
        id: `image-${Date.now()}`,
        type: "image",
        x: CANVAS_WIDTH / 2 - 75,
        y: CANVAS_HEIGHT / 2 - 75,
        imageUrl: customImageUrl,
        width: 150,
        height: 150,
      };
      setElements((prev) => [...prev, newElement]);
      // Selection will be handled by the KonvaImage component once the image loads
    }
  }, [customImageUrl, lastUploadedUrl, CANVAS_WIDTH, CANVAS_HEIGHT]);

  const addTextElement = () => {
    const newElement: FrontPageElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: CANVAS_WIDTH / 2 - 50,
      y: CANVAS_HEIGHT / 2 - 20,
      text: "Double click to edit",
      fontSize: 24,
      width: 200,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedId(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<FrontPageElement>) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  };

  const deleteSelected = () => {
    if (selectedId) {
      const newElements = elements.filter((el) => el.id !== selectedId);
      setElements(newElements);
      setSelectedId(null);
    }
  };

  const moveLayerUp = () => {
    if (!selectedId) return;

    const currentIndex = elements.findIndex((el) => el.id === selectedId);
    if (currentIndex < elements.length - 1) {
      const newElements = [...elements];
      [newElements[currentIndex], newElements[currentIndex + 1]] = [
        newElements[currentIndex + 1],
        newElements[currentIndex],
      ];
      setElements(newElements);
    }
  };

  const moveLayerDown = () => {
    if (!selectedId) return;

    const currentIndex = elements.findIndex((el) => el.id === selectedId);
    if (currentIndex > 0) {
      const newElements = [...elements];
      [newElements[currentIndex], newElements[currentIndex - 1]] = [
        newElements[currentIndex - 1],
        newElements[currentIndex],
      ];
      setElements(newElements);
    }
  };

  const handleElementSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Deselect when clicking on empty canvas (Stage background)
    const clickedOnStage = e.target === stageRef.current;
    if (clickedOnStage) {
      setSelectedId(null);
    }
  };

  const handlePreviousStep = () => {
    // Save current elements before navigating back
    handleFrontPageElementsChange(elements);
    if (previousStep) {
      previousStep();
    }
  };

  const handleNextStep = async () => {
    // Save current elements to parent state
    handleFrontPageElementsChange(elements);

    if (stageRef.current && elements.length > 0) {
      // Clear selection before exporting
      setSelectedId(null);

      // Wait a bit for the transformer to clear
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/jpeg",
        quality: 0.75,
      });

      onExportCanvas(dataURL);
    }

    // Proceed to next step
    if (nextStep) {
      nextStep();
    }
  };

  return (
    <div>
      <h6 className="fw-bold">Card Front Page</h6>
      <p className="text-muted">
        Design the front of your card by adding and arranging text and images
      </p>

      <div className="row">
        <div className="col-md-4">
          <div className="border p-3 rounded bg-light">
            <h6 className="fw-bold mb-3">Tools</h6>

            <button
              className="btn btn-primary w-100 mb-2"
              onClick={addTextElement}
            >
              <i className="fas fa-font me-2" />
              Add Text
            </button>

            <div className="mb-3">
              <label htmlFor="imageUpload" className="btn btn-primary w-100">
                {isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-image me-2" />
                    Add Image
                  </>
                )}
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{ display: "none" }}
              />
            </div>

            {selectedId && (
              <div className="border-top pt-3 mt-3">
                <h6 className="fw-bold mb-2">Selected Element</h6>
                {elements.find((el) => el.id === selectedId)?.type ===
                  "text" && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small mb-0">Font Size</label>
                      <span className="badge bg-primary">
                        {elements.find((el) => el.id === selectedId)
                          ?.fontSize || 24}
                        px
                      </span>
                    </div>
                    <Slider
                      min={12}
                      max={72}
                      value={
                        elements.find((el) => el.id === selectedId)?.fontSize ||
                        24
                      }
                      onChange={(value) =>
                        updateElement(selectedId, {
                          fontSize:
                            typeof value === "number" ? value : value[0],
                        })
                      }
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small mb-2">Layer Order</label>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary flex-fill"
                      onClick={moveLayerDown}
                      title="Move layer down (backward)"
                    >
                      <i className="fas fa-arrow-down" />
                    </button>
                    <button
                      className="btn btn-outline-secondary flex-fill"
                      onClick={moveLayerUp}
                      title="Move layer up (forward)"
                    >
                      <i className="fas fa-arrow-up" />
                    </button>
                  </div>
                </div>

                <button
                  className="btn btn-danger w-100"
                  onClick={deleteSelected}
                >
                  <i className="fas fa-trash me-2" />
                  Delete
                </button>
              </div>
            )}

            <div className="border-top pt-3 mt-3">
              <h6 className="fw-bold mb-2">Instructions</h6>
              <ul className="small text-muted mb-0">
                <li>Click elements to select</li>
                <li>Drag to move</li>
                <li>Double-click text to edit</li>
                <li>Use handles to resize/rotate</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-8 mt-4 mt-md-0">
          <div className="border rounded bg-white p-3">
            <h6 className="fw-bold mb-3 text-muted">Canvas</h6>
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
                ref={stageRef}
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
                  {/* White background rectangle */}
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
                          onSelect={() => handleElementSelect(element.id)}
                          onChange={(updates) =>
                            updateElement(element.id, updates)
                          }
                        />
                      );
                    } else if (element.type === "image") {
                      return (
                        <KonvaImage
                          key={element.id}
                          element={element}
                          isSelected={element.id === selectedId}
                          onSelect={() => handleElementSelect(element.id)}
                          onChange={(updates) =>
                            updateElement(element.id, updates)
                          }
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
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={handlePreviousStep}>
          <i className="fas fa-arrow-left me-1" /> Back
        </button>
        <button className="btn btn-primary" onClick={handleNextStep}>
          Next <i className="fas fa-arrow-right ms-1" />
        </button>
      </div>
    </div>
  );
}

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
    // Prevent default behavior that might cause scrolling on mobile
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

      // Store current scroll position to prevent unwanted scrolling
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
      textarea.style.fontFamily = "Arial";
      textarea.style.color = "black";
      textarea.style.zIndex = "1000";
      textarea.style.touchAction = "manipulation";
      textarea.style.textAlign = "center";

      // Focus without scrolling
      textarea.focus({ preventScroll: true });
      textarea.select();

      // Restore scroll position if it changed
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
        // Allow normal text editing (backspace, delete, etc.)
        // Only handle special keys
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          onChange({ text: textarea.value });
          removeTextarea();
        } else if (e.key === "Escape") {
          e.preventDefault();
          removeTextarea();
        }
        // Let all other keys (including backspace, delete) work normally
        // Don't call e.stopPropagation() or e.preventDefault() for text editing keys
      });

      return removeTextarea;
    }
  }, [isEditing]);

  return (
    <Text
      ref={textRef}
      id={element.id}
      x={element.x}
      y={element.y}
      text={element.text}
      fontSize={element.fontSize}
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
        // Auto-select newly added images once they load
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
