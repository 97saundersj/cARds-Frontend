import { useEffect } from "react";
import { useNavigate } from "react-router";

export function RedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = sessionStorage.getItem("redirect");
    if (redirect) {
      sessionStorage.removeItem("redirect");
      // Extract the path without the basename
      const path = redirect.replace("/cARds-Frontend", "");
      navigate(path, { replace: true });
    }
  }, [navigate]);

  return null;
}
