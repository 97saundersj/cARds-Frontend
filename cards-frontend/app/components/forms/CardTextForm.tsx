interface CardTextFormProps {
  cardTop: string;
  cardMiddle: string;
  cardBottom: string;
  onTopChange: (value: string) => void;
  onMiddleChange: (value: string) => void;
  onBottomChange: (value: string) => void;
}

export function CardTextForm({
  cardTop,
  cardMiddle,
  cardBottom,
  onTopChange,
  onMiddleChange,
  onBottomChange,
}: CardTextFormProps) {
  return (
    <>
      <div className="mb-3">
        <label htmlFor="cardTopInput" className="form-label">
          Top Text
        </label>
        <input
          type="text"
          className="form-control"
          id="cardTopInput"
          placeholder="Enter top text"
          value={cardTop}
          onChange={(e) => onTopChange(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="cardMiddleInput" className="form-label">
          Middle Text
        </label>
        <textarea
          className="form-control"
          id="cardMiddleInput"
          placeholder="Enter middle text"
          value={cardMiddle}
          onChange={(e) => onMiddleChange(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="cardBottomInput" className="form-label">
          Bottom Text
        </label>
        <textarea
          className="form-control"
          id="cardBottomInput"
          placeholder="Enter bottom text"
          value={cardBottom}
          onChange={(e) => onBottomChange(e.target.value)}
        />
      </div>
    </>
  );
}
