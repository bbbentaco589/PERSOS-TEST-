/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    qualities: [75, 90, 92],
  },
  async headers() {
    if (process.env.NEXT_PUBLIC_DEPLOYMENT_MODE !== "preview") {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
