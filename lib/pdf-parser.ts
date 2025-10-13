import pdf from 'pdf-parse';
import { CharacterInfo } from '@/types/character';

/**
 * PDF 파일에서 텍스트를 추출하는 함수
 * @param buffer PDF 파일의 버퍼 데이터
 * @returns 추출된 텍스트
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF 텍스트 추출 오류:', error);
    throw new Error('PDF 파일을 읽을 수 없습니다.');
  }
}

/**
 * 추출된 텍스트에서 인물 정보를 파싱하는 함수
 * 이 함수는 LLM을 사용하여 구조화된 데이터로 변환합니다.
 * @param text PDF에서 추출된 원본 텍스트
 * @returns 구조화된 인물 정보
 */
export function parseCharacterInfoFromText(text: string): Partial<CharacterInfo> {
  // 기본적인 키워드 기반 파싱 (LLM 호출 전 전처리)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // 이름 추출 시도
  const namePatterns = [
    /이름[:\s]*([가-힣a-zA-Z\s]+)/,
    /성명[:\s]*([가-힣a-zA-Z\s]+)/,
    /Name[:\s]*([a-zA-Z\s]+)/i
  ];
  
  let name = '';
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      name = match[1].trim();
      break;
    }
  }

  // 나이 추출 시도
  const agePatterns = [
    /나이[:\s]*(\d+)/,
    /Age[:\s]*(\d+)/i,
    /(\d+)세/
  ];
  
  let age = '';
  for (const pattern of agePatterns) {
    const match = text.match(pattern);
    if (match) {
      age = match[1] + '세';
      break;
    }
  }

  // 직업 추출 시도
  const occupationPatterns = [
    /직업[:\s]*([가-힣a-zA-Z\s]+)/,
    /직무[:\s]*([가-힣a-zA-Z\s]+)/,
    /Occupation[:\s]*([a-zA-Z\s]+)/i,
    /Job[:\s]*([a-zA-Z\s]+)/i
  ];
  
  let occupation = '';
  for (const pattern of occupationPatterns) {
    const match = text.match(pattern);
    if (match) {
      occupation = match[1].trim();
      break;
    }
  }

  return {
    id: generateId(),
    name: name || '알 수 없음',
    appearance: {
      age: age || undefined,
    },
    personality: {
      traits: [],
    },
    background: {
      occupation: occupation || undefined,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * 고유 ID 생성 함수
 * @returns 고유 문자열 ID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
