'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { User, Briefcase, Heart, MapPin, Palette, RefreshCw } from 'lucide-react';
import { CharacterInfo, ImageGenerationResult } from '@/types/character';

interface CharacterDisplayProps {
  character: CharacterInfo;
  onImageGenerated?: (imageUrl: string) => void;
}

/**
 * 인물 정보 및 생성된 이미지 표시 컴포넌트
 */
const CharacterDisplay = ({ character, onImageGenerated }: CharacterDisplayProps) => {
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string>('');
  
  // useRef로 생성 상태를 추적하여 중복 호출 방지
  const hasInitialized = useRef(false);
  const currentCharacterId = useRef<string>('');

  /**
   * 컴포넌트 마운트 시 자동으로 이미지 생성 (한 번만)
   */
  useEffect(() => {
    // 새로운 캐릭터인 경우에만 초기화
    if (character.id !== currentCharacterId.current) {
      hasInitialized.current = false;
      currentCharacterId.current = character.id;
      setGeneratedImage('');
      setImageError('');
    }

    // 아직 초기화되지 않았고, 이미지가 없고, 생성 중이 아닐 때만 생성
    if (!hasInitialized.current && !generatedImage && !isGeneratingImage) {
      hasInitialized.current = true;
      generateCharacterImage();
    }
  }, [character.id, generatedImage, isGeneratingImage, generateCharacterImage]);

  /**
   * 캐리커쳐 이미지 생성 함수
   */
  const generateCharacterImage = useCallback(async (style: 'caricature' | 'cartoon' | 'realistic' = 'caricature') => {
    if (isGeneratingImage) {
      return;
    }
    
    setIsGeneratingImage(true);
    setImageError('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterInfo: character,
          style,
          mood: 'friendly',
        }),
      });

      const result: ImageGenerationResult = await response.json();

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        onImageGenerated?.(result.imageUrl);
      } else {
        throw new Error(result.error || '이미지 생성에 실패했습니다.');
      }

    } catch (error) {
      console.error('이미지 생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.';
      setImageError(errorMessage);
      hasInitialized.current = false; // 실패 시 재시도 가능하도록 리셋
    } finally {
      setIsGeneratingImage(false);
    }
  }, [character, isGeneratingImage, onImageGenerated]);

  /**
   * 외모 정보 포맷팅
   */
  const formatAppearance = () => {
    const { appearance } = character;
    const parts = [];
    
    if (appearance.age) parts.push(appearance.age);
    if (appearance.gender) parts.push(appearance.gender);
    if (appearance.height) parts.push(appearance.height);
    if (appearance.build) parts.push(appearance.build);
    
    return parts.length > 0 ? parts.join(', ') : '정보 없음';
  };

  /**
   * 성격 특성 포맷팅
   */
  const formatPersonality = () => {
    const { personality } = character;
    const traits = personality.traits || [];
    
    if (traits.length === 0) return '정보 없음';
    return traits.join(', ');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{character.name}</h2>
        <p className="text-gray-600">
          {character.background?.occupation || '직업 정보 없음'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 이미지 영역 */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isGeneratingImage ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                  <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-gray-600">캐리커쳐 생성 중...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <Image
                src={generatedImage}
                alt={`${character.name}의 캐리커쳐`}
                fill
                className="object-cover"
                onError={() => setImageError('이미지를 불러올 수 없습니다.')}
              />
            ) : imageError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                <div className="text-center space-y-2">
                  <User className="w-12 h-12 text-red-400 mx-auto" />
                  <p className="text-sm text-red-600">{imageError}</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* 이미지 재생성 버튼 */}
          <div className="flex space-x-2">
            <button
              onClick={() => generateCharacterImage('caricature')}
              disabled={isGeneratingImage}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
              <span className="text-sm">재생성</span>
            </button>
            
            <button
              onClick={() => generateCharacterImage('cartoon')}
              disabled={isGeneratingImage}
              className="flex items-center justify-center px-3 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <User className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-800">기본 정보</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">외모:</span>
                <span className="ml-2 text-gray-800">{formatAppearance()}</span>
              </div>
              {character.appearance.hairColor && (
                <div>
                  <span className="font-medium text-gray-600">머리:</span>
                  <span className="ml-2 text-gray-800">
                    {character.appearance.hairColor} {character.appearance.hairStyle || ''}
                  </span>
                </div>
              )}
              {character.appearance.eyeColor && (
                <div>
                  <span className="font-medium text-gray-600">눈:</span>
                  <span className="ml-2 text-gray-800">{character.appearance.eyeColor}</span>
                </div>
              )}
            </div>
          </div>

          {/* 성격 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-800">성격</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">특성:</span>
                <span className="ml-2 text-gray-800">{formatPersonality()}</span>
              </div>
              {character.personality.temperament && (
                <div>
                  <span className="font-medium text-gray-600">기질:</span>
                  <span className="ml-2 text-gray-800">{character.personality.temperament}</span>
                </div>
              )}
              {character.personality.speechPattern && (
                <div>
                  <span className="font-medium text-gray-600">말투:</span>
                  <span className="ml-2 text-gray-800">{character.personality.speechPattern}</span>
                </div>
              )}
            </div>
          </div>

          {/* 배경 정보 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-gray-800">배경</h3>
            </div>
            <div className="space-y-2 text-sm">
              {character.background?.occupation && (
                <div>
                  <span className="font-medium text-gray-600">직업:</span>
                  <span className="ml-2 text-gray-800">{character.background.occupation}</span>
                </div>
              )}
              {character.background?.education && (
                <div>
                  <span className="font-medium text-gray-600">학력:</span>
                  <span className="ml-2 text-gray-800">{character.background.education}</span>
                </div>
              )}
              {character.background?.hometown && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-500 mr-1" />
                  <span className="font-medium text-gray-600">고향:</span>
                  <span className="ml-2 text-gray-800">{character.background.hometown}</span>
                </div>
              )}
              {character.background?.interests && character.background.interests.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">관심사:</span>
                  <span className="ml-2 text-gray-800">{character.background.interests.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDisplay;
