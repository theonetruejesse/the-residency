/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@residency/ui", "@residency/api"],
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "the-residency.ufs.sh",
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: "xaq0c80u7p.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
};

export default nextConfig;
