import React, { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "../lib/utils";

function polygonCollapsed(point, vertexCount) {
  const pairs = Array.from({ length: vertexCount }, () => point).join(", ");
  return `polygon(${pairs})`;
}

// All coordinates are percentages of the snapshot reference box: Chrome 150
// renders absolute px clip-path coordinates on ::view-transition-new(root)
// unscaled on fractional display scales (e.g. Windows 150%) for the first
// transition after load, so px values land at the wrong position (#989).
function getThemeTransitionClipPaths(
  variant,
  cx,
  cy,
  maxRadius,
  viewportWidth,
  viewportHeight
) {
  const toX = (x) => `${(x / viewportWidth) * 100}%`;
  const toY = (y) => `${(y / viewportHeight) * 100}%`;
  const point = (x, y) => `${toX(x)} ${toY(y)}`;
  // circle() percentage radii resolve against hypot(w, h) / sqrt(2) of the reference box.
  const toRadius = (r) =>
    `${((r * 1.05) / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;

  switch (variant) {
    case "circle":
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
    case "square": {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const halfSide = Math.max(halfW, halfH) * 1.05;
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "triangle": {
      const scale = maxRadius * 2.2;
      const dx = (Math.sqrt(3) / 2) * scale;
      const verts = [
        point(cx, cy - scale),
        point(cx + dx, cy + 0.5 * scale),
        point(cx - dx, cy + 0.5 * scale),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 3), `polygon(${verts})`];
    }
    case "diamond": {
      // Slightly larger than the view-transition circle radius so axis-aligned coverage matches the circle reveal.
      const R = maxRadius * Math.SQRT2;
      const end = [
        point(cx, cy - R),
        point(cx + R, cy),
        point(cx, cy + R),
        point(cx - R, cy),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "hexagon": {
      const R = maxRadius * Math.SQRT2;
      const verts = [];
      for (let i = 0; i < 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3;
        verts.push(point(cx + R * Math.cos(a), cy + R * Math.sin(a)));
      }
      return [
        polygonCollapsed(point(cx, cy), 6),
        `polygon(${verts.join(", ")})`,
      ];
    }
    case "rectangle": {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const end = [
        point(cx - halfW, cy - halfH),
        point(cx + halfW, cy - halfH),
        point(cx + halfW, cy + halfH),
        point(cx - halfW, cy + halfH),
      ].join(", ");
      return [polygonCollapsed(point(cx, cy), 4), `polygon(${end})`];
    }
    case "star": {
      // Small overscan so the last frames never leave a 1px seam before the transition group ends.
      const R = maxRadius * Math.SQRT2 * 1.03;
      const innerRatio = 0.42;
      const starPolygon = (radius) => {
        const verts = [];
        for (let i = 0; i < 5; i++) {
          const outerA = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
          verts.push(
            point(
              cx + radius * Math.cos(outerA),
              cy + radius * Math.sin(outerA)
            )
          );
          const innerA = outerA + Math.PI / 5;
          verts.push(
            point(
              cx + radius * innerRatio * Math.cos(innerA),
              cy + radius * innerRatio * Math.sin(innerA)
            )
          );
        }
        return `polygon(${verts.join(", ")})`;
      };
      const startR = Math.max(2, R * 0.025);
      return [starPolygon(startR), starPolygon(R)];
    }
    default:
      return [
        `circle(0% at ${point(cx, cy)})`,
        `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`,
      ];
  }
}

export const AnimatedThemeToggler = ({
  className,
  duration = 1200,
  variant,
  fromCenter = false,
  theme,
  onThemeChange,
  ...props
}) => {
  const shape = variant ?? "circle";
  const isControlled = theme !== undefined;
  const [internalIsDark, setInternalIsDark] = useState(false);
  const isDark = isControlled ? theme === "dark" : internalIsDark;
  const buttonRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const activeAnimRef = useRef(null);

  const cancelAnim = useCallback(() => {
    activeAnimRef.current?.cancel();
    activeAnimRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnim();
      const root = document.documentElement;
      if (root.dataset.magicuiThemeVt !== "active") return;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty("--magicui-theme-toggle-vt-duration");
      root.style.removeProperty("--magicui-theme-vt-clip-from");
    };
  }, [cancelAnim]);

  useEffect(() => {
    if (isControlled) return;

    const updateTheme = () => {
      setInternalIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [isControlled]);

  const toggleTheme = useCallback(() => {
    const button = buttonRef.current;
    if (
      !button ||
      isTransitioningRef.current ||
      document.documentElement.dataset.magicuiThemeVt === "active"
    )
      return;

    // innerWidth/innerHeight (not visualViewport): percentages must resolve
    // against the snapshot reference box, which includes classic scrollbars.
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x;
    let y;
    if (fromCenter) {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    } else {
      const { top, left, width, height } = button.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y)
    );

    const applyTheme = () => {
      const newTheme = !isDark;
      // Always toggle the class synchronously so the View Transitions API
      // snapshots the new theme inside the startViewTransition callback.
      document.documentElement.classList.toggle("dark");
      if (isControlled) {
        onThemeChange?.(newTheme ? "dark" : "light");
      } else {
        setInternalIsDark(newTheme);
        localStorage.setItem("theme", newTheme ? "dark" : "light");
      }
    };

    if (typeof document.startViewTransition !== "function") {
      applyTheme();
      return;
    }

    const clipPath = getThemeTransitionClipPaths(
      shape,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight
    );

    const toX = `${(x / viewportWidth) * 100}%`;
    const toY = `${(y / viewportHeight) * 100}%`;

    const root = document.documentElement;
    root.dataset.magicuiThemeVt = "active";
    root.style.setProperty("--magicui-theme-toggle-vt-duration", `${duration}ms`);
    root.style.setProperty("--magicui-theme-vt-clip-from", clipPath[0]);

    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty("--magicui-theme-toggle-vt-duration");
      root.style.removeProperty("--magicui-theme-vt-clip-from");
      cancelAnim();
    };

    isTransitioningRef.current = true;
    const transition = document.startViewTransition(() => {
      flushSync(applyTheme);
    });
    if (typeof transition?.finished?.finally === "function") {
      transition.finished.finally(cleanup).catch(() => {});
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === "function") {
      ready
        .then(() => {
          // Hardware-accelerated 120fps compositor animation
          const anim = document.documentElement.animate(
            {
              clipPath,
            },
            {
              duration,
              easing: shape === "star" ? "linear" : "cubic-bezier(0.35, 0.05, 0.2, 1)",
              fill: "forwards",
              pseudoElement: "::view-transition-new(root)",
            }
          );
          activeAnimRef.current = anim;
        })
        .catch(() => {});
    }
  }, [
    shape,
    fromCenter,
    duration,
    isDark,
    isControlled,
    onThemeChange,
    cancelAnim,
  ]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={cn(
        "group relative flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-105",
        className
      )}
      {...props}
    >
      <div className="relative flex items-center justify-center w-5 h-5 pointer-events-none">
        <Sun
          className={cn(
            "absolute inset-0 m-auto w-full h-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 pointer-events-none"
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 m-auto w-full h-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu",
            isDark
              ? "rotate-90 scale-0 opacity-0 pointer-events-none"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </div>
    </button>
  );
};

export default AnimatedThemeToggler;
