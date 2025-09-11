import { CardImageSelector } from "./CardImageSelector";
import { CardTextForm } from "./CardTextForm";

interface ARCardFormProps {
  selectedImage: string;
  customImageUrl: string;
  isUploading: boolean;
  showCustomInput: boolean;
  cardTop: string;
  cardMiddle: string;
  cardBottom: string;
  onImageChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTopChange: (value: string) => void;
  onMiddleChange: (value: string) => void;
  onBottomChange: (value: string) => void;
}

export function ARCardForm({
  selectedImage,
  customImageUrl,
  isUploading,
  showCustomInput,
  cardTop,
  cardMiddle,
  cardBottom,
  onImageChange,
  onFileUpload,
  onTopChange,
  onMiddleChange,
  onBottomChange,
}: ARCardFormProps) {
  return (
    <div className="mb-4">
      <h6 className="fw-bold">AR Card</h6>
      <p className="text-muted">Customize your AR card</p>
      <div className="border p-3 rounded bg-light">
        <CardImageSelector
          selectedImage={selectedImage}
          customImageUrl={customImageUrl}
          isUploading={isUploading}
          showCustomInput={showCustomInput}
          onImageChange={onImageChange}
          onFileUpload={onFileUpload}
        />

        <CardTextForm
          cardTop={cardTop}
          cardMiddle={cardMiddle}
          cardBottom={cardBottom}
          onTopChange={onTopChange}
          onMiddleChange={onMiddleChange}
          onBottomChange={onBottomChange}
        />
      </div>
    </div>
  );
}
