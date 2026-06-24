/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Build ke time ESLint errors ignore
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ TypeScript errors ignore
  },
  images: {
    domains: ['ik.imagekit.io'],
  },
};

export default nextConfig;