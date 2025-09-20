import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Question, QuizSession } from "../../data/types";
import { ProgressManager } from "../../data/questionManager";

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
  const { subject, difficulty } = useParams<{
    subjectType: string;
    subject: string;
    difficulty: string;
  }>();
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [userProgress, setUserProgress] = useState({
    averageScore: 0,
    totalPoints: 0,
    completedQuizzes: 0,
  });
  const updateUserProgress = useCallback(
    (data: ResultData) => {
      // 선택한 과목명과 난이도 사용
      const subjectName = subject || "";
      const difficultyLevel = difficulty || "";

      // 퀴즈 세션 ID 생성 (고정된 ID 사용 - 같은 결과에 대해서는 동일한 ID)
      const quizSessionId = `quiz_${subjectName}_${difficultyLevel}_${data.score}_${data.correctAnswers}`;

      // 퀴즈 세션 생성
      const quizSession: QuizSession = {
        id: quizSessionId,
        subject: subjectName,
        difficulty: difficultyLevel,
        questions: data.questions,
        currentQuestionIndex: data.questions.length - 1,
        userAnswers: data.userAnswers as number[],
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        score: data.score,
        isCompleted: true,
      };

      // ProgressManager를 사용하여 결과 처리 (중복 체크는 ProgressManager에서 처리)
      const result = ProgressManager.processQuizResult(
        quizSession,
        data.userAnswers as number[],
        data.questions
      );

      // 사용자 진도 업데이트
      setUserProgress({
        averageScore: result.newProgress.averageScore,
        totalPoints: result.newProgress.totalPoints,
        completedQuizzes: result.newProgress.questionHistory.length,
      });

      console.log("퀴즈 결과 처리 완료:", {
        score: result.score,
        pointsEarned: result.pointsEarned,
        newProgress: result.newProgress,
        quizSessionId: quizSessionId,
      });
    },
    [subject, difficulty]
  );

  useEffect(() => {
    console.log("ResultPage - location.state:", location.state);
    console.log("ResultPage - location.pathname:", location.pathname);

    if (location.state) {
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
    } else {
      console.log("ResultPage - 결과 데이터가 없음, 메인으로 리다이렉트");
      navigate("/");
    }
  }, [location.state, location.pathname, navigate, updateUserProgress]);

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

        {/* 
          [로직 설명]

          1. 문제풀이 완료시
            - 사용자가 퀴즈를 모두 풀고 결과 페이지에 도달하면, 
              userProgress 객체(혹은 상태)에 평균 점수(averageScore)와 완료한 퀴즈 수(completedQuizzes)가 저장되어 있습니다.
            - 이 값들은 아마도 로컬스토리지 또는 전역 상태(예: context, redux 등)에 저장되어, 
              결과 페이지에서 바로 불러와서 아래처럼 표시합니다.

          2. 완료시 새로고침 후 어떻게 반영이 되는지
            - 새로고침을 하면, userProgress를 다시 불러오게 됩니다.
            - 만약 userProgress가 로컬스토리지 등 영속 저장소에 저장되어 있다면, 
              새로고침 후에도 평균 점수와 완료한 퀴즈 수가 유지되어 반영됩니다.
            - 만약 상태가 메모리(예: useState)만 사용한다면 새로고침 시 초기화되어 값이 사라집니다.

          3. 여기에 풀이횟수와 평균점수가 있는거같은데, 메인페이지 및 과목 난이도별 횟수와 점수가 반영이 안되는 이유
            - 이 부분은 전체 사용자 진행(userProgress)만을 보여주고 있습니다.
            - 메인페이지나 과목/난이도별로 풀이횟수와 점수를 보여주려면, 
              각 과목/난이도별로 별도의 통계(예: questionManager.getDifficultyStats() 등)를 불러와야 합니다.
            - 현재 이 코드에서는 userProgress의 전체 평균/완료수만 사용하고, 
              과목별/난이도별 세부 통계는 불러오지 않으므로, 메인페이지 및 과목 난이도별 통계가 반영되지 않습니다.
        */}
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
