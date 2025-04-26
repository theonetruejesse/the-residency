/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@residency/ui", "@residency/api"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "the-residency.ufs.sh",
        pathname: "/f/*",
      },
      // todo, figure out if migration necessary
      {
        protocol: "https",
        hostname: "xaq0c80u7p.ufs.sh",
        pathname: "/f/*",
      },
    ],
  },
};

export default nextConfig;
