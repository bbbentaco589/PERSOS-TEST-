/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    qualities: [75, 90, 92],
  },
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
    ];

    if (process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === "preview") {
      securityHeaders.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
