/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  images: { unoptimized: true }, // Ensures images work in Firebase Hosting
};

export default nextConfig;
