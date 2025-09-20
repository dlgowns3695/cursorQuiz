# 점수 및 횟수 사용처 분석 문서

## 📊 문제풀이 완료 시 생성되는 데이터

### 1. **퀴즈 결과 데이터 (ResultData)**

- **위치**: `src/pages/quiz/QuizPage.tsx` → `src/pages/quiz/ResultPage.tsx`
- **내용**:
  - `score`: 퀴즈 점수 (0-100점)
  - `totalQuestions`: 총 문제 수 (5문제)
  - `correctAnswers`: 정답 수
  - `userAnswers`: 사용자 답안 배열
  - `questions`: 문제 배열

### 2. **사용자 진도 데이터 (UserProgress)**

- **위치**: `src/data/questionManager.ts` - `ProgressManager.processQuizResult()`
- **저장소**: `localStorage` - `userProgress` 키
- **내용**:
  - `averageScore`: 전체 평균 점수
  - `totalPoints`: 총 포인트 (정답 수만큼 누적)
  - `unlockedDifficulties`: 해금된 난이도 배열
  - `completedSubjects`: 완료한 과목 배열
  - `questionHistory`: 문제별 풀이 이력 배열

## 🎯 점수 및 횟수 사용처 상세 분석

### **A. 결과 페이지 (ResultPage.tsx)**

- **표시 위치**: 하단 통계 섹션
- **사용 데이터**:
  - `userProgress.averageScore`: 평균 점수 표시
  - `userProgress.completedQuizzes`: 완료한 퀴즈 수 표시
- **과목/난이도**: 현재 퀴즈의 과목과 난이도 정보

### **B. 메인페이지 (MainPage.tsx)**

- **표시 위치**:
  1. 하단 정보 섹션 (포인트, 해금된 난이도 수)
  2. 상세 통계 모달 (과목별 난이도별 통계)
- **사용 데이터**:
  - `userProgress.totalPoints`: 현재 포인트
  - `userProgress.unlockedDifficulties.length`: 해금된 난이도 수
  - `ProgressManager.getSubjectDifficultyStats()`: 과목별 난이도별 통계
- **과목/난이도**:
  - 경영학원론 (management)
  - 철도산업발전기본법 (railway)
  - 각각 5개 난이도 (매우쉬움, 쉬움, 보통, 어려움, 매우어려움)

### **C. 과목 선택 페이지 (SubjectSelectionPage.tsx)**

- **표시 위치**:
  1. 각 과목 카드의 진도 정보
  2. 선택된 과목의 난이도별 통계 섹션
- **사용 데이터**:
  - `ProgressManager.getSubjectProgress()`: 과목별 진도
  - `ProgressManager.getSubjectDifficultyStats()`: 과목별 난이도별 통계
- **과목/난이도**: 선택된 과목의 모든 난이도별 상세 통계

### **D. 난이도 선택 페이지 (DifficultySelectionPage.tsx)**

- **표시 위치**: 하단 정보 섹션
- **사용 데이터**: 문제 수 정보 (5문제)
- **과목/난이도**: 현재 선택된 과목의 모든 난이도

## 📈 통계 계산 방식

### **1. 점수 계산**

```typescript
// 개별 문제 점수
score: isCorrect ? 100 : 0;

// 퀴즈 전체 점수
const score = Math.round((correctAnswers / questions.length) * 100);

// 전체 평균 점수
const newAverageScore = Math.round(
  allScores.reduce((sum, s) => sum + s, 0) / allScores.length
);
```

### **2. 횟수 계산**

```typescript
// 난이도별 풀이 횟수
difficultyStats[difficulty].attempts += 1;

// 과목별 풀이 횟수
const subjectHistory = progress.questionHistory.filter(
  (h) => h.subject === subject
);
const totalQuestions = subjectHistory.length;
```

### **3. 포인트 계산**

```typescript
// 맞힌 문제 수만큼 포인트 획득
const pointsEarned = correctAnswers;
const newTotalPoints = currentProgress.totalPoints + pointsEarned;
```

## 🔄 데이터 흐름

1. **퀴즈 완료** → `QuizPage.tsx`에서 점수 계산
2. **결과 전달** → `ResultPage.tsx`로 데이터 전달
3. **진도 업데이트** → `ProgressManager.processQuizResult()` 호출
4. **로컬 저장** → `localStorage`에 `userProgress` 저장
5. **통계 표시** → 각 페이지에서 `ProgressManager` 메서드로 데이터 조회

## 📍 구체적인 사용 위치

### **경영학원론 (management)**

- **과목명**: "경영학원론"
- **사용 위치**:
  - 메인페이지 상세 통계 모달
  - 과목 선택 페이지 (경영학 시작하기)
- **표시 데이터**: 각 난이도별 풀이횟수, 평균점수

### **철도산업발전기본법 (railway)**

- **과목명**: "철도산업발전기본법"
- **사용 위치**:
  - 메인페이지 상세 통계 모달
  - 과목 선택 페이지 (철도법령 시작하기)
- **표시 데이터**: 각 난이도별 풀이횟수, 평균점수

### **난이도별 구분**

- **매우쉬움**: 기본 해금, 난이도 해금 조건 없음
- **쉬움**: 매우쉬움 5회 이상, 평균 60점 이상
- **보통**: 매우쉬움 10회 이상, 평균 70점 이상
- **어려움**: 매우쉬움 15회 이상, 평균 80점 이상
- **매우어려움**: 매우쉬움 20회 이상, 평균 90점 이상

## 🎯 알럿 표시 내용

메인페이지 입장 시 표시되는 알럿:

```
🎯 현재 포인트: X점

📊 경영학원론 통계:
  매우쉬움: 3회, 평균 85점
  쉬움: 2회, 평균 90점

🚂 철도산업발전기본법 통계:
  매우쉬움: 5회, 평균 80점
  쉬움: 1회, 평균 95점

📈 전체 난이도별 통계:
  매우쉬움: 8회, 평균 82점
  쉬움: 3회, 평균 92점
```

이 문서는 현재 시스템에서 점수와 횟수가 어떻게 저장되고 사용되는지에 대한 완전한 분석입니다.
