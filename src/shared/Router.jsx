import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const RouterContext = createContext({ path: "/", navigate: () => {} });

function normalizePath(hash) {
  const p = hash.slice(1) || "/";
  return p.startsWith("/") ? p : "/";
}

export function Router({ children }) {
  const [path, setPath] = useState(() => normalizePath(window.location.hash));
  useEffect(() => {
    const onHash = () => setPath(normalizePath(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function usePath() {
  return useContext(RouterContext).path;
}

export function useNavigate() {
  return useContext(RouterContext).navigate;
}

export function Route({ path, element }) {
  const current = usePath();
  let match = false;
  if (path === "/") {
    match = current === "/";
  } else {
    const pattern = path.replace(/:\w+/g, "([^/]+)");
    const regex = new RegExp("^" + pattern + "$");
    match = regex.test(current);
  }
  return match ? element : null;
}

export function Link({ to, children, style, className, onClick }) {
  const navigate = useNavigate();
  return (
    <a
      href={to}
      onClick={(e) => { e.preventDefault(); navigate(to); if (onClick) onClick(e); }}
      style={style}
      className={className}
    >
      {children}
    </a>
  );
}
