/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 서버 컴포넌트에서 외부 패키지 사용 허용
    serverComponentsExternalPackages: ['pdf-parse', 'langchain']
  },
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'pbxt.replicate.delivery',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
}

module.exports = nextConfig
