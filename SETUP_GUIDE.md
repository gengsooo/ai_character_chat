# 🚀 AI 챗봇 설정 가이드

## 📋 모델 선택 가이드

### 🎯 **권장: OpenAI API** (가볍고 빠름)
- **비용**: GPT-3.5-turbo 기준 $0.002/1K 토큰 (매우 저렴)
- **장점**: PC 리소스 사용 안함, 빠른 응답, 높은 품질
- **단점**: 인터넷 연결 필요, 소량의 비용 발생

### 🖥️ **대안: 로컬 Llama** (무료, 하지만 리소스 필요)
- **비용**: 완전 무료
- **장점**: 데이터 프라이버시, 오프라인 사용 가능
- **단점**: RAM 4-8GB 사용, 초기 다운로드 4GB+, 느린 응답

---

## 🔧 설정 방법

### **방법 1: OpenAI API 사용 (권장)**

#### 1️⃣ OpenAI API 키 발급
1. https://platform.openai.com 회원가입
2. **API keys** 메뉴에서 새 키 생성
3. **Billing** 설정 (최소 $5 충전 권장)

#### 2️⃣ 환경 변수 설정
`.env.local` 파일을 열고 다음과 같이 설정:

```env
# ✅ OpenAI API 사용 (권장)
OPENAI_API_KEY=sk-proj-abcd1234...your_actual_key_here

# ❌ Ollama는 주석 처리
# OLLAMA_BASE_URL=http://localhost:11434

# 🎨 이미지 생성 (선택사항)
REPLICATE_API_TOKEN=r8_your_token_here
```

#### 3️⃣ 비용 예상
- **PDF 분석**: 약 $0.01-0.05 per PDF
- **채팅 메시지**: 약 $0.001-0.01 per message
- **월 100회 사용시**: 약 $1-5

---

### **방법 2: 로컬 Llama 사용 (무료)**

#### 1️⃣ Ollama 설치
```bash
# macOS
brew install ollama

# 또는 직접 다운로드
curl -fsSL https://ollama.ai/install.sh | sh
```

#### 2️⃣ Llama 모델 다운로드
```bash
# Ollama 서비스 시작
ollama serve

# 새 터미널에서 모델 다운로드
ollama pull llama2:7b    # 4GB, 권장
# 또는
ollama pull llama2:13b   # 7GB, 더 좋은 품질
```

#### 3️⃣ 환경 변수 설정
```env
# ❌ OpenAI는 주석 처리
# OPENAI_API_KEY=sk-your_key_here

# ✅ Ollama 로컬 사용
OLLAMA_BASE_URL=http://localhost:11434

# 🎨 이미지 생성 (선택사항)
REPLICATE_API_TOKEN=r8_your_token_here
```

#### 4️⃣ 시스템 요구사항
- **RAM**: 최소 8GB (16GB 권장)
- **저장공간**: 4-7GB (모델 크기)
- **CPU**: 멀티코어 권장

---

## 🎨 이미지 생성 설정 (선택사항)

### **Replicate API** (권장)
1. https://replicate.com 가입
2. **Account Settings** → **API tokens**
3. 새 토큰 생성 후 `.env.local`에 추가:
   ```env
   REPLICATE_API_TOKEN=r8_abcd1234...your_token_here
   ```
4. **비용**: 이미지당 약 $0.0023

### **이미지 생성 없이 사용**
```env
# 이미지 생성 비활성화 (플레이스홀더 이미지 사용)
# REPLICATE_API_TOKEN=
```

---

## ✅ 설정 확인

### 1️⃣ 서버 재시작
```bash
# 개발 서버 재시작
npm run dev
```

### 2️⃣ 콘솔 로그 확인
브라우저 개발자 도구에서 다음 메시지 확인:
- `🤖 Using OpenAI API (gpt-3.5-turbo)` 또는
- `🦙 Using local Llama via Ollama`

### 3️⃣ 테스트
1. PDF 파일 업로드
2. 인물 정보 추출 확인
3. 이미지 생성 확인
4. 채팅 테스트

---

## 🚨 문제 해결

### OpenAI API 오류
```
Error: OpenAI API key not found
```
**해결**: `.env.local`에서 `OPENAI_API_KEY` 확인

### Ollama 연결 오류
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```
**해결**:
```bash
ollama serve  # 서비스 시작
ollama list   # 모델 확인
```

### 이미지 생성 실패
- Replicate API 토큰 확인
- 플레이스홀더 이미지가 표시되는 것은 정상

---

## 💡 추천 설정

### **개발/테스트용**
```env
OPENAI_API_KEY=sk-your_key_here
# OLLAMA_BASE_URL=http://localhost:11434
# REPLICATE_API_TOKEN=r8_your_token_here
```

### **프로덕션용**
```env
OPENAI_API_KEY=sk-your_production_key_here
REPLICATE_API_TOKEN=r8_your_production_token_here
```

### **완전 무료 (로컬 전용)**
```env
# OPENAI_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
# REPLICATE_API_TOKEN=
```

---

## 📞 지원

설정 중 문제가 있다면:
1. 콘솔 로그 확인
2. `.env.local` 파일 형식 확인
3. API 키 유효성 확인
4. 서비스 재시작
