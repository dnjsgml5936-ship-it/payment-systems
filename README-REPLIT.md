# Replit 배포 가이드

## 🚀 Replit에서 배포하기

### 1. GitHub에서 Import
1. Replit에서 "Create Repl" 클릭
2. "Import from GitHub" 선택
3. `https://github.com/dnjsgml5936-ship-it/payment-systems` 입력
4. Import 클릭

### 2. 환경 변수 설정
Replit의 Secrets 탭에서 다음 환경 변수들을 설정하세요:

```
SUPABASE_URL=https://zmyrjtwwmaiemnwaeptq.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpteXJqdHd3bWFpZW1ud2FlcHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMDkxNDAsImV4cCI6MjA3Mjg4NTE0MH0.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpteXJqdHd3bWFpZW1ud2FlcHRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzMwOTE0MCwiZXhwIjoyMDcyODg1MTQwfQ.hy9ZJU1KMNd7P1gp3bjcY0AZHqHkRigl2f01J_Kq9rM
NEXT_PUBLIC_SUPABASE_URL=https://zmyrjtwwmaiemnwaeptq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpteXJqdHd3bWFpZW1ud2FlcHRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMDkxNDAsImV4cCI6MjA3Mjg4NTE0MH0.8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q
NEXT_PUBLIC_APP_URL=https://your-repl-name.your-username.repl.co
```

### 3. 배포 실행
1. Replit에서 "Run" 버튼 클릭
2. 자동으로 빌드되고 배포됩니다

### 4. 테스트 계정
- 관리자: `dnjsgml5936@gmail.com` / `wnsla9182*`
- 승인자: `ahyun@company.com` / `wnsla9182*` (이아현)
- 승인자: `minsu@company.com` / `wnsla9182*` (김민수)

## ⚠️ 주의사항

1. **데이터베이스**: 현재 메모리 저장소를 사용하므로 서버 재시작 시 데이터가 초기화됩니다.
2. **모바일 앱**: Replit에서는 웹 앱만 배포되며, 모바일 앱은 별도로 Expo Go에서 테스트해야 합니다.
3. **파일 업로드**: 현재 파일 업로드 기능은 임시로 비활성화되어 있습니다.

## 🔧 문제 해결

### 빌드 오류 시
```bash
npm install
npm run build
```

### 환경 변수 오류 시
Replit의 Secrets 탭에서 모든 환경 변수가 올바르게 설정되었는지 확인하세요.

### 데이터베이스 연결 오류 시
현재는 메모리 저장소를 사용하므로 데이터베이스 연결이 필요하지 않습니다.
