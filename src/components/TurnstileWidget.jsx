import React, { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function TurnstileWidget({ onVerify, onExpire }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    function render() {
      if (window.turnstile && containerRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: onVerify,
          "expired-callback": onExpire,
          "error-callback": onExpire,
        });
      }
    }

    if (window.turnstile) {
      render();
    } else {
      const existing = document.querySelector('script[data-turnstile-script="true"]');
      if (existing) {
        existing.addEventListener("load", render);
      } else {
        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        script.async = true;
        script.defer = true;
        script.dataset.turnstileScript = "true";
        script.onload = render;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) {
    return (
      <p className="text-red-700 text-xs">
        缺少 VITE_TURNSTILE_SITE_KEY 環境變數，人機驗證無法載入。
      </p>
    );
  }

  return <div ref={containerRef} />;
}
