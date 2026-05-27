/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "axomprahari-storage.ff489ab995d11fb76acfee00d81cfb38.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "ff489ab995d11fb76acfee00d81cfb38.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-r2.axomprahari.in",
      },
    ],
  },
};

export default nextConfig;
