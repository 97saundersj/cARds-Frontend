interface FooterProps {
  author?: string;
}

export function Footer({ author = "Jacques Saunders" }: FooterProps) {
  return (
    <footer className="w-100 text-center py-3">
      <p className="m-0">Made by {author}</p>
    </footer>
  );
}
