/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  experimental: { optimizePackageImports: ["lucide-react", "@react-three/drei"] },
};
export default nextConfig;
