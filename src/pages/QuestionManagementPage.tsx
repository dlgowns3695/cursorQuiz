import React, { useState, useEffect } from "react";
import { Question } from "../data/types";
import { QuestionManager } from "../data/questionManager";
import { DIFFICULTY_ORDER } from "../data/constants";

interface QuestionManagementPageProps {
  subject: string;
  onBack: () => void;
}

const QuestionManagementPage: React.FC<QuestionManagementPageProps> = ({
  subject,
  onBack,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filterDifficulty, setFilterDifficulty] = useState<string>("전체");

  // 새 문제 입력 폼 상태
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    difficulty: "매우쉬움" as
      | "매우쉬움"
      | "쉬움"
      | "보통"
      | "어려움"
      | "매우어려움",
  });

  // 컴포넌트 마운트 시 문제 목록 로드
  useEffect(() => {
    loadQuestions();
  }, [subject]);

  // 문제 목록 로드
  const loadQuestions = () => {
    const allQuestions = QuestionManager.getQuestionsBySubject(subject);
    setQuestions(allQuestions);
  };

  // 새 문제 추가
  const handleAddQuestion = () => {
    if (
      !newQuestion.question.trim() ||
      newQuestion.options.some((opt) => !opt.trim())
    ) {
      alert("문제와 모든 선택지를 입력해주세요.");
      return;
    }

    const question: Omit<Question, "id" | "createdAt" | "updatedAt"> = {
      subject,
      difficulty: newQuestion.difficulty,
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation,
      points: 1,
    };

    QuestionManager.addQuestion(question);
    loadQuestions();
    setShowAddForm(false);
    resetForm();
  };

  // 문제 수정
  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setNewQuestion({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty,
    });
    setShowAddForm(true);
  };

  // 문제 업데이트
  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    const updatedQuestion = {
      ...editingQuestion,
      question: newQuestion.question,
      options: newQuestion.options,
      correctAnswer: newQuestion.correctAnswer,
      explanation: newQuestion.explanation,
      difficulty: newQuestion.difficulty,
    };

    QuestionManager.updateQuestion(editingQuestion.id, updatedQuestion);
    loadQuestions();
    setShowAddForm(false);
    setEditingQuestion(null);
    resetForm();
  };

  // 문제 삭제
  const handleDeleteQuestion = (id: string) => {
    if (window.confirm("정말로 이 문제를 삭제하시겠습니까?")) {
      QuestionManager.deleteQuestion(id);
      loadQuestions();
    }
  };

  // 폼 초기화
  const resetForm = () => {
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: "",
      difficulty: "매우쉬움",
    });
  };

  // 필터링된 문제 목록
  const filteredQuestions =
    filterDifficulty === "전체"
      ? questions
      : questions.filter((q) => q.difficulty === filterDifficulty);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-railway-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="text-white hover:text-blue-200 transition-colors"
              >
                ← 돌아가기
              </button>
              <div>
                <h1 className="text-xl font-bold">{subject} 문제 관리</h1>
                <p className="text-sm text-blue-200">문제 추가, 수정, 삭제</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              + 새 문제 추가
            </button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-6">
        {/* 통계 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            문제 현황
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {questions.length}
              </div>
              <div className="text-sm text-gray-600">총 문제 수</div>
            </div>
            {DIFFICULTY_ORDER.map((difficulty) => {
              const count = questions.filter(
                (q) => q.difficulty === difficulty
              ).length;
              return (
                <div key={difficulty} className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {count}
                  </div>
                  <div className="text-sm text-gray-600">{difficulty}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                난이도 필터
              </label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="전체">전체</option>
                {DIFFICULTY_ORDER.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 문제 목록 */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg">등록된 문제가 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">
                새 문제를 추가해보세요!
              </p>
            </div>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          question.difficulty === "매우쉬움"
                            ? "bg-green-100 text-green-800"
                            : question.difficulty === "쉬움"
                            ? "bg-blue-100 text-blue-800"
                            : question.difficulty === "보통"
                            ? "bg-yellow-100 text-yellow-800"
                            : question.difficulty === "어려움"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {question.difficulty}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(question.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {question.question}
                    </h3>
                    <div className="space-y-2">
                      {question.options.map((option, index) => (
                        <div
                          key={index}
                          className={`p-2 rounded ${
                            index === question.correctAnswer
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}. {option}
                          {index === question.correctAnswer && (
                            <span className="ml-2 text-green-600 font-semibold">
                              ✓ 정답
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>해설:</strong> {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 문제 추가/수정 폼 모달 */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingQuestion ? "문제 수정" : "새 문제 추가"}
                </h3>

                <div className="space-y-4">
                  {/* 난이도 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      난이도
                    </label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          difficulty: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DIFFICULTY_ORDER.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 문제 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      문제 *
                    </label>
                    <textarea
                      value={newQuestion.question}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          question: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="문제를 입력하세요..."
                    />
                  </div>

                  {/* 선택지 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      선택지 *
                    </label>
                    {newQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <span className="w-6 text-sm font-medium text-gray-600">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...newQuestion.options];
                            newOptions[index] = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              options: newOptions,
                            });
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`선택지 ${index + 1}`}
                        />
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={newQuestion.correctAnswer === index}
                          onChange={() =>
                            setNewQuestion({
                              ...newQuestion,
                              correctAnswer: index,
                            })
                          }
                          className="text-blue-600"
                        />
                        <span className="text-sm text-gray-600">정답</span>
                      </div>
                    ))}
                  </div>

                  {/* 해설 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      해설
                    </label>
                    <textarea
                      value={newQuestion.explanation}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          explanation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="해설을 입력하세요 (선택사항)..."
                    />
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingQuestion(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={
                      editingQuestion ? handleUpdateQuestion : handleAddQuestion
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {editingQuestion ? "수정" : "추가"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuestionManagementPage;
