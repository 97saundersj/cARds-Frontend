export function SharedStyles() {
  return (
    <style>{`
      :root {
        --bs-primary: #ff5733 !important;
      }

      .btn-primary {
        background-color: #ff5733 !important;
        border-color: #ff5733 !important;
      }

      .btn-primary:hover {
        background-color: #e04a2b !important;
        border-color: #e04a2b !important;
      }

      .title {
        font-size: 4rem;
        letter-spacing: 5px;
        position: relative;
        text-decoration-color: #ff5733;
      }

      .title .highlight {
        color: #ff5733;
        font-weight: bold;
      }

      .copy-icon, .share-icon {
        color: #6c757d;
      }

      .copy-icon:hover, .share-icon:hover {
        color: #ff5733;
      }

      .decorative-element {
        width: 50px;
        height: 50px;
        background-color: #ff5733;
        margin: 10px;
        border-radius: 50%;
      }

      #unity-container {
        width: 100%;
        height: 100%;
        position: relative;
      }

      #unity-canvas {
        width: 100%;
        height: 100%;
      }
    `}</style>
  );
}
