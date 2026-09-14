import { useState, useEffect, useRef } from "react";

/**
 * useNetworkStatus
 * Monitors real-time internet connectivity, slow network conditions,
 * and active background requests across the application.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  const [connectionType, setConnectionType] = useState(() => {
    if (typeof navigator !== "undefined" && navigator.connection) {
      return navigator.connection.effectiveType || "4g";
    }
    return "4g";
  });

  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [activeRequests, setActiveRequests] = useState(0);

  const slowTimerRef = useRef(null);

  useEffect(() => {
    // 1. Online / Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 2. Network Information API (Chrome / Edge / Android)
    const conn = navigator.connection;
    const updateConnectionInfo = () => {
      if (conn) {
        setConnectionType(conn.effectiveType || "4g");
        if (
          conn.effectiveType === "slow-2g" ||
          conn.effectiveType === "2g" ||
          conn.effectiveType === "3g" ||
          conn.saveData === true
        ) {
          setIsSlowNetwork(true);
        } else {
          setIsSlowNetwork(false);
        }
      }
    };

    if (conn) {
      updateConnectionInfo();
      conn.addEventListener("change", updateConnectionInfo);
    }

    // 3. Listen to app request start/end to track active in-flight requests and latency
    const handleReqStart = () => {
      setActiveRequests((prev) => prev + 1);
    };

    const handleReqEnd = (e) => {
      setActiveRequests((prev) => Math.max(0, prev - 1));
      const duration = e?.detail?.duration || 0;
      
      // If a request took more than 1800ms, flag slow network temporarily
      if (duration > 1800) {
        setIsSlowNetwork(true);
        if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
        slowTimerRef.current = setTimeout(() => {
          // Re-evaluate against connection API
          if (!conn || (conn.effectiveType !== "slow-2g" && conn.effectiveType !== "2g" && conn.effectiveType !== "3g")) {
            setIsSlowNetwork(false);
          }
        }, 12000);
      }
    };

    window.addEventListener("app_network_request_start", handleReqStart);
    window.addEventListener("app_network_request_end", handleReqEnd);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (conn) {
        conn.removeEventListener("change", updateConnectionInfo);
      }
      window.removeEventListener("app_network_request_start", handleReqStart);
      window.removeEventListener("app_network_request_end", handleReqEnd);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

  return {
    isOnline,
    isSlowNetwork,
    connectionType,
    activeRequests,
    isBackgroundBusy: activeRequests > 0,
  };
}

export default useNetworkStatus;
