import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Configuração para ignorar erros de build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Configuração de imagens
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  
  // Configuração experimental
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  
  // Configuração de webpack para otimização
  webpack: (config, { isServer }) => {
    // Otimizações para o lado do cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    return config
  },
  
  // Configuração de headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Configuração de redirecionamentos
  async redirects() {
    return []
  },
  
  // Configuração de rewrites
  async rewrites() {
    return []
  },
}

export default nextConfig