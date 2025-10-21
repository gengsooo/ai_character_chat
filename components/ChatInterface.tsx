'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { CharacterInfo, ChatMessage } from '@/types/character';

interface ChatInterfaceProps {
  character: CharacterInfo;
  imageUrl?: string; // 생성된 캐릭터 이미지 URL
}

/**
 * 인물과의 채팅 인터페이스 컴포넌트
 */
const ChatInterface = ({ character, imageUrl }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * 메시지 목록이 업데이트될 때 스크롤을 맨 아래로 이동
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * 컴포넌트 마운트 시 환영 메시지 추가
   */
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: `안녕하세요! 저는 ${character.name}입니다. 무엇이든 물어보세요!`,
      timestamp: new Date(),
      characterId: character.id,
    };
    setMessages([welcomeMessage]);
  }, [character]);

  /**
   * 스크롤을 맨 아래로 이동
   */
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  /**
   * 메시지 전송 처리
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      characterId: character.id,
    };

    // 사용자 메시지 추가
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterInfo: character,
          message: userMessage.content,
          chatHistory: messages,
        }),
      });

      const result = await response.json();

      if (result.success && result.assistantMessage) {
        // AI 응답 메시지 추가
        setMessages(prev => [...prev, result.assistantMessage]);
      } else {
        throw new Error(result.error || '응답을 받을 수 없습니다.');
      }

    } catch (error) {
      console.error('채팅 오류:', error);
      
      // 오류 메시지 추가
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: '죄송합니다. 지금은 응답할 수 없습니다. 잠시 후 다시 시도해주세요.',
        timestamp: new Date(),
        characterId: character.id,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  /**
   * Enter 키 처리
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * 메시지 시간 포맷팅
   */
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 메시지 렌더링
   */
  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
      >
        {/* 아바타 */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary-500' : 'bg-secondary-500'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* 메시지 내용 */}
        <div className={`flex-1 max-w-xs sm:max-w-sm md:max-w-md ${isUser ? 'text-right' : ''}`}>
          <div className={`inline-block px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-primary-500 text-white rounded-br-sm' 
              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <p className="text-xs text-gray-500 mt-1 px-1">
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-96 max-w-2xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200">
        {/* 캐릭터 이미지 또는 기본 아바타 */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={character.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>';
                }
              }}
            />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>
         {/* 캐릭터 정보 */}
         <div>
          <h3 className="font-semibold text-gray-800">{character.name}</h3>
          <p className="text-sm text-gray-500">
            {character.background?.occupation || 'AI 어시스턴트'}
          </p>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg rounded-bl-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">답변을 생각하고 있어요...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${character.name}에게 메시지를 보내세요...`}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* 입력 가이드 */}
        <p className="text-xs text-gray-400 mt-2">
          Enter로 전송, Shift+Enter로 줄바꿈
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;

/**
 * 메시지 ID 생성 함수
 */
function generateMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
