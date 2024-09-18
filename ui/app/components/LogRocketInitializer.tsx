"use client";
import { useEffect } from "react";
import LogRocket from "logrocket";

export function LogRocketInitializer() {
  useEffect(() => {
    process.env.NEXT_PUBLIC_LOGROCKET &&
      LogRocket.init(process.env.NEXT_PUBLIC_LOGROCKET, {
        network: {
          requestSanitizer: (request) => {
            // Remove address request
            request.url = request.url.replace(/address=([^&]*)/, "address=***");
            request.url = request.url.replace(/latitude=([^&]*)/, "latitude=***");
            request.url = request.url.replace(/longitude=([^&]*)/, "longitude=***");
            request.url = request.url.replace(/latitudeA=([^&]*)/, "latitudeA=***");
            request.url = request.url.replace(/longitudeA=([^&]*)/, "longitudeA=***");

            if (request.url.includes("api-adresse.data.gouv.fr")) {
              return null;
            }
            return request;
          },
        },
        browser: {
          urlSanitizer: (url) => {
            let sanitizedUrl = url;
            // Remove address
            sanitizedUrl = sanitizedUrl.replace(/address=([^&]*)/, "address=***");
            sanitizedUrl = sanitizedUrl.replace(/latitude=([^&]*)/, "latitude=***");
            sanitizedUrl = sanitizedUrl.replace(/longitude=([^&]*)/, "longitude=***");
            sanitizedUrl = sanitizedUrl.replace(/latitudeA=([^&]*)/, "latitudeA=***");
            sanitizedUrl = sanitizedUrl.replace(/longitudeA=([^&]*)/, "longitudeA=***");
            return sanitizedUrl;
          },
        },
      });
  });
  return null;
}
