"use client";

import { useEffect } from "react";

export function WheelPreventer() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "number") {
        (target as HTMLInputElement).blur();
      }
    };
    
    // Blur the input when scrolling to prevent accidental changes
    document.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      document.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return null;
}
