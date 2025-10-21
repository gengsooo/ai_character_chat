import Replicate from 'replicate';
import { CharacterInfo, ImageGenerationRequest, ImageGenerationResult } from '@/types/character';

/**
 * 이미지 생성 서비스 클래스
 * Stable Diffusion을 사용하여 캐리커쳐 이미지 생성
 */
export class ImageGeneratorService {
  private replicate: Replicate;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN || '',
    });
  }

  /**
   * 인물 정보를 바탕으로 캐리커쳐 이미지 생성
   * @param request 이미지 생성 요청 정보
   * @returns 생성된 이미지 URL과 결과
   */
  async generateCharacterImage(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      const prompt = this.buildImagePrompt(request);
      
      // 고품질 SDXL 모델 사용
      const output = await this.replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: prompt,
            negative_prompt: "nsfw, inappropriate, adult, sexual, nude, realistic, ugly, deformed, low quality, blurry, bad anatomy, worst quality, jpeg artifacts",
            width: 1024,
            height: 1024,
            num_inference_steps: 50,
            guidance_scale: 8.0,
            scheduler: "K_EULER",
            seed: Math.floor(Math.random() * 1000000)
          }
        }
      );

      // 결과가 배열인 경우 첫 번째 이미지 사용
      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (typeof imageUrl === 'string') {
        return {
          success: true,
          imageUrl,
          prompt,
        };
      } else {
        throw new Error('이미지 URL을 받을 수 없습니다.');
      }

    } catch (error) {
      console.error('이미지 생성 오류:', error);
      
      // NSFW 오류인 경우 더 안전한 모델로 재시도
      if (error instanceof Error && error.message.includes('NSFW')) {
        try {
          const safePrompt = 'high quality cartoon character, professional digital art, clean style, friendly face, masterpiece';
          
          const safeOutput = await this.replicate.run(
            "black-forest-labs/flux-schnell:bf2f2e683d03a9549f484a37a0df1581072b17c0b0db65c2b1526a3557ddbaf9",
            {
              input: {
                prompt: safePrompt,
                width: 1024,
                height: 1024,
                num_outputs: 1,
                num_inference_steps: 8,
                guidance_scale: 3.5,
                seed: Math.floor(Math.random() * 1000000)
              }
            }
          );
          
          const safeImageUrl = Array.isArray(safeOutput) ? safeOutput[0] : safeOutput;
          if (typeof safeImageUrl === 'string') {
            return {
              success: true,
              imageUrl: safeImageUrl,
              prompt: safePrompt,
            };
          }
        } catch (safeError) {
          console.error('안전 모델도 실패:', safeError);
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : '이미지 생성에 실패했습니다.',
      };
    }
  }

  /**
   * 대체 이미지 생성 (로컬 Stable Diffusion 사용)
   * Replicate API가 없을 경우 사용할 수 있는 대체 방법
   */
  async generateImageWithLocalSD(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    try {
      const prompt = this.buildImagePrompt(request);
      
      // 로컬 Stable Diffusion API 호출 (예: Automatic1111 WebUI)
      const response = await fetch('http://localhost:7860/sdapi/v1/txt2img', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: "ugly, deformed, nsfw, low quality, blurry, distorted",
          width: 512,
          height: 512,
          steps: 30,
          cfg_scale: 7,
          sampler_name: "DPM++ 2M Karras",
          batch_size: 1,
          n_iter: 1,
        }),
      });

      if (!response.ok) {
        throw new Error('로컬 Stable Diffusion API 호출 실패');
      }

      const result = await response.json();
      
      // Base64 이미지를 데이터 URL로 변환
      const imageUrl = `data:image/png;base64,${result.images[0]}`;

      return {
        success: true,
        imageUrl,
        prompt,
      };

    } catch (error) {
      console.error('로컬 이미지 생성 오류:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '로컬 이미지 생성에 실패했습니다.',
      };
    }
  }

  /**
   * 인물 정보를 바탕으로 만화 캐릭터 스타일 프롬프트 구성
   * @param request 이미지 생성 요청
   * @returns 완성된 프롬프트
   */
  private buildImagePrompt(request: ImageGenerationRequest): string {
    const { characterInfo, style = 'cartoon', mood = 'friendly' } = request;
    const { appearance } = characterInfo;

    // 성별을 먼저 명확히 지정
    let genderPrompt = '';
    if (appearance.gender) {
      if (appearance.gender.includes('남') || appearance.gender.toLowerCase().includes('male')) {
        genderPrompt = 'handsome male man, masculine features, ';
      } else if (appearance.gender.includes('여') || appearance.gender.toLowerCase().includes('female')) {
        genderPrompt = 'beautiful female woman, feminine features, ';
      }
    }

    // 고품질 캐릭터 아바타 프롬프트 (성별을 맨 앞에 배치)
    let prompt = `${genderPrompt}high quality cartoon character portrait, professional digital art, clean vector style, detailed illustration`;

    // 나이대 추가
    if (appearance.age) {
      const ageNum = parseInt(appearance.age);
      if (ageNum < 20) {
        prompt += ', young person';
      } else if (ageNum < 40) {
        prompt += ', adult person';
      } else if (ageNum < 60) {
        prompt += ', middle-aged person';
      } else {
        prompt += ', elderly person';
      }
    }

    // 머리 색깔 추가 (안전한 범위내에서)
    if (appearance.hairColor && appearance.hairColor !== '알 수 없음') {
      if (appearance.hairColor.includes('금')) {
        prompt += ', golden blonde hair';
      } else if (appearance.hairColor.includes('갈')) {
        prompt += ', warm brown hair';
      } else if (appearance.hairColor.includes('검')) {
        prompt += ', sleek black hair';
      } else if (appearance.hairColor.includes('흰') || appearance.hairColor.includes('백')) {
        prompt += ', silver white hair';
      }
    }

    // 머리 스타일 추가
    if (appearance.hairStyle && appearance.hairStyle !== '알 수 없음') {
      if (appearance.hairStyle.includes('짧')) {
        prompt += ', short hair';
      } else if (appearance.hairStyle.includes('긴')) {
        prompt += ', long hair';
      } else if (appearance.hairStyle.includes('곱슬')) {
        prompt += ', curly hair';
      }
    }

    // 피부톤 추가
    if (appearance.skinTone && appearance.skinTone !== '알 수 없음') {
      if (appearance.skinTone.includes('밝은') || appearance.skinTone.includes('하얀') || appearance.skinTone.toLowerCase().includes('fair') || appearance.skinTone.toLowerCase().includes('pale')) {
        prompt += ', fair skin tone, light complexion';
      } else if (appearance.skinTone.includes('어두운') || appearance.skinTone.includes('검은') || appearance.skinTone.toLowerCase().includes('dark')) {
        prompt += ', dark skin tone, rich complexion';
      } else if (appearance.skinTone.includes('태닝') || appearance.skinTone.includes('그을린') || appearance.skinTone.toLowerCase().includes('tan')) {
        prompt += ', tanned skin, sun-kissed complexion';
      } else if (appearance.skinTone.includes('중간') || appearance.skinTone.includes('보통') || appearance.skinTone.toLowerCase().includes('medium')) {
        prompt += ', medium skin tone, natural complexion';
      } else if (appearance.skinTone.includes('황') || appearance.skinTone.toLowerCase().includes('olive')) {
        prompt += ', olive skin tone, warm complexion';
      }
    }

    // 피부 세부사항 추가
    if (appearance.skinDetails && appearance.skinDetails !== '알 수 없음') {
      const skinDetailsLower = appearance.skinDetails.toLowerCase();
      
      // 여드름
      if (appearance.skinDetails.includes('여드름') || skinDetailsLower.includes('acne') || skinDetailsLower.includes('pimple')) {
        prompt += ', skin with acne, blemished skin';
      }
      
      // 주름
      if (appearance.skinDetails.includes('주름') || skinDetailsLower.includes('wrinkle') || skinDetailsLower.includes('aged')) {
        prompt += ', wrinkled skin, aged skin texture';
      }
      
      // 잡티/흉터
      if (appearance.skinDetails.includes('잡티') || appearance.skinDetails.includes('흉터') || skinDetailsLower.includes('scar') || skinDetailsLower.includes('spot')) {
        prompt += ', skin with spots, visible skin marks';
      }
      
      // 매끄러운 피부
      if (appearance.skinDetails.includes('매끄') || appearance.skinDetails.includes('깨끗') || skinDetailsLower.includes('smooth') || skinDetailsLower.includes('clear')) {
        prompt += ', smooth clear skin, flawless complexion';
      }
      
      // 거친 피부
      if (appearance.skinDetails.includes('거친') || appearance.skinDetails.includes('건조') || skinDetailsLower.includes('rough') || skinDetailsLower.includes('dry')) {
        prompt += ', rough skin texture, dry skin';
      }
    }

    // 고품질 스타일 마무리
    prompt += ', expressive eyes, friendly smile, masterpiece, best quality, sharp focus, vibrant colors, clean white background';

    return prompt;
  }

  /**
   * 기본 플레이스홀더 이미지 URL 반환
   * API 키가 없거나 생성 실패시 사용
   */
  getPlaceholderImageUrl(characterInfo: CharacterInfo): string {
    // 간단한 아바타 생성 서비스 사용 (무료)
    const name = encodeURIComponent(characterInfo.name);
    return `https://ui-avatars.com/api/?name=${name}&size=512&background=random&color=fff&format=png`;
  }
}
