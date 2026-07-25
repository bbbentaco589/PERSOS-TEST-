import type { MetadataRoute } from "next";

import { getSiteUrl, isPreviewDeployment } from "@/lib/deployment";

export default function robots(): MetadataRoute.Robots {
  if (isPreviewDeployment()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    host: getSiteUrl().origin,
  };
}
