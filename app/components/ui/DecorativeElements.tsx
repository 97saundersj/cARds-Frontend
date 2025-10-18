interface DecorativeElementsProps {
  count?: number;
  color?: string;
}

export function DecorativeElements({
  count = 2,
  color = "#ff5733",
}: DecorativeElementsProps) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="decorative-element"
          style={{ backgroundColor: color }}
        />
      ))}
    </>
  );
}
