import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI 인물 챗봇 | Character AI Chatbot',
  description: 'PDF에서 인물 정보를 추출하여 캐리커쳐를 생성하고 대화할 수 있는 AI 챗봇 서비스',
  keywords: ['AI', '챗봇', '캐리커쳐', 'PDF', '인물분석', 'LangChain', 'Llama'],
  authors: [{ name: 'AI Chatbot Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
};

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased`}>
        {/* 메인 컨테이너 */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          {/* 헤더 */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">인물 AI 챗봇</h1>
                    <p className="text-xs text-gray-500">PDF로 인물 생성 & 대화</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>서비스 운영중</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* 푸터 */}
          <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                  <span>🤖 LangChain + Llama</span>
                  <span>🎨 Stable Diffusion</span>
                  <span>⚡ Next.js + React</span>
                </div>
                <p className="text-xs text-gray-500">
                  AI 기반 인물 분석 및 대화 서비스 | 개인정보는 저장되지 않습니다
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
