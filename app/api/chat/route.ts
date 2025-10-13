import { NextRequest, NextResponse } from 'next/server';
import { LLMService } from '@/lib/llm-service';
import { CharacterInfo, ChatMessage } from '@/types/character';

/**
 * 인물과의 채팅 API
 * POST /api/chat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterInfo, message, chatHistory = [], originalText = '' } = body;

    if (!characterInfo) {
      return NextResponse.json(
        { success: false, error: '인물 정보가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '메시지가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('채팅 요청:', { 
      character: characterInfo.name, 
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      historyLength: chatHistory.length 
    });

    const llmService = new LLMService();

    // 대화 히스토리 포맷팅
    const formattedHistory = chatHistory.map((msg: ChatMessage) => 
      `${msg.role === 'user' ? '사용자' : characterInfo.name}: ${msg.content}`
    ).join('\n');

    // 채팅 응답 생성 (개선된 버전)
    const response = await llmService.generateChatResponse(
      characterInfo, 
      message, 
      originalText,
      formattedHistory
    );

    // 새로운 메시지들 생성
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'user',
      content: message,
      timestamp: new Date(),
      characterId: characterInfo.id,
    };

    const assistantMessage: ChatMessage = {
      id: generateMessageId(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      characterId: characterInfo.id,
    };

    console.log('생성된 응답:', response.substring(0, 100) + (response.length > 100 ? '...' : ''));

    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage,
      response,
    });

  } catch (error) {
    console.error('채팅 처리 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '채팅 처리 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 채팅 기록 조회 API
 * GET /api/chat?characterId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return NextResponse.json(
        { success: false, error: '인물 ID가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 실제 구현에서는 데이터베이스에서 채팅 기록을 조회
    // 현재는 빈 배열 반환 (메모리 기반)
    const chatHistory: ChatMessage[] = [];

    return NextResponse.json({
      success: true,
      chatHistory,
      characterId,
    });

  } catch (error) {
    console.error('채팅 기록 조회 오류:', error);
    
    return NextResponse.json(
      { success: false, error: '채팅 기록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 메시지 ID 생성 함수
 */
function generateMessageId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
