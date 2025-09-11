import type { CardImageType } from "../../types/card";

interface CardImageSelectorProps {
  selectedImage: string;
  customImageUrl: string;
  isUploading: boolean;
  showCustomInput: boolean;
  onImageChange: (value: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CardImageSelector({
  selectedImage,
  customImageUrl,
  isUploading,
  showCustomInput,
  onImageChange,
  onFileUpload,
}: CardImageSelectorProps) {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="cardImageInput" className="form-label">
          Card Image
        </label>
        <select
          className="form-select"
          id="cardImageInput"
          value={selectedImage}
          onChange={(e) => onImageChange(e.target.value)}
        >
          <option value="birthday">Birthday</option>
          <option value="valentine">Valentine's Day</option>
          <option value="halloween">Halloween</option>
          <option value="christmas">Christmas</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {showCustomInput && (
        <div className="mb-3">
          <label htmlFor="customImageFile" className="form-label">
            Image
          </label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input
              type="file"
              className="form-control"
              id="customImageFile"
              accept="image/*"
              onChange={onFileUpload}
              disabled={isUploading}
            />
            {isUploading && (
              <i
                className="fas fa-spinner fa-spin"
                style={{ marginLeft: "10px" }}
              />
            )}
          </div>
          {customImageUrl && (
            <div className="mt-2">
              <small className="text-muted">Image uploaded successfully!</small>
            </div>
          )}
        </div>
      )}
    </>
  );
}
