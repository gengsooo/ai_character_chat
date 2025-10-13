// 인물 정보 타입 정의
export interface CharacterInfo {
  id: string;
  name: string;
  imageUrl?: string; // 생성된 캐릭터 이미지 URL
  appearance: {
    age?: string;
    gender?: string;
    height?: string;
    build?: string;
    hairColor?: string;
    hairStyle?: string;
    eyeColor?: string;
    facialFeatures?: string;
    clothing?: string;
    accessories?: string;
  };
  personality: {
    traits: string[];
    temperament?: string;
    habits?: string[];
    speechPattern?: string;
  };
  background: {
    occupation?: string;
    education?: string;
    family?: string;
    hometown?: string;
    interests?: string[];
  };
  relationships?: {
    family?: string[];
    friends?: string[];
    colleagues?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// 채팅 메시지 타입
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  characterId?: string;
}

// PDF 분석 결과 타입
export interface PDFAnalysisResult {
  success: boolean;
  characterInfo?: CharacterInfo;
  error?: string;
  rawText?: string;
}

// 이미지 생성 요청 타입
export interface ImageGenerationRequest {
  characterInfo: CharacterInfo;
  style?: 'caricature' | 'cartoon' | 'realistic';
  mood?: 'happy' | 'serious' | 'friendly' | 'professional';
}

// 이미지 생성 결과 타입
export interface ImageGenerationResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  prompt?: string;
}
