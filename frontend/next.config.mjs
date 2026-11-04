/** @type {import('next').NextConfig} */
const backendUrl = (process.env.BACKEND_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const nextConfig = {
  // Disabled: react-leaflet v4 initializes its map in the class constructor,
  // which crashes with "Map container is already initialized" under React 18
  // StrictMode's dev-only double-mount (reuses the same container div).
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/api-backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
