import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { LLMService } from '@/lib/llm-service';
import { PDFAnalysisResult } from '@/types/character';

/**
 * PDF 업로드 및 인물 정보 추출 API
 * POST /api/upload-pdf
 */
export async function POST(request: NextRequest) {
  try {
    // FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'PDF 파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 타입 검증
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB 이하여야 합니다.' },
        { status: 400 }
      );
    }

    console.log('PDF 파일 처리 시작:', file.name, file.size, 'bytes');

    // PDF에서 텍스트 추출
    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractTextFromPDF(buffer);

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'PDF에서 텍스트를 추출할 수 없습니다.' },
        { status: 400 }
      );
    }

    console.log('추출된 텍스트 길이:', extractedText.length);

    // LLM을 사용하여 구조화된 인물 정보 추출
    const llmService = new LLMService();
    const characterInfo = await llmService.extractCharacterInfo(extractedText);

    console.log('추출된 인물 정보:', characterInfo);

    const result: PDFAnalysisResult = {
      success: true,
      characterInfo: characterInfo as any, // 타입 캐스팅 (부분 정보를 전체 정보로)
      rawText: extractedText.substring(0, 1000), // 처음 1000자만 반환
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('PDF 처리 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'PDF 처리 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 업로드 가능한 파일 정보 조회 API
 * GET /api/upload-pdf
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: '10MB',
    allowedTypes: ['application/pdf'],
    description: 'PDF 파일에서 인물 정보를 추출합니다.',
  });
}
