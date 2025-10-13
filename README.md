# 🤖 AI 인물 챗봇 서비스

PDF에서 인물 정보를 추출하여 캐리커쳐를 생성하고, 해당 인물과 대화할 수 있는 AI 챗봇 서비스입니다.

## ✨ 주요 기능

- **📄 PDF 분석**: LangChain + Llama를 사용하여 PDF에서 인물 정보 자동 추출
- **🎨 캐리커쳐 생성**: Stable Diffusion을 활용한 개성 있는 캐리커쳐 이미지 생성
- **💬 자연스러운 대화**: 인물의 성격과 배경에 맞는 맞춤형 AI 대화
- **⚡ 실시간 처리**: Next.js 기반의 빠르고 반응성 좋은 사용자 경험

## 🏗️ 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 유틸리티 기반 스타일링
- **Framer Motion**: 부드러운 애니메이션

### Backend
- **Next.js API Routes**: 서버리스 API
- **LangChain**: LLM 통합 및 체인 관리
- **PDF-Parse**: PDF 텍스트 추출

### AI Models
- **Llama 2**: 오픈소스 LLM (Ollama 통해 로컬 실행)
- **Stable Diffusion**: 이미지 생성 (Replicate API 또는 로컬)

## 🚀 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 의존성 설치
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 `.env.local`로 복사하고 API 키를 설정하세요:

```bash
cp .env.local.example .env.local
```

```env
# 필수: Ollama 설정 (Llama 모델 로컬 실행)
OLLAMA_BASE_URL=http://localhost:11434

# 선택: Replicate API (이미지 생성)
REPLICATE_API_TOKEN=your_replicate_api_token_here

# 선택: OpenAI API (Llama 대신 사용 가능)
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Ollama 설치 및 Llama 모델 다운로드

```bash
# Ollama 설치 (macOS)
brew install ollama

# Ollama 서비스 시작
ollama serve

# Llama 2 모델 다운로드 (새 터미널에서)
ollama pull llama2
# 또는 더 작은 모델
ollama pull llama2:7b
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📋 사용 방법

### 1단계: PDF 업로드
- 인물의 외모, 성격, 직업 등이 기술된 PDF 파일을 업로드합니다
- 지원 형식: PDF (최대 10MB)

### 2단계: 인물 정보 확인 및 이미지 생성
- AI가 추출한 인물 정보를 확인합니다
- 자동으로 캐리커쳐 이미지가 생성됩니다
- 원하지 않는 경우 이미지를 재생성할 수 있습니다

### 3단계: 대화 시작
- 생성된 인물과 자연스러운 대화를 나눕니다
- 인물의 성격과 배경에 맞는 응답을 받을 수 있습니다

## 🔧 API 엔드포인트

### PDF 업로드 및 분석
```
POST /api/upload-pdf
Content-Type: multipart/form-data

Body: { pdf: File }
```

### 이미지 생성
```
POST /api/generate-image
Content-Type: application/json

Body: {
  characterInfo: CharacterInfo,
  style?: 'caricature' | 'cartoon' | 'realistic',
  mood?: 'happy' | 'serious' | 'friendly' | 'professional'
}
```

### 채팅
```
POST /api/chat
Content-Type: application/json

Body: {
  characterInfo: CharacterInfo,
  message: string,
  chatHistory?: ChatMessage[]
}
```

## 🎯 PDF 작성 팁

더 나은 결과를 위해 PDF에 다음 정보를 포함하세요:

### 외모 정보
- 나이, 성별, 키, 체형
- 머리색, 머리스타일
- 눈색, 얼굴 특징
- 평상시 옷차림, 액세서리

### 성격 정보
- 주요 성격 특성 (외향적/내향적, 활발함/차분함 등)
- 말투와 어조
- 특별한 습관이나 버릇

### 배경 정보
- 직업과 전문 분야
- 학력과 경력
- 취미와 관심사
- 가족 관계

## 🛠️ 개발 환경 설정

### 로컬 Stable Diffusion (선택사항)
Replicate API 대신 로컬에서 이미지 생성을 원한다면:

```bash
# Automatic1111 WebUI 설치 및 실행
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
./webui.sh --api
```

### 데이터베이스 (선택사항)
채팅 기록 저장을 원한다면 데이터베이스를 연결할 수 있습니다:
- PostgreSQL
- MongoDB
- Supabase

## 🚨 문제 해결

### Ollama 연결 오류
```bash
# Ollama 서비스 상태 확인
ollama list

# 서비스 재시작
ollama serve
```

### 이미지 생성 실패
- Replicate API 토큰 확인
- 로컬 Stable Diffusion 서버 상태 확인
- 플레이스홀더 이미지가 표시되는 것은 정상입니다

### PDF 분석 오류
- PDF 파일이 텍스트를 포함하는지 확인
- 파일 크기가 10MB 이하인지 확인
- 한글 PDF의 경우 인코딩 문제가 있을 수 있습니다

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있거나 제안사항이 있다면 이슈를 생성해주세요.

---

**주의사항**: 이 서비스는 개발 목적으로 제작되었으며, 개인정보는 서버에 저장되지 않습니다. 모든 처리는 세션 기반으로 이루어집니다.
