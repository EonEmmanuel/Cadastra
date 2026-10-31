/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disabled: react-leaflet v4 initializes its map in the class constructor,
  // which crashes with "Map container is already initialized" under React 18
  // StrictMode's dev-only double-mount (reuses the same container div).
  // Dev-only setting; production builds never double-invoke effects.
  reactStrictMode: false,
};

export default nextConfig;
