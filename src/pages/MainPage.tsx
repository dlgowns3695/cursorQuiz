import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressManager } from "../data/questionManager";
import { UserProgress } from "../data/types";
import { QUIZ_QUESTIONS_COUNT } from "../data/constants";

// 과목 정보 인터페이스
interface Subject {
  id: string;
  name: string;
  type: "railway";
  subjects: string[];
  description: string;
  icon: string;
  color: string;
}

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  // 사용자 진도 상태 관리
  const [userProgress, setUserProgress] = useState<UserProgress>({
    averageScore: 0,
    totalPoints: 0,
    completedSubjects: [],
    questionHistory: [],
  });

  // 통계 모달 상태
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedStatsSubject, setSelectedStatsSubject] = useState<
    string | null
  >(null);

  // 초기화 확인 모달 상태
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedSubjectToReset, setSelectedSubjectToReset] = useState<
    string | null
  >(null);

  // 과목 정보 정의
  const subjects: Subject[] = [
    {
      id: "railway",
      name: "철도법령 시작하기",
      type: "railway",
      // 대표 과목/통합 과목 목록 (실제 문제 선택은 세부 과목 페이지에서 처리)
      subjects: [
        "철도산업발전기본법",
        "철도산업법",
        "철도공사법",
        "전체 통합",
      ],
      description: "철도 관련 법령 완전 정복",
      icon: "🚂",
      color: "bg-red-500",
    },
  ];

  // 난이도 해금 체크 제거됨 (난이도 기능 미사용)

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 진도 로드
  useEffect(() => {
    const progress = ProgressManager.getUserProgress();
    setUserProgress({
      averageScore: progress.averageScore,
      totalPoints: progress.totalPoints,
      completedSubjects: progress.completedSubjects || [],
      questionHistory: progress.questionHistory || [],
    });
  }, []);

  // 과목 선택 핸들러
  const handleSubjectSelect = (subject: Subject) => {
    // 과목 선택 로그
    console.log("🎯 과목 선택:", subject.name);
    // 세부 과목 선택 페이지로 이동
    navigate(`/quiz/${subject.type}/subjects`);
  };

  // 초기화 버튼 클릭 핸들러
  const handleResetClick = (subjectType: string) => {
    setSelectedSubjectToReset(subjectType);
    setShowResetModal(true);
  };

  // 초기화 확인 핸들러
  const handleResetConfirm = () => {
    if (!selectedSubjectToReset) return;

    const currentProgress = ProgressManager.getUserProgress();

    // 선택된 과목의 데이터만 제거
    const filteredHistory = currentProgress.questionHistory.filter((record) => {
      if (selectedSubjectToReset === "railway") {
        return !record.subject.includes("철도");
      }
      return true;
    });

    // 해당 과목으로 얻은 포인트 계산
    const removedPoints = currentProgress.questionHistory
      .filter((record) => {
        if (selectedSubjectToReset === "railway") {
          return record.subject.includes("철도");
        }
        return false;
      })
      .reduce((sum, record) => {
        // 퀴즈 세션별로 획득한 포인트 계산
        // score는 0-100 사이의 점수이므로, 이를 맞힌 문제 수로 변환
        const correctAnswers = Math.round(
          (record.score / 100) * QUIZ_QUESTIONS_COUNT,
        );
        return sum + correctAnswers;
      }, 0);

    // 새로운 진도 계산
    const newTotalPoints = Math.max(
      0,
      currentProgress.totalPoints - removedPoints,
    );
    const allScores = filteredHistory.map((h) => h.score);
    const newAverageScore =
      allScores.length > 0
        ? Math.round(
            allScores.reduce((sum, s) => sum + s, 0) / allScores.length,
          )
        : 0;

    // 해금된 난이도 재계산 제거 (난이도 미사용)
    const newProgress: UserProgress = {
      averageScore: newAverageScore,
      totalPoints: newTotalPoints,
      completedSubjects: currentProgress.completedSubjects.filter((subject) => {
        if (selectedSubjectToReset === "railway") {
          return !subject.includes("철도");
        }
        return true;
      }),
      questionHistory: filteredHistory,
    };

    ProgressManager.saveUserProgress(newProgress);

    // UI 업데이트
    setUserProgress({
      averageScore: newProgress.averageScore,
      totalPoints: newProgress.totalPoints,
      completedSubjects: newProgress.completedSubjects,
      questionHistory: newProgress.questionHistory,
    });

    setShowResetModal(false);
    setSelectedSubjectToReset(null);
  };

  // 초기화 취소 핸들러
  const handleResetCancel = () => {
    setShowResetModal(false);
    setSelectedSubjectToReset(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-12 py-12">
        {/* 메인 제목 */}
        <div className=" mb-16">
          <h1 className="text-center font-bold text-red-600 mb-4">
            공부시작해!!
          </h1>
          <p className="text-lg text-gray-600 text-center">
            반복적인 학습을 통해 철도법령을 마스터하세요
          </p>
        </div>

        {/* 통계 버튼 */}
        <div className="mb-12 text-center">
          <button
            onClick={() => setShowStatsModal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg"
          >
            📊 상세 통계 보기
          </button>
        </div>

        {/* 학습 시작 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-200 cursor-pointer text-center"
              onClick={() => handleSubjectSelect(subject)}
            >
              {/* 아이콘 */}
              <div className="mb-6">
                <div
                  className={`w-20 h-20 ${subject.color} rounded-full flex items-center justify-center text-white text-4xl mx-auto`}
                >
                  {subject.icon}
                </div>
              </div>

              {/* 제목 */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {subject.name}
              </h2>

              {/* 설명 */}
              <p className="text-gray-600 mb-6 text-center">
                {subject.description}
              </p>

              {/* 버튼들 */}
              <div className="space-y-3">
                <button
                  className={`w-full py-3 px-6 ${subject.color} text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity`}
                >
                  시작하기 →
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetClick(subject.type);
                  }}
                  className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg font-medium text-sm hover:bg-gray-600 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            포인트: {userProgress.totalPoints}
          </p>
        </div>
      </main>

      {/* 통계 모달 */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">상세 통계</h2>
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setSelectedStatsSubject(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 과목 선택 */}
              {!selectedStatsSubject ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-6">
                    통계를 볼 과목을 선택하세요
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* 철도법령 */}
                    <button
                      onClick={() => setSelectedStatsSubject("railway")}
                      className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-colors"
                    >
                      <div className="text-4xl mb-3">🚂</div>
                      <div className="font-semibold text-gray-800 text-lg mb-2">
                        철도법령
                      </div>
                      <div className="text-sm text-gray-600">
                        철도법령 관련 통계 보기
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* 뒤로가기 버튼 */}
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedStatsSubject(null)}
                      className="text-blue-500 hover:text-blue-700 mb-4 flex items-center"
                    >
                      ← 과목 선택으로 돌아가기
                    </button>
                    <h3 className="text-lg font-semibold text-gray-700">
                      철도법령 상세 통계
                    </h3>
                  </div>

                  {/* 통계 내용: 과목별 풀이 횟수·평균만 표시 (난이도 구분 없음) */}
                  <div className="space-y-6">
                    {selectedStatsSubject === "railway"
                      ? [
                          {
                            name: "철도산업발전기본법(기본법+시행령)",
                            icon: "🏛️",
                            color: "bg-red-100 border-red-200",
                            subjectName: "철도산업발전기본법(기본법+시행령)",
                          },
                          {
                            name: "철도산업법(기본법+시행령)",
                            icon: "🚂",
                            color: "bg-blue-100 border-blue-200",
                            subjectName: "철도산업법(기본법+시행령)",
                          },
                          {
                            name: "철도공사법(기본법+시행령)",
                            icon: "🏢",
                            color: "bg-green-100 border-green-200",
                            subjectName: "철도공사법(기본법+시행령)",
                          },
                          {
                            name: "전체 통합",
                            icon: "📚",
                            color: "bg-purple-100 border-purple-200",
                            subjectName: "전체 통합",
                          },
                        ].map((law) => {
                          const progress = ProgressManager.getSubjectProgress(
                            law.subjectName,
                          );
                          return (
                            <div
                              key={law.name}
                              className={`rounded-lg border-2 ${law.color} p-6`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div className="text-3xl mr-3">
                                    {law.icon}
                                  </div>
                                  <h4 className="text-xl font-bold text-gray-800">
                                    {law.name}
                                  </h4>
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                  <div>풀이: {progress.totalQuestions}회</div>
                                  <div>평균: {progress.averageScore}점</div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 초기화 확인 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              {/* 모달 헤더 */}
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  데이터 초기화
                </h2>
                <p className="text-gray-600">
                  모든 데이터 및 해당과목으로 얻은 포인트는 없어집니다
                </p>
              </div>

              {/* 확인 메시지 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">
                  <strong>주의:</strong> 이 작업은 되돌릴 수 없습니다. 철도법령{" "}
                  관련 모든 학습 데이터가 삭제됩니다.
                </p>
              </div>

              {/* 버튼들 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleResetCancel}
                  className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleResetConfirm}
                  className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  예, 초기화합니다
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
