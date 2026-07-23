/** @type {import('next').NextConfig} */
const nextConfig = {
  // @pawconnect/shared ships TypeScript source; Next compiles it in-place.
  transpilePackages: ["@pawconnect/shared"],
};

export default nextConfig;
