import React, { useState, useEffect } from "react";
import { Subject } from "../data/types";
import { SUBJECTS } from "../data/constants";
import { ProgressManager } from "../data/questionManager";

interface SubjectSelectionPageProps {
  subjectType: "management" | "railway";
  onSubjectSelect: (subject: string) => void;
  onBack: () => void;
}

const SubjectSelectionPage: React.FC<SubjectSelectionPageProps> = ({
  subjectType,
  onSubjectSelect,
  onBack,
}) => {
  const [userProgress, setUserProgress] = useState(
    ProgressManager.getUserProgress()
  );
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  // 해당 타입의 과목 정보 가져오기
  const currentSubject = SUBJECTS.find((s) => s.type === subjectType);

  if (!currentSubject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600">해당 과목을 찾을 수 없습니다.</p>
          <button
            onClick={onBack}
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

  // 과목 선택 핸들러
  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    onSubjectSelect(subject);
  };

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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-railway-blue font-bold text-lg">
                    {currentSubject.icon}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">{currentSubject.name}</h1>
                  <p className="text-sm text-blue-200">
                    {currentSubject.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-200">
                포인트: {userProgress.totalPoints}
              </p>
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
            각 과목을 개별적으로 학습하거나, 마지막에 전체 통합 문제를
            풀어보세요. 난이도는 점진적으로 해금되며, 각 문제를 맞힐 때마다
            1포인트를 획득합니다.
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
                className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer border-2 ${
                  selectedSubject === subject
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
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
                          <span className="text-gray-600">풀이한 문제:</span>
                          <span className="font-semibold">
                            {progress.correctAnswers}/{progress.totalQuestions}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">완료한 난이도:</span>
                          <span className="font-semibold text-blue-600">
                            {progress.completedDifficulties.length}개
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

                  {/* 선택 표시 */}
                  {selectedSubject === subject && (
                    <div className="text-blue-500 text-2xl">✓</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 선택된 과목에 대한 액션 버튼 */}
        {selectedSubject && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedSubject} 학습 시작
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                onClick={() => {
                  // TODO: 퀴즈 페이지로 이동
                  console.log(`${selectedSubject} 퀴즈 시작`);
                }}
              >
                퀴즈 시작하기
              </button>
              <button
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                onClick={() => {
                  // TODO: 문제 관리 페이지로 이동
                  console.log(`${selectedSubject} 문제 관리`);
                }}
              >
                문제 관리
              </button>
              <button
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                onClick={() => {
                  // TODO: 진도 확인 페이지로 이동
                  console.log(`${selectedSubject} 진도 확인`);
                }}
              >
                진도 확인
              </button>
            </div>
          </div>
        )}

        {/* 학습 팁 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            학습 팁
          </h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• 각 과목을 순서대로 학습하는 것을 권장합니다</li>
            <li>
              • 난이도는 점진적으로 해금되므로 기본부터 차근차근 학습하세요
            </li>
            <li>• 문제를 직접 입력하여 나만의 문제집을 만들어보세요</li>
            <li>• 전체 통합 문제는 모든 세부 과목을 학습한 후 도전하세요</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default SubjectSelectionPage;

