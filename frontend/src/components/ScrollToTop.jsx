import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export default function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();

  // Tell the browser to handle scroll restoration manually
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Save scroll position for the current location key and path
  useEffect(() => {
    const savePosition = () => {
      const scrollY = String(window.scrollY);
      sessionStorage.setItem(`scroll_pos_${location.key}`, scrollY);
      sessionStorage.setItem(`scroll_pos_${location.pathname}`, scrollY);
    };

    window.addEventListener("scroll", savePosition, { passive: true });
    return () => {
      savePosition();
      window.removeEventListener("scroll", savePosition);
    };
  }, [location.key, location.pathname]);

  // Restore scroll position or scroll to target/top on navigation
  useLayoutEffect(() => {
    // 1. If anchor hash exists (e.g. #footer, #features, #demo, #workflow)
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      const targetElement = document.getElementById(targetId) || document.querySelector(location.hash);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }, 60);
        return;
      }
    }

    // 2. If navigating BACK / FORWARD (POP navigation)
    if (navType === "POP") {
      const savedKeyPos = sessionStorage.getItem(`scroll_pos_${location.key}`);
      const savedPathPos = sessionStorage.getItem(`scroll_pos_${location.pathname}`);
      const savedY = savedKeyPos !== null 
        ? parseInt(savedKeyPos, 10) 
        : (savedPathPos !== null ? parseInt(savedPathPos, 10) : null);

      if (savedY !== null && !isNaN(savedY)) {
        window.scrollTo({ top: savedY, behavior: "instant" });
        
        requestAnimationFrame(() => {
          window.scrollTo({ top: savedY, behavior: "instant" });
        });

        const timer = setTimeout(() => {
          window.scrollTo({ top: savedY, behavior: "instant" });
        }, 100);

        return () => clearTimeout(timer);
      }
    }

    // 3. Fresh PUSH navigation without hash: scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.key, location.hash, navType]);

  return null;
}
