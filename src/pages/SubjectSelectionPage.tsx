import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SUBJECTS } from "../data/constants";
import { ProgressManager } from "../data/questionManager";

const SubjectSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjectType } = useParams<{ subjectType: string }>();

  // 해당 타입의 과목 정보 가져오기
  const currentSubject = SUBJECTS.find((s) => s.type === subjectType);

  if (!currentSubject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600">해당 과목을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 세부 과목별 진도 정보 가져오기
  const getSubjectProgress = (subject: string) => {
    return ProgressManager.getSubjectProgress(subject);
  };

  // 과목 선택 핸들러 - 선택한 과목으로 퀴즈 바로 시작 (난이도 선택 없음)
  const handleSubjectSelect = (subject: string) => {
    console.log("📚 세부과목 선택 → 퀴즈 시작:", subject);
    navigate(`/quiz/${subjectType}/${encodeURIComponent(subject)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-railway-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/")}
                className="text-white hover:text-blue-200 transition-colors"
              >
                ← 돌아가기
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-6">
        {/* 안내 메시지 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            학습할 과목을 선택하세요
          </h2>
          <p className="text-blue-700 text-sm">
            과목을 선택하면 해당 과목의 문제풀이가 바로 시작됩니다.
          </p>
        </div>

        {/* 세부 과목 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {currentSubject.subjects.map((subject, index) => {
            const progress = getSubjectProgress(subject);
            const isCompleted = progress.totalQuestions > 0;
            const isLastSubject = index === currentSubject.subjects.length - 1;

            return (
              <div
                key={subject}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border-2 border-gray-200"
                onClick={() => handleSubjectSelect(subject)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-12 h-12 ${
                          isLastSubject ? "bg-purple-500" : currentSubject.color
                        } rounded-lg flex items-center justify-center text-white text-xl`}
                      >
                        {isLastSubject ? "🎯" : "📚"}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {subject}
                        </h3>
                        {isLastSubject && (
                          <p className="text-sm text-purple-600 font-medium">
                            전체 통합 문제
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 진도 정보 */}
                    {isCompleted ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">평균 점수:</span>
                          <span className="font-semibold text-green-600">
                            {progress.averageScore}점
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">풀이한 횟수:</span>
                          <span className="font-semibold">
                            {progress.totalQuestions}회
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        아직 학습하지 않은 과목입니다.
                      </div>
                    )}

                    {/* 완료 표시 */}
                    {isCompleted && (
                      <div className="mt-3 flex items-center text-green-600 text-sm">
                        <span className="mr-1">✓</span>
                        학습 완료
                      </div>
                    )}
                  </div>

                  {/* 선택 표시 제거: 카드 클릭 시 바로 퀴즈로 이동 */}
                </div>
              </div>
            );
          })}
        </div>

        {/* 학습 팁 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            학습 팁
          </h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• 각 과목을 순서대로 학습하는 것을 권장합니다</li>
            <li>• 전체 통합은 모든 세부 과목이 포함된 문제입니다</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default SubjectSelectionPage;
