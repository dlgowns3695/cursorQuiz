import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Question, QuizSession } from "../../data/types";
import { questionService } from "../../data/questionService";
import { ProgressManager } from "../../data/questionManager";
import { QUIZ_QUESTIONS_COUNT } from "../../data/constants";

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectType, subject } = useParams<{
    subjectType: string;
    subject: string;
  }>();

  const decodedSubject = useMemo(
    () => decodeURIComponent(subject || ""),
    [subject],
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // 초기 문제 로드
  useEffect(() => {
    if (!subjectType || subjectType !== "railway" || !decodedSubject) {
      return;
    }

    // 과목(기본법 이름)을 기준으로, 해당 기본법 + 시행령 문제를 묶어서 가져온다.
    const qs = questionService.getRandomQuestionsBySubject(
      decodedSubject,
      QUIZ_QUESTIONS_COUNT,
    );

    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setIsCompleted(false);
    setScore(null);
    setIsLoading(false);
  }, [subjectType, decodedSubject]);

  if (!subjectType || subjectType !== "railway") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600 mb-4">
            잘못된 과목 유형입니다. 철도법령 과목만 지원합니다.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">문제를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">문제 없음</h1>
          <p className="text-gray-600 mb-4">
            선택한 과목에 대한 문제가 아직 등록되어 있지 않습니다.
          </p>
          <button
            onClick={() => navigate(`/quiz/${subjectType}/subjects`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            과목 다시 선택하기
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);
  };

  const handleNext = () => {
    if (selectedOption === null) {
      alert("보기를 선택해주세요.");
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedOption;
    setAnswers(newAnswers);
    setSelectedOption(null);

    // 마지막 문제면 결과 처리
    if (currentIndex === questions.length - 1) {
      // 퀴즈 세션 생성 (난이도는 통합 모드이므로 "전체" 사용)
      const session: QuizSession = {
        id: `quiz_${Date.now()}`,
        subject: decodedSubject,
        difficulty: "전체",
        questions,
        currentQuestionIndex: questions.length - 1,
        userAnswers: newAnswers,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        isCompleted: true,
      };

      const result = ProgressManager.processQuizResult(
        session,
        newAnswers,
        questions,
      );

      setScore(result.score);
      setIsCompleted(true);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    // 같은 과목으로 다시 시작
    setIsLoading(true);
    const qs = questionService.getRandomQuestionsBySubject(
      decodedSubject,
      QUIZ_QUESTIONS_COUNT,
    );
    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setIsCompleted(false);
    setScore(null);
    setIsLoading(false);
  };

  if (isCompleted && score !== null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {decodedSubject} 퀴즈 완료!
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            최종 점수:{" "}
            <span className="font-bold text-blue-600">{score}점</span>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            (기본문 + 시행령 문제가 함께 출제되었습니다.)
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              다시 풀기
            </button>
            <button
              onClick={() => navigate(`/quiz/${subjectType}/subjects`)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              과목 선택으로
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              메인으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-railway-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(`/quiz/${subjectType}/subjects`)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            ← 과목 선택으로
          </button>
          <div className="text-right">
            <div className="text-sm text-blue-100">{decodedSubject}</div>
            <div className="text-xs text-blue-200">
              기본법 + 시행령 통합 문제
            </div>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* 진행 정보 */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            문제 {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="mb-4">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              {currentQuestion.subject}
            </div>
            <h2 className="text-lg font-semibold text-gray-800 whitespace-pre-line">
              {currentQuestion.question}
            </h2>
          </div>

          {/* 선택지 */}
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-800"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-semibold mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {currentIndex === questions.length - 1 ? "결과 보기" : "다음 문제"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
