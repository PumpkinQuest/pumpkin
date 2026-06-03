/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/pumpkin",
  assetPrefix: "/pumpkin/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
