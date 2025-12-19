/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.replit.dev', '*.pike.replit.dev', '*.spock.replit.dev', '*.sisko.replit.dev', '*.riker.replit.dev', '127.0.0.1', 'localhost'],
}

export default nextConfig