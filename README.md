# 정산결의서 시스템

정산결의서 작성 및 전자결재·송금 프로세스를 웹+모바일 혼합 환경에서 구현한 시스템입니다.

## 🚀 주요 기능

### 웹 애플리케이션 (PC)
- **직원**: 정산결의서 작성 및 제출
- **경리**: 송금 처리 및 기록 관리
- **관리자**: 전체 시스템 관리

### 모바일 애플리케이션 (Android)
- **대표/부대표**: 결재 승인/반려
- **푸시알림**: 실시간 알림 수신

## 🛠 기술 스택

### 웹 (Next.js)
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL (Prisma ORM)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Notifications**: Firebase Cloud Messaging

### 모바일 (React Native)
- **Framework**: React Native with Expo
- **UI**: React Native Paper
- **Navigation**: React Navigation
- **State Management**: React Query
- **Notifications**: Expo Notifications

## 📁 프로젝트 구조

```
settlement-approval-system/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드
│   ├── settlements/       # 정산결의서
│   ├── approvals/         # 결재 관리
│   ├── payments/          # 송금 처리
│   └── notifications/     # 알림
├── components/            # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── settlements/      # 정산결의서 관련
│   ├── approvals/        # 결재 관련
│   ├── payments/         # 송금 관련
│   ├── notifications/    # 알림 관련
│   └── files/            # 파일 관련
├── lib/                  # 유틸리티 및 설정
├── types/                # TypeScript 타입 정의
├── prisma/               # 데이터베이스 스키마
└── mobile/               # React Native 앱
    ├── src/
    │   ├── screens/      # 화면 컴포넌트
    │   ├── navigation/   # 네비게이션
    │   ├── contexts/     # React Context
    │   ├── services/     # API 서비스
    │   └── types/        # 타입 정의
    └── App.tsx
```

## 🚀 설치 및 실행

### 1. 환경 설정

```bash
# 환경 변수 설정
cp .env.example .env.local
```

`.env.local` 파일에 다음 정보를 입력하세요:

```env
# Supabase 설정
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase 설정 (푸시알림용)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# 데이터베이스 URL
DATABASE_URL=postgresql://username:password@localhost:5432/settlement_db

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 웹 애플리케이션 실행

```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

웹 애플리케이션이 `http://localhost:3000`에서 실행됩니다.

### 3. 모바일 애플리케이션 실행

```bash
# 모바일 디렉토리로 이동
cd mobile

# 의존성 설치
npm install

# Expo 개발 서버 실행
npx expo start
```

## 📱 사용자 권한

| 역할 | 웹 접근 | 모바일 접근 | 권한 |
|------|---------|-------------|------|
| 직원 | ✅ | ❌ | 정산결의서 작성/제출 |
| 대표 | ❌ | ✅ | 결재 승인/반려 |
| 부대표 | ❌ | ✅ | 결재 승인/반려 |
| 경리 | ✅ | ❌ | 송금 처리 |
| 관리자 | ✅ | ✅ | 모든 권한 |

## 🔄 워크플로우

1. **직원**이 PC에서 정산결의서 작성 및 제출
2. **대표/부대표**가 모바일 앱에서 푸시알림 수신
3. 모바일 앱에서 정산결의서 검토 후 승인/반려
4. 승인 시 **경리**에게 알림 전송
5. **경리**가 PC에서 송금 처리
6. 모든 과정이 데이터베이스에 기록됨

## 📊 데이터베이스 스키마

### 주요 테이블
- `users`: 사용자 정보
- `settlement_requests`: 정산결의서
- `settlement_items`: 정산 항목
- `approvals`: 결재 이력
- `payments`: 송금 이력
- `notifications`: 알림

## 🔔 알림 시스템

- **정산결의서 제출**: 대표/부대표에게 푸시알림
- **결재 완료**: 작성자에게 결과 알림
- **송금 준비**: 경리에게 처리 요청 알림
- **송금 완료**: 작성자에게 완료 알림

## 📁 파일 관리

- **지원 형식**: PDF, JPG, PNG
- **최대 크기**: 10MB
- **저장소**: Supabase Storage
- **기능**: 업로드, 다운로드, 미리보기

## 🚀 배포

### 웹 애플리케이션
- Vercel, Netlify 등 정적 호스팅 서비스 사용
- Supabase를 데이터베이스 및 인증 서비스로 사용

### 모바일 애플리케이션
- Expo EAS Build를 사용한 APK 생성
- Google Play Store 배포 가능

## 📝 API 문서

### 주요 엔드포인트
- `POST /api/settlements`: 정산결의서 생성
- `GET /api/approvals`: 결재 목록 조회
- `POST /api/approvals/[id]`: 결재 처리
- `POST /api/payments/[id]`: 송금 처리
- `GET /api/notifications`: 알림 목록

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
