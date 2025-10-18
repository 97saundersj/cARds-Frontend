interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "cARds" }: NavbarProps) {
  return (
    <nav className="navbar sticky-top navbar-expand-lg navbar-light bg-light p-0">
      <div className="container-fluid justify-content-center">
        <h1 className="navbar-brand title m-0 pt-0">
          <u className="title">
            c<span className="highlight">AR</span>ds
          </u>
        </h1>
      </div>
    </nav>
  );
}
