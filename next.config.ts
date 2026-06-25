/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Server Actions body size limit
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  
  // ✅ Images domains
  images: {
    domains: ['ik.imagekit.io', 'res.cloudinary.com'],
  },
  
  // ✅ Build errors ignore (temporary)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;