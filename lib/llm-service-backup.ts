import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { CharacterInfo, PartialCharacterInfo } from '@/types/character';

/**
 * LLM 서비스 클래스
 * OpenAI GPT 모델을 사용하여 텍스트 분석 및 대화 생성
 */
export class LLMService {
  private model: ChatOpenAI;
  private characterExtractionPrompt: PromptTemplate;
  private chatPrompt: PromptTemplate;
  private imagePromptTemplate: PromptTemplate;

  constructor() {
    // OpenAI 모델 초기화
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
    }

    this.model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    // 인물 정보 추출용 프롬프트
    this.characterExtractionPrompt = PromptTemplate.fromTemplate(`
다음 텍스트에서 인물의 정보를 추출하여 JSON 형태로 정리해주세요.
추출할 정보:
1. 이름 (name)
2. 외모 정보 (appearance): 나이, 성별, 키, 체형, 머리색, 머리스타일, 눈색, 얼굴 특징, 옷차림, 액세서리
3. 성격 (personality): 성격 특성, 기질, 습관, 말투
4. 배경 정보 (background): 직업, 학력, 가족, 고향, 관심사

텍스트: {text}

다음 JSON 형식으로 응답해주세요:
{{
  "name": "인물 이름",
  "appearance": {{
    "age": "나이",
    "gender": "성별",
    "height": "키",
    "build": "체형",
    "hairColor": "머리색",
    "hairStyle": "머리스타일",
    "eyeColor": "눈색",
    "facialFeatures": "얼굴 특징",
    "clothing": "옷차림",
    "accessories": "액세서리"
  }},
  "personality": {{
    "traits": ["성격특성1", "성격특성2"],
    "temperament": "기질",
    "habits": ["습관1", "습관2"],
    "speechPattern": "말투"
  }},
  "background": {{
    "occupation": "직업",
    "education": "학력",
    "family": "가족",
    "hometown": "고향",
    "interests": ["관심사1", "관심사2"]
  }}
}}
`);

    // 채팅봇 대화용 프롬프트 (개선된 버전)
    this.chatPrompt = PromptTemplate.fromTemplate(`
당신은 다음 인물의 역할을 완벽하게 연기하는 AI입니다.

=== 인물 기본 정보 ===
이름: {name}
외모: {appearance}
성격: {personality}
배경: {background}

=== 원본 문서 내용 ===
{originalText}

=== 대화 히스토리 ===
{chatHistory}

=== 연기 가이드라인 ===
1. 위 원본 문서에 나온 인물의 세부 정보를 바탕으로 대화하세요
2. 인물의 말투, 성격, 경험을 일관되게 유지하세요
3. 이전 대화 내용을 기억하고 연결성 있게 대화하세요
4. 인물의 지식 범위와 경험 내에서만 답변하세요
5. 자연스럽고 인간적인 대화를 유지하세요

사용자: {userMessage}

{name}: `);

    // 이미지 생성용 프롬프트
    this.imagePromptTemplate = PromptTemplate.fromTemplate(`
다음 인물 정보를 바탕으로 캐리커쳐 스타일의 이미지 생성 프롬프트를 만들어주세요:

인물 정보:
이름: {name}
외모: {appearance}
성격: {personality}
직업: {occupation}

캐리커쳐 스타일로, 친근하고 따뜻한 느낌의 일러스트레이션으로 생성해주세요.
영어로 상세한 프롬프트를 작성해주세요.
`);
  }

  /**
   * PDF 텍스트에서 구조화된 인물 정보 추출
   * @param text PDF에서 추출된 원본 텍스트
   * @returns 구조화된 인물 정보
   */
  async extractCharacterInfo(text: string): Promise<Partial<CharacterInfo>> {
    try {
      const chain = this.characterExtractionPrompt.pipe(this.model).pipe(new StringOutputParser());
      const result = await chain.invoke({ text });
      
      // JSON 파싱 시도
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            ...parsed,
            id: this.generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
      }

      // JSON 파싱 실패시 기본값 반환
      return {
        id: this.generateId(),
        name: '추출된 인물',
        appearance: {},
        personality: { traits: [] },
        background: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error('인물 정보 추출 오류:', error);
      throw new Error('인물 정보를 추출할 수 없습니다.');
    }
  }

  /**
   * 캐릭터와의 채팅 응답 생성 (개선된 버전)
   * @param character 캐릭터 정보
   * @param userMessage 사용자 메시지
   * @param originalText 원본 PDF 텍스트
   * @param chatHistory 대화 히스토리
   * @returns 캐릭터 응답
   */
  async generateChatResponse(
    character: CharacterInfo, 
    userMessage: string, 
    originalText: string = '',
    chatHistory: string = ''
  ): Promise<string> {
    try {
      const chain = this.chatPrompt.pipe(this.model).pipe(new StringOutputParser());
      
      const response = await chain.invoke({
        name: character.name,
        appearance: this.formatAppearance(character.appearance),
        personality: this.formatPersonality(character.personality),
        background: this.formatBackground(character.background),
        originalText: originalText.substring(0, 2000), // 처음 2000자만 사용
        chatHistory: chatHistory,
        userMessage,
      });

      return response.trim();
    } catch (error) {
      console.error('채팅 응답 생성 오류:', error);
      return '죄송합니다. 지금은 응답할 수 없습니다.';
    }
  }

  /**
   * 이미지 생성용 프롬프트 생성
   * @param character 인물 정보
   * @returns 이미지 생성 프롬프트
   */
  async generateImagePrompt(character: CharacterInfo): Promise<string> {
    try {
      const chain = this.imagePromptTemplate.pipe(this.model).pipe(new StringOutputParser());
      
      const prompt = await chain.invoke({
        name: character.name,
        appearance: this.formatAppearance(character.appearance),
        personality: this.formatPersonality(character.personality),
        occupation: character.background?.occupation || '일반인',
      });

      return prompt.trim();
    } catch (error) {
      console.error('이미지 프롬프트 생성 오류:', error);
      return `caricature style portrait of a person, friendly and warm illustration, cartoon style, professional quality`;
    }
  }

  /**
   * 외모 정보 포맷팅
   */
  private formatAppearance(appearance: any): string {
    if (!appearance) return '일반적인 외모';
    
    const parts = [];
    if (appearance.age) parts.push(`나이: ${appearance.age}`);
    if (appearance.gender) parts.push(`성별: ${appearance.gender}`);
    if (appearance.height) parts.push(`키: ${appearance.height}`);
    if (appearance.build) parts.push(`체형: ${appearance.build}`);
    if (appearance.hairColor) parts.push(`머리색: ${appearance.hairColor}`);
    if (appearance.hairStyle) parts.push(`머리스타일: ${appearance.hairStyle}`);
    if (appearance.eyeColor) parts.push(`눈색: ${appearance.eyeColor}`);
    if (appearance.facialFeatures) parts.push(`얼굴 특징: ${appearance.facialFeatures}`);
    if (appearance.clothing) parts.push(`옷차림: ${appearance.clothing}`);
    if (appearance.accessories) parts.push(`액세서리: ${appearance.accessories}`);
    
    return parts.length > 0 ? parts.join(', ') : '일반적인 외모';
  }

  /**
   * 성격 정보 포맷팅
   */
  private formatPersonality(personality: any): string {
    if (!personality) return '친근한 성격';
    
    const parts = [];
    if (personality.traits && Array.isArray(personality.traits)) {
      parts.push(`성격: ${personality.traits.join(', ')}`);
    }
    if (personality.temperament) parts.push(`기질: ${personality.temperament}`);
    if (personality.habits && Array.isArray(personality.habits)) {
      parts.push(`습관: ${personality.habits.join(', ')}`);
    }
    if (personality.speechPattern) parts.push(`말투: ${personality.speechPattern}`);
    
    return parts.length > 0 ? parts.join(', ') : '친근한 성격';
  }

  /**
   * 배경 정보 포맷팅
   */
  private formatBackground(background: any): string {
    if (!background) return '일반적인 배경';
    
    const parts = [];
    if (background.occupation) parts.push(`직업: ${background.occupation}`);
    if (background.education) parts.push(`학력: ${background.education}`);
    if (background.family) parts.push(`가족: ${background.family}`);
    if (background.hometown) parts.push(`고향: ${background.hometown}`);
    if (background.interests && Array.isArray(background.interests)) {
      parts.push(`관심사: ${background.interests.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : '일반적인 배경';
  }

  /**
   * 고유 ID 생성
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
