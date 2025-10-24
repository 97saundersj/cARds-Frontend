interface DecorativeElementsProps {
  count?: number;
  color?: string;
}

export function DecorativeElements({
  count = 3,
  color = "#ff7f50",
}: DecorativeElementsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="decorative-element"
          style={{
            backgroundColor: color,
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            margin: "10px",
            animation: `bounce 2s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-30px);
          }
          60% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
}
