/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // react-globe.gl / three ship modern ESM; let Next transpile them cleanly.
  transpilePackages: ["react-globe.gl", "three"],
};

export default nextConfig;
