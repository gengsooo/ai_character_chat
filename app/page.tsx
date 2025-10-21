'use client';

import React, { useState } from 'react';
import { FileText, MessageCircle, Sparkles, ArrowRight, Info } from 'lucide-react';
import PDFUploader from '@/components/PDFUploader';
import CharacterDisplay from '@/components/CharacterDisplay';
import ChatInterface from '@/components/ChatInterface';
import { CharacterInfo, PDFAnalysisResult } from '@/types/character';

/**
 * 메인 페이지 컴포넌트
 * PDF 업로드 → 인물 정보 추출 → 이미지 생성 → 채팅의 전체 플로우 관리
 */
const HomePage = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'display' | 'chat'>('upload');
  const [character, setCharacter] = useState<CharacterInfo | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string>('');
  const [characterImageUrl, setCharacterImageUrl] = useState<string>('');

  /**
   * PDF 업로드 성공 처리
   */
  const handleUploadSuccess = (result: PDFAnalysisResult) => {
    if (result.characterInfo) {
      setCharacter(result.characterInfo);
      setCurrentStep('display');
    }
  };

  /**
   * PDF 업로드 오류 처리
   */
  const handleUploadError = (error: string) => {
    console.error('업로드 오류:', error);
    // 에러 처리 로직 (토스트 메시지 등)
  };

  /**
   * 이미지 생성 완료 처리
   */
  const handleImageGenerated = (imageUrl: string) => {
    setGeneratedImageUrl(imageUrl);
    setCharacterImageUrl(imageUrl); // 채팅용 이미지 URL 설정
    // 캐릭터 정보에 이미지 URL 추가
    if (character) {
      setCharacter({
        ...character,
        imageUrl: imageUrl
      });
    }
  };

  /**
   * 채팅 시작
   */
  const startChat = () => {
    setCurrentStep('chat');
  };

  /**
   * 새로운 인물 생성 (처음부터 다시)
   */
  const resetToUpload = () => {
    setCurrentStep('upload');
    setCharacter(null);
    setGeneratedImageUrl('');
    setCharacterImageUrl('');
  };

  /**
   * 단계별 진행 상태 표시
   */
  const renderProgressSteps = () => {
    const steps = [
      { key: 'upload', label: 'PDF 업로드', icon: FileText },
      { key: 'display', label: '인물 생성', icon: Sparkles },
      { key: 'chat', label: '대화 시작', icon: MessageCircle },
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.key;
          const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
          
          return (
            <React.Fragment key={step.key}>
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isActive 
                  ? 'bg-primary-500 text-white shadow-lg' 
                  : isCompleted 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              
              {index < steps.length - 1 && (
                <ArrowRight className={`w-4 h-4 ${
                  isCompleted ? 'text-green-500' : 'text-gray-300'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  /**
   * 업로드 단계 렌더링
   */
  const renderUploadStep = () => (
    <div className="space-y-8">
      {/* 서비스 소개 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>AI 인물 생성 & 대화 서비스</span>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">
          PDF로 인물을 만나보세요
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          인물의 외모, 성격, 직업이 담긴 PDF를 업로드하면 
          <br className="hidden sm:block" />
          AI가 캐릭터 이미지를 생성하고 대화할 수 있습니다.
        </p>
      </div>

      {/* 기능 소개 */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
        <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">PDF 분석</h3>
          <p className="text-sm text-gray-600">
            LangChain을 사용하여 인물 정보를 정확하게 추출합니다.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">캐리커쳐 생성</h3>
          <p className="text-sm text-gray-600">
            Stable Diffusion으로 인물의 특징을 살린 친근한 캐릭터를 생성합니다.
          </p>
        </div>
        
        <div className="text-center p-6 bg-white rounded-xl shadow-sm hover-lift">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">자연스러운 대화</h3>
          <p className="text-sm text-gray-600">
            인물의 성격과 배경을 바탕으로 자연스러운 대화를 나눌 수 있습니다.
          </p>
        </div>
      </div>

      {/* PDF 업로더 */}
      <PDFUploader 
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* 사용 팁 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h4 className="font-medium text-amber-800">더 좋은 결과를 위한 팁</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 외모 특징 (나이, 키, 머리색, 얼굴형 등)을 상세히 기술해주세요</li>
              <li>• 성격 특성과 말투, 습관 등을 포함해주세요</li>
              <li>• 직업, 취미, 배경 정보가 있으면 더 생생한 대화가 가능합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * 인물 표시 단계 렌더링
   */
  const renderDisplayStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">인물이 생성되었습니다!</h2>
        <p className="text-gray-600">캐릭터가 완성되면 대화를 시작할 수 있습니다.</p>
      </div>

      {character && (
        <CharacterDisplay 
          character={character}
          imageUrl={characterImageUrl}
          onImageGenerated={handleImageGenerated}
        />
      )}

      <div className="flex justify-center space-x-4">
        <button
          onClick={resetToUpload}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>다른 인물 생성</span>
        </button>
        
        <button
          onClick={startChat}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>대화 시작하기</span>
        </button>
      </div>
    </div>
  );

  /**
   * 채팅 단계 렌더링
   */
  const renderChatStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {character?.name}과 대화해보세요
        </h2>
        <p className="text-gray-600">
          인물의 성격과 배경을 바탕으로 자연스러운 대화를 나눌 수 있습니다.
        </p>
      </div>

      {character && <ChatInterface character={character} imageUrl={characterImageUrl} />}

      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentStep('display')}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>인물 정보 보기</span>
        </button>
        
        <button
          onClick={resetToUpload}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>새 인물 생성</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* 진행 상태 */}
      {renderProgressSteps()}

      {/* 단계별 콘텐츠 */}
      <div className="animate-fade-in">
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'display' && renderDisplayStep()}
        {currentStep === 'chat' && renderChatStep()}
      </div>
    </div>
  );
};

export default HomePage;
