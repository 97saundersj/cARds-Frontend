import React from "react";
import type { CardData, FrontPageElement } from "../../types/card";
import Konva from "konva";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { CanvasEditor } from "../canvas/CanvasEditor";

interface CardFrontPageStepProps {
  cardData: CardData;
  handleFrontPageElementsChange: (elements: FrontPageElement[]) => void;
  customImageUrl: string;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportCanvas: (imageUrl: string) => void;
  isUploading: boolean;
  cardIdentifier: string;
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
  cardIdentifier,
  previousStep,
  nextStep,
}: CardFrontPageStepProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [elements, setElements] = React.useState<FrontPageElement[]>([]);
  const [lastUploadedUrl, setLastUploadedUrl] = React.useState("");
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [currentCardId, setCurrentCardId] = React.useState(cardIdentifier);
  const stageRef = React.useRef<Konva.Stage>(null);

  const elementsRef = React.useRef(elements);

  React.useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  // Clear canvas when card changes
  React.useEffect(() => {
    if (currentCardId !== cardIdentifier) {
      setCurrentCardId(cardIdentifier);
      setElements(cardData.frontPageElements || []);
      setSelectedId(null);
      setIsInitialized(true);
      setLastUploadedUrl("");
    }
  }, [cardIdentifier, currentCardId, cardData.frontPageElements]);

  // Load elements from cardData on mount
  React.useEffect(() => {
    const hasElementsInData =
      cardData.frontPageElements && cardData.frontPageElements.length > 0;
    const currentlyHasElements = elements.length > 0;

    if (hasElementsInData && (!isInitialized || !currentlyHasElements)) {
      setElements(cardData.frontPageElements!);
      setIsInitialized(true);
    } else if (!isInitialized && !hasElementsInData) {
      setElements([]);
      setIsInitialized(true);
    }
  }, [cardData.frontPageElements, isInitialized, elements.length]);

  // Save elements when component unmounts
  React.useEffect(() => {
    return () => {
      handleFrontPageElementsChange(elementsRef.current);
    };
  }, [handleFrontPageElementsChange]);

  // Handle image uploads
  React.useEffect(() => {
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
        x: 200 - 75,
        y: 300 - 75,
        imageUrl: customImageUrl,
        width: 150,
        height: 150,
      };
      setElements((prev) => [...prev, newElement]);
    }
  }, [customImageUrl, lastUploadedUrl]);

  const addTextElement = () => {
    const newElement: FrontPageElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: 200 - 50,
      y: 300 - 20,
      text: "Double click to edit",
      fontSize: 24,
      fontFamily: "sans-serif",
      width: 200,
      fill: "#000000",
      stroke: "#ffffff",
      strokeWidth: 0,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedId(newElement.id);
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

  const updateElement = (id: string, updates: Partial<FrontPageElement>) => {
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
  };

  const handlePreviousStep = () => {
    handleFrontPageElementsChange(elements);
    if (previousStep) {
      previousStep();
    }
  };

  const handleNextStep = async () => {
    handleFrontPageElementsChange(elements);

    if (stageRef.current && elements.length > 0) {
      setSelectedId(null);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/jpeg",
        quality: 0.75,
      });

      onExportCanvas(dataURL);
    }

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
                  <>
                    <div className="mb-3">
                      <label className="form-label small mb-1">Font</label>
                      <select
                        className="form-select form-select-sm"
                        value={
                          elements.find((el) => el.id === selectedId)
                            ?.fontFamily || "sans-serif"
                        }
                        onChange={(e) =>
                          updateElement(selectedId, {
                            fontFamily: e.target.value,
                          })
                        }
                      >
                        <option
                          value="sans-serif"
                          style={{ fontFamily: "sans-serif" }}
                        >
                          Sans Serif
                        </option>
                        <option value="serif" style={{ fontFamily: "serif" }}>
                          Serif
                        </option>
                        <option
                          value="monospace"
                          style={{ fontFamily: "monospace" }}
                        >
                          Monospace
                        </option>
                        <option
                          value="cursive"
                          style={{ fontFamily: "cursive" }}
                        >
                          Cursive
                        </option>
                        <option
                          value="fantasy"
                          style={{ fontFamily: "fantasy" }}
                        >
                          Fantasy
                        </option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label small mb-0">
                          Font Size
                        </label>
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
                          elements.find((el) => el.id === selectedId)
                            ?.fontSize || 24
                        }
                        onChange={(value) =>
                          updateElement(selectedId, {
                            fontSize:
                              typeof value === "number" ? value : value[0],
                          })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small mb-1">
                        Text Color
                      </label>
                      <input
                        type="color"
                        className="form-control form-control-color w-100"
                        value={
                          elements.find((el) => el.id === selectedId)?.fill ||
                          "#000000"
                        }
                        onChange={(e) =>
                          updateElement(selectedId, { fill: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="outlineCheckbox"
                          checked={
                            (elements.find((el) => el.id === selectedId)
                              ?.strokeWidth || 0) > 0
                          }
                          onChange={(e) =>
                            updateElement(selectedId, {
                              strokeWidth: e.target.checked ? 1 : 0,
                              stroke: e.target.checked ? "#ffffff" : "#000000",
                            })
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor="outlineCheckbox"
                        >
                          Outline
                        </label>
                      </div>
                    </div>

                    {(elements.find((el) => el.id === selectedId)
                      ?.strokeWidth || 0) > 0 && (
                      <>
                        <div className="mb-3">
                          <label className="form-label small mb-1">
                            Outline Color
                          </label>
                          <input
                            type="color"
                            className="form-control form-control-color w-100"
                            value={
                              elements.find((el) => el.id === selectedId)
                                ?.stroke || "#000000"
                            }
                            onChange={(e) =>
                              updateElement(selectedId, {
                                stroke: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label small mb-0">
                              Outline Width
                            </label>
                            <span className="badge bg-primary">
                              {elements.find((el) => el.id === selectedId)
                                ?.strokeWidth || 1}
                              px
                            </span>
                          </div>
                          <Slider
                            min={1}
                            max={4}
                            value={
                              elements.find((el) => el.id === selectedId)
                                ?.strokeWidth || 1
                            }
                            onChange={(value) =>
                              updateElement(selectedId, {
                                strokeWidth:
                                  typeof value === "number" ? value : value[0],
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </>
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
            <CanvasEditor
              ref={stageRef}
              elements={elements}
              selectedId={selectedId}
              onElementsChange={setElements}
              onSelectElement={setSelectedId}
            />
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
