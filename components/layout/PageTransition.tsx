"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setVisible(false);
      prevPath.current = pathname;
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.28s ease, transform 0.28s cubic-bezier(.4,0,.2,1)",
        minHeight: "100%",
      }}
    >
      {children}
    </div>
  );
}
