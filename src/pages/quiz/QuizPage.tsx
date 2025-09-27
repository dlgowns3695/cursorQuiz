import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Question } from "../../data/types";
import { questionService } from "../../data/questionService";
import { QUIZ_QUESTIONS_COUNT } from "../../data/constants";

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectType, subject, difficulty } = useParams<{
    subjectType: string;
    subject: string;
    difficulty: string;
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasLoadedQuestions = useRef(false); // 중복 로드 방지

  // 문제 로드
  useEffect(() => {
    console.log("QuizPage mounted with params:", { subjectType, difficulty });

    if (subjectType && difficulty && !hasLoadedQuestions.current) {
      hasLoadedQuestions.current = true;
      console.log("Loading questions for:", subjectType, difficulty);
      const loadedQuestions = questionService.getRandomQuestionsNew(
        subjectType as "management" | "railway",
        subject || "",
        difficulty,
        QUIZ_QUESTIONS_COUNT
      );
      console.log("Loaded questions:", loadedQuestions.length, loadedQuestions);
      setQuestions(loadedQuestions);
      setUserAnswers(new Array(loadedQuestions.length).fill(null));
      setIsLoading(false);

      // 문제 로드 완료 알럿창
      // alert(
      //   `문제 로드 완료!\n과목: ${
      //     subjectType === "management" ? "경영학" : "철도법령"
      //   }\n난이도: ${difficulty}\n문제 수: ${loadedQuestions.length}개`
      // );
    } else if (!subjectType || !difficulty) {
      console.log("Missing parameters:", { subjectType, difficulty });
      setIsLoading(false);
    }
  }, [subjectType, subject, difficulty]);

  // 타이머 효과
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && questions.length > 0) {
      // 시간 초과 시 자동으로 다음 문제로
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(30);
        setIsAnswered(false);
      }
    }
  }, [timeLeft, isAnswered, currentQuestionIndex, questions.length]);

  // 현재 문제의 선택된 답안 로드
  useEffect(() => {
    if (questions.length > 0) {
      setSelectedAnswer(userAnswers[currentQuestionIndex]);
      setIsAnswered(userAnswers[currentQuestionIndex] !== null);
    }
  }, [currentQuestionIndex, userAnswers, questions.length]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">문제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 문제가 없는 경우
  if (!questions.length || !currentQuestion) {
    console.log("No questions available:", {
      questionsLength: questions.length,
      currentQuestion,
    });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            문제를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            {subjectType === "management" ? "경영학" : "철도법령"} {difficulty}{" "}
            난이도의 문제가 없습니다.
          </p>
          <button
            onClick={() => navigate(`/quiz/${subjectType}/difficulty`)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            난이도 선택으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
    setIsAnswered(true);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTimeLeft(30);
      setIsAnswered(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(30);
      setIsAnswered(false);
    }
  };

  const handleSubmit = () => {
    // 안전한 데이터 검증
    if (!questions || questions.length === 0) {
      alert("문제 데이터가 없습니다. 메인으로 돌아갑니다.");
      navigate("/");
      return;
    }

    if (!userAnswers || userAnswers.length === 0) {
      alert("답안 데이터가 없습니다. 메인으로 돌아갑니다.");
      navigate("/");
      return;
    }

    // 점수 계산
    let correctCount = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // 히스토리 ID 생성
    const historyId = `quiz_${subject}_${difficulty}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // 제출하기 버튼 클릭 시 히스토리 ID 출력
    console.log("🚀 제출하기 클릭 - 히스토리 ID:", historyId);

    // 결과 페이지로 이동
    navigate(`/quiz/${subjectType}/${subject}/${difficulty}/result`, {
      state: {
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        userAnswers: [...userAnswers], // 배열 복사
        questions: [...questions], // 배열 복사
        isSubmitted: true, // 제출하기 버튼을 통한 접근임을 표시
        historyId: historyId, // 생성된 히스토리 ID 전달
      },
    });
  };

  const getAnswerButtonClass = (index: number) => {
    if (!isAnswered) {
      return "w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors";
    }

    if (index === currentQuestion.correctAnswer) {
      return "w-full p-4 text-left border-2 border-green-500 bg-green-50 text-green-800 rounded-lg";
    }

    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return "w-full p-4 text-left border-2 border-red-500 bg-red-50 text-red-800 rounded-lg";
    }

    return "w-full p-4 text-left border-2 border-gray-200 bg-gray-50 text-gray-500 rounded-lg";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 진행 상황 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {subjectType === "management" ? "경영학" : "철도법령"} 문제풀이
            </h1>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                문제 {currentQuestionIndex + 1} / {questions.length}
              </div>
              <div className="text-sm text-gray-600">
                남은 시간: {timeLeft}초
              </div>
            </div>
          </div>

          {/* 진행 바 */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {currentQuestionIndex + 1}. {currentQuestion.question}
            </h2>
            <div className="text-sm text-gray-600 mb-4 hidden">
              난이도: {currentQuestion.difficulty} | {currentQuestion.points}점
            </div>
          </div>

          {/* 답안 선택 */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={getAnswerButtonClass(index)}
                disabled={isAnswered}
              >
                <div className="flex items-center text-xs">
                  <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  {option}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 네비게이션 버튼들 */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/")}
              className="text-xs px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              🏠 메인으로
            </button>
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="text-xs px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              ← 뒤로가기
            </button>
          </div>

          <div className="flex space-x-4">
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="text-xs px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                다음으로 →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="text-xs px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                제출하기 ✓
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
