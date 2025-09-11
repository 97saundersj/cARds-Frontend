interface LandingPageFormProps {
  header: string;
  message: string;
  onHeaderChange: (value: string) => void;
  onMessageChange: (value: string) => void;
}

export function LandingPageForm({
  header,
  message,
  onHeaderChange,
  onMessageChange,
}: LandingPageFormProps) {
  return (
    <div className="mb-4">
      <h6 className="fw-bold">Landing Page</h6>
      <p className="text-muted">
        Customize the landing page for your greeting card
      </p>
      <div className="border p-3 rounded bg-light">
        <div className="mb-3">
          <label htmlFor="landingPageHeaderInput" className="form-label">
            Header
          </label>
          <input
            type="text"
            className="form-control"
            id="landingPageHeaderInput"
            placeholder="Enter header text"
            value={header}
            onChange={(e) => onHeaderChange(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="landingPageMessageInput" className="form-label">
            Message
          </label>
          <textarea
            className="form-control"
            id="landingPageMessageInput"
            rows={3}
            placeholder="Enter message text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
