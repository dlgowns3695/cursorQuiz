import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Question } from "../../data/types";

interface ResultData {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  userAnswers: (number | null)[];
  questions: Question[];
}

const ResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [userProgress, setUserProgress] = useState({
    averageScore: 0,
    totalPoints: 0,
    completedQuizzes: 0,
  });
  const hasUpdatedProgress = useRef(false); // 중복 업데이트 방지

  useEffect(() => {
    console.log("ResultPage - location.state:", location.state);
    console.log("ResultPage - location.pathname:", location.pathname);

    if (location.state && !hasUpdatedProgress.current) {
      hasUpdatedProgress.current = true;
      const state = location.state as ResultData;
      console.log("ResultPage - 받은 데이터:", {
        score: state.score,
        totalQuestions: state.totalQuestions,
        correctAnswers: state.correctAnswers,
        questionsLength: state.questions?.length,
        userAnswersLength: state.userAnswers?.length,
      });

      setResultData(state);
      updateUserProgress(state);
    } else if (!location.state) {
      console.log("ResultPage - 결과 데이터가 없음, 메인으로 리다이렉트");
      navigate("/");
    }
  }, [location.state, navigate]);

  const updateUserProgress = (data: ResultData) => {
    // 로컬 스토리지에서 기존 진도 로드
    const existingProgress = JSON.parse(
      localStorage.getItem("userProgress") || "{}"
    );

    // 현재 난이도 가져오기
    const pathParts = location.pathname.split("/");
    const currentDifficulty = pathParts[3];

    // 난이도별 통계 업데이트
    const difficultyStats = existingProgress.difficultyStats || {};
    const currentStats = difficultyStats[currentDifficulty] || {
      attempts: 0,
      totalScore: 0,
      averageScore: 0,
    };

    const newAttempts = currentStats.attempts + 1;
    const newTotalScore = currentStats.totalScore + data.score;
    const newAverageScore = newTotalScore / newAttempts;

    difficultyStats[currentDifficulty] = {
      attempts: newAttempts,
      totalScore: newTotalScore,
      averageScore: newAverageScore,
    };

    // 해금된 난이도 체크
    const difficultyUnlockConditions = {
      쉬움: { minAttempts: 5, minAverage: 60 },
      중간: { minAttempts: 10, minAverage: 70 },
      어려움: { minAttempts: 15, minAverage: 80 },
      매우어려움: { minAttempts: 20, minAverage: 90 },
    };

    const unlockedDifficulties = existingProgress.unlockedDifficulties || [
      "매우쉬움",
    ];
    const veryEasyStats = difficultyStats["매우쉬움"] || {
      attempts: 0,
      totalScore: 0,
      averageScore: 0,
    };

    Object.keys(difficultyUnlockConditions).forEach((difficulty) => {
      const condition =
        difficultyUnlockConditions[
          difficulty as keyof typeof difficultyUnlockConditions
        ];
      if (
        !unlockedDifficulties.includes(difficulty) &&
        veryEasyStats.attempts >= condition.minAttempts &&
        veryEasyStats.averageScore >= condition.minAverage
      ) {
        unlockedDifficulties.push(difficulty);
      }
    });

    // 전체 평균 점수 계산 (모든 난이도의 평균)
    const allStats = Object.values(difficultyStats);
    const totalAttempts: number = allStats.reduce(
      (sum: number, stat: any) => sum + (stat.attempts || 0),
      0
    );
    const totalScore: number = allStats.reduce(
      (sum: number, stat: any) => sum + (stat.totalScore || 0),
      0
    );
    const overallAverage = totalAttempts > 0 ? totalScore / totalAttempts : 0;

    const newProgress = {
      ...existingProgress,
      averageScore: overallAverage, // 전체 평균 점수
      totalPoints: (existingProgress.totalPoints || 0) + data.score,
      completedQuizzes: (existingProgress.completedQuizzes || 0) + 1, // 1개씩만 증가
      lastQuizScore: data.score,
      lastQuizDate: new Date().toISOString(),
      difficultyStats,
      unlockedDifficulties,
    };

    setUserProgress(newProgress);
    localStorage.setItem("userProgress", JSON.stringify(newProgress));
  };

  const getGradeInfo = (score: number) => {
    if (score >= 90)
      return { grade: "A+", color: "text-green-600", message: "완벽해요!" };
    if (score >= 80)
      return { grade: "A", color: "text-green-500", message: "훌륭해요!" };
    if (score >= 70)
      return { grade: "B+", color: "text-blue-500", message: "잘했어요!" };
    if (score >= 60)
      return { grade: "B", color: "text-blue-400", message: "좋아요!" };
    if (score >= 50)
      return { grade: "C+", color: "text-yellow-500", message: "괜찮아요!" };
    if (score >= 40)
      return {
        grade: "C",
        color: "text-yellow-400",
        message: "조금 더 노력해요!",
      };
    return { grade: "D", color: "text-red-500", message: "다시 도전해보세요!" };
  };

  const handleRetry = () => {
    // 같은 난이도로 다시 시작
    const pathParts = location.pathname.split("/");
    const subjectType = pathParts[2];
    const difficulty = pathParts[3];
    navigate(`/quiz/${subjectType}/${difficulty}`);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleSelectDifficulty = () => {
    const pathParts = location.pathname.split("/");
    const subjectType = pathParts[2];
    navigate(`/quiz/${subjectType}/difficulty`);
  };

  if (!resultData || !resultData.questions || !resultData.userAnswers) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            결과 데이터를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            퀴즈 결과가 올바르게 전달되지 않았습니다.
          </p>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const gradeInfo = getGradeInfo(resultData.score);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 결과 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            퀴즈 완료! 🎉
          </h1>
          <p className="text-gray-600">수고하셨습니다!</p>
        </div>

        {/* 점수 카드 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 max-w-2xl mx-auto">
          <div className="text-center">
            {/* 점수 표시 */}
            <div className="mb-6">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {resultData.score}점
              </div>
              <div className={`text-2xl font-bold ${gradeInfo.color} mb-2`}>
                {gradeInfo.grade}
              </div>
              <p className="text-gray-600">{gradeInfo.message}</p>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {resultData.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">정답</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {resultData.totalQuestions - resultData.correctAnswers}
                </div>
                <div className="text-sm text-gray-600">오답</div>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${resultData.score}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {resultData.correctAnswers} / {resultData.totalQuestions} 문제
              정답
            </p>
          </div>
        </div>

        {/* 문제별 결과 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4">문제별 결과</h3>
          <div className="space-y-3">
            {resultData.questions && resultData.questions.length > 0 ? (
              resultData.questions.map((question, index) => {
                const userAnswer =
                  resultData.userAnswers && resultData.userAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 mb-1">
                          {index + 1}. {question.question}
                        </div>
                        <div className="text-sm text-gray-600">
                          정답: {question.options[question.correctAnswer]}
                        </div>
                        {userAnswer !== null && (
                          <div className="text-sm text-gray-600">
                            내 답: {question.options[userAnswer]}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {isCorrect ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-8">
                문제 결과를 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            다시 풀기
          </button>
          <button
            onClick={handleSelectDifficulty}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            난이도 선택
          </button>
          <button
            onClick={handleGoHome}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            메인으로
          </button>
        </div>

        {/* 사용자 통계 */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            평균 점수: {Number(userProgress.averageScore || 0).toFixed(2)}점 |
            완료한 퀴즈: {userProgress.completedQuizzes || 0}개
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
