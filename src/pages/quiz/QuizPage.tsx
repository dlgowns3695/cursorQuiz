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

  const TOTAL_TIME = 300; // 5분 = 300초

  // 메인(1차) 퀴즈 상태
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [score, setScore] = useState<number | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);

  // 틀린 문제 정보
  const [wrongIndexes, setWrongIndexes] = useState<number[]>([]);

  // 재풀이(2차) 상태
  const [phase, setPhase] = useState<
    "quiz" | "result" | "redoQuiz" | "redoResult"
  >("quiz");
  const [redoQuestions, setRedoQuestions] = useState<Question[]>([]);
  const [redoAnswers, setRedoAnswers] = useState<number[]>([]);
  const [redoCorrectCount, setRedoCorrectCount] = useState<number | null>(null);

  // 메인 퀴즈 종료 처리 (점수 계산 + 통계 저장 + 틀린 문제 목록 계산)
  const finalizeQuiz = (finalAnswers: number[]) => {
    const finishedAt = new Date().toISOString();

    const session: QuizSession = {
      id: `quiz_${Date.now()}`,
      subject: decodedSubject,
      difficulty: "전체",
      questions,
      currentQuestionIndex: questions.length - 1,
      userAnswers: finalAnswers,
      startTime: finishedAt,
      endTime: finishedAt,
      isCompleted: true,
    };

    const result = ProgressManager.processQuizResult(
      session,
      finalAnswers,
      questions,
    );

    setScore(result.score);
    setCompletedAt(finishedAt);
    setPhase("result");

    // 틀린 문제 인덱스 계산
    const wrong: number[] = [];
    questions.forEach((q, idx) => {
      if (finalAnswers[idx] !== q.correctAnswer) {
        wrong.push(idx);
      }
    });
    setWrongIndexes(wrong);
  };

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
    setAnswers(new Array(qs.length).fill(-1));
    setScore(null);
    setCompletedAt(null);
    setWrongIndexes([]);
    setPhase("quiz");
    setTimeLeft(TOTAL_TIME);
    setIsLoading(false);
  }, [subjectType, decodedSubject]);

  // 타이머 (메인 퀴즈에서만 작동) - 전체 5분 기준, 화면 전환과 무관하게 흐름
  useEffect(() => {
    if (phase !== "quiz") return;
    if (!questions.length) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerId);
  }, [phase, questions.length]);

  // 시간이 0이 되었을 때 한 번만 자동 채점
  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft > 0) return;

    const finalAnswers = [...answers];
    if (
      selectedOption !== null &&
      currentIndex >= 0 &&
      currentIndex < finalAnswers.length
    ) {
      finalAnswers[currentIndex] = selectedOption;
    }
    finalizeQuiz(finalAnswers);
  }, [phase, timeLeft, answers, selectedOption, currentIndex]);

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

  const isRedoMode = phase === "redoQuiz";
  const activeQuestions = isRedoMode ? redoQuestions : questions;
  const currentQuestion = activeQuestions[currentIndex];

  const handleOptionSelect = (index: number) => {
    setSelectedOption(index);

    if (phase === "quiz") {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = index;
      setAnswers(newAnswers);
    } else if (phase === "redoQuiz") {
      const newRedoAnswers = [...redoAnswers];
      newRedoAnswers[currentIndex] = index;
      setRedoAnswers(newRedoAnswers);
    }
  };

  const handleNextMain = () => {
    if (selectedOption === null || answers[currentIndex] === -1) {
      alert("보기를 선택해주세요.");
      return;
    }

    // 마지막 문제면 결과 처리
    if (currentIndex === questions.length - 1) {
      finalizeQuiz(answers);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
  };

  const handleNextRedo = () => {
    if (selectedOption === null || redoAnswers[currentIndex] === -1) {
      alert("보기를 선택해주세요.");
      return;
    }

    if (currentIndex === redoQuestions.length - 1) {
      // 재풀이 결과: 틀렸던 문제 중 몇 개를 맞았는지만 계산
      let correct = 0;
      redoQuestions.forEach((q, idx) => {
        if (redoAnswers[idx] === q.correctAnswer) correct++;
      });
      setRedoCorrectCount(correct);
      setPhase("redoResult");
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
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
    setAnswers(new Array(qs.length).fill(-1));
    setScore(null);
    setCompletedAt(null);
    setWrongIndexes([]);
    setPhase("quiz");
    setTimeLeft(TOTAL_TIME);
    setRedoQuestions([]);
    setRedoAnswers([]);
    setRedoCorrectCount(null);
    setIsLoading(false);
  };

  const startRedoWrongQuestions = () => {
    if (!wrongIndexes.length) return;
    const subset = wrongIndexes.map((idx) => questions[idx]);
    setRedoQuestions(subset);
    setRedoAnswers(new Array(subset.length).fill(-1));
    setCurrentIndex(0);
    setSelectedOption(null);
    setRedoCorrectCount(null);
    setPhase("redoQuiz");
  };

  // 메인 퀴즈 결과 화면 (점수 기반)
  if (phase === "result" && score !== null) {
    const total = questions.length;
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) correctCount++;
    });
    const wrongCount = total - correctCount;

    // 시간 정보 계산
    const usedSeconds = Math.min(TOTAL_TIME, TOTAL_TIME - timeLeft);
    const usedMinutesPart = Math.floor(usedSeconds / 60);
    const usedSecondsPart = usedSeconds % 60;
    const finishedInTime = timeLeft > 0;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {decodedSubject} 퀴즈 완료!
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-lg text-gray-700 mb-1">
                최종 점수:{" "}
                <span className="font-bold text-blue-600">{score}점</span>
              </p>
              <p className="text-sm text-gray-600">
                정답 {correctCount}문제 / 오답 {wrongCount}문제 (총 {total}
                문제)
              </p>
              {/* 시간 정보 */}
              <p className="text-sm mt-1">
                {finishedInTime ? (
                  <span className="text-blue-600 font-medium">
                    소요 시간: {usedMinutesPart}분{" "}
                    {String(usedSecondsPart).padStart(2, "0")}초
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    시간 초과: 제한 5분 경과
                  </span>
                )}
              </p>
              {completedAt && (
                <p className="text-xs text-gray-500 mt-1">
                  응시일시:{" "}
                  {new Date(completedAt).toLocaleString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                (기본문 + 시행령 문제가 함께 출제되었습니다.)
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
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

          {/* 틀린 문제 다시 보기 */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                틀린 문제 다시 보기
              </h2>
              <button
                onClick={startRedoWrongQuestions}
                disabled={wrongIndexes.length === 0}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  wrongIndexes.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                틀린 문제만 다시 풀어보기
              </button>
            </div>

            {wrongIndexes.length === 0 ? (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                축하합니다! 틀린 문제가 없습니다.
              </p>
            ) : (
              <div className="space-y-4 max-h-[50vh] overflow-y-auto">
                {wrongIndexes.map((idx) => {
                  const q = questions[idx];
                  const userAnswer = answers[idx];
                  return (
                    <div
                      key={idx}
                      className="border border-red-200 bg-red-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-semibold text-red-700">
                          오답 문항 #{idx + 1}
                        </div>
                        {q.keywords && q.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {q.keywords.map((kw) => (
                              <span
                                key={kw}
                                className="px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-700"
                              >
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-800 mb-3 whitespace-pre-line">
                        {q.question}
                      </div>
                      <div className="space-y-1">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correctAnswer;
                          const isUser = optIdx === userAnswer;
                          let className =
                            "px-3 py-1.5 rounded text-sm border bg-white";
                          if (isCorrect) {
                            className =
                              "px-3 py-1.5 rounded text-sm border border-green-400 bg-green-50 text-green-800";
                          } else if (isUser) {
                            className =
                              "px-3 py-1.5 rounded text-sm border border-red-400 bg-red-100 text-red-800";
                          }
                          return (
                            <div key={optIdx} className={className}>
                              <span className="font-semibold mr-1">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              {opt}
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 text-xs text-gray-700 bg-white border border-gray-200 rounded p-2">
                          <span className="font-semibold text-gray-800">
                            해설:
                          </span>{" "}
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 재풀이(틀린 문제만 다시 풀기) 결과 화면
  if (phase === "redoResult" && redoCorrectCount !== null) {
    const totalRedo = redoQuestions.length;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-xl w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            틀린 문제 재풀이 결과
          </h1>
          <p className="text-lg text-gray-700 mb-2">
            틀렸던 <span className="font-bold text-red-600">{totalRedo}</span>
            문제 중{" "}
            <span className="font-bold text-green-600">{redoCorrectCount}</span>
            문제를 맞혔습니다.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            이 결과는 점수(%) 대신 약점 보완 정도를 확인하기 위한 용도입니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={startRedoWrongQuestions}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              다시 재풀이 하기
            </button>
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              전체 퀴즈 다시 풀기
            </button>
            <button
              onClick={() => navigate(`/quiz/${subjectType}/subjects`)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              과목 선택으로
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
          <div className="flex items-center space-x-4">
            {phase === "quiz" && (
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 rounded-full border-4 border-blue-300 flex items-center justify-center text-sm font-semibold">
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}
                </div>
                <div className="text-xs text-blue-100 text-right">
                  <div>남은 시간</div>
                  <div className="opacity-80">5분 / 10문제 기준</div>
                </div>
              </div>
            )}
            <div className="text-right">
              <div className="text-sm text-blue-100">{decodedSubject}</div>
              <div className="text-xs text-blue-200">
                {isRedoMode
                  ? "틀린 문제 재풀이 (시간 제한 없음)"
                  : "기본문 + 시행령 통합 문제"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* 진행 정보 */}
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            문제 {currentIndex + 1} / {activeQuestions.length}
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
                  <span className="font-semibold text-sm mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <span className="text-sm">{option}</span>
                </button>
              );
            })}
          </div>

          {/* 네비게이션 버튼 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={isRedoMode ? handleNextRedo : handleNextMain}
              className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {currentIndex === activeQuestions.length - 1
                ? "결과 보기"
                : "다음 문제"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizPage;
