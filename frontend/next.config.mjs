/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/punch-log',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
