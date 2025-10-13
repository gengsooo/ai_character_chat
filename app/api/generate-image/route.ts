import { NextRequest, NextResponse } from 'next/server';
import { ImageGeneratorService } from '@/lib/image-generator';
import { LLMService } from '@/lib/llm-service';
import { CharacterInfo, ImageGenerationRequest } from '@/types/character';

/**
 * 캐리커쳐 이미지 생성 API
 * POST /api/generate-image
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterInfo, style = 'caricature', mood = 'friendly' } = body;

    if (!characterInfo) {
      return NextResponse.json(
        { success: false, error: '인물 정보가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    console.log('이미지 생성 요청:', { characterInfo, style, mood });

    const imageGenerator = new ImageGeneratorService();
    const llmService = new LLMService();

    // LLM을 사용하여 더 정교한 이미지 프롬프트 생성
    let enhancedPrompt = '';
    try {
      enhancedPrompt = await llmService.generateImagePrompt(characterInfo);
      console.log('LLM 생성 프롬프트:', enhancedPrompt);
    } catch (error) {
      console.warn('LLM 프롬프트 생성 실패, 기본 프롬프트 사용:', error);
    }

    const imageRequest: ImageGenerationRequest = {
      characterInfo,
      style,
      mood,
    };

    // 이미지 생성 시도 (우선순위: Replicate API > 로컬 SD > 플레이스홀더)
    let result;
    
    // Replicate API 토큰이 유효한지 확인
    const hasValidReplicateToken = process.env.REPLICATE_API_TOKEN && 
      process.env.REPLICATE_API_TOKEN !== 'your_replicate_api_token_here' &&
      process.env.REPLICATE_API_TOKEN.startsWith('r8_');
    
    if (hasValidReplicateToken) {
      console.log('🎨 Replicate API로 이미지 생성 시도...');
      try {
        result = await imageGenerator.generateCharacterImage(imageRequest);
        if (!result.success) {
          throw new Error(result.error || 'Replicate API 실패');
        }
      } catch (replicateError) {
        console.warn('Replicate API 실패:', replicateError);
        result = null; // 다음 단계로 진행
      }
    }
    
    // Replicate 실패시 로컬 Stable Diffusion 시도
    if (!result) {
      console.log('🖥️ 로컬 Stable Diffusion 시도...');
      try {
        result = await imageGenerator.generateImageWithLocalSD(imageRequest);
        if (!result.success) {
          throw new Error(result.error || '로컬 SD 실패');
        }
      } catch (localError) {
        console.warn('로컬 Stable Diffusion 실패:', localError);
        result = null; // 플레이스홀더로 진행
      }
    }
    
    // 모든 이미지 생성 실패시 플레이스홀더 사용
    if (!result) {
      console.log('📷 플레이스홀더 이미지 사용');
      result = {
        success: true,
        imageUrl: imageGenerator.getPlaceholderImageUrl(characterInfo),
        prompt: '플레이스홀더 이미지 (이미지 생성 API 설정 필요)',
      };
    }

    console.log('이미지 생성 결과:', result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('이미지 생성 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '이미지 생성 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * 이미지 생성 설정 정보 조회 API
 * GET /api/generate-image
 */
export async function GET() {
  return NextResponse.json({
    availableStyles: ['caricature', 'cartoon', 'realistic'],
    availableMoods: ['happy', 'serious', 'friendly', 'professional'],
    description: '인물 정보를 바탕으로 캐리커쳐 이미지를 생성합니다.',
    requirements: {
      replicateApiToken: !!process.env.REPLICATE_API_TOKEN,
      localStableDiffusion: 'http://localhost:7860 에서 Automatic1111 WebUI 실행 필요',
    },
  });
}
