import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 사용자 점수 및 진도 관리 인터페이스
interface UserProgress {
  averageScore: number;
  totalPoints: number;
  unlockedDifficulties: string[];
  completedSubjects: string[];
  difficultyStats: {
    [difficulty: string]: {
      attempts: number;
      totalScore: number;
      averageScore: number;
    };
  };
}

// 과목 정보 인터페이스
interface Subject {
  id: string;
  name: string;
  type: "management" | "railway";
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
    unlockedDifficulties: ["매우쉬움"], // 기본적으로 매우쉬움만 해금
    completedSubjects: [],
    difficultyStats: {},
  });

  // 통계 모달 상태
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedSubjectForStats, setSelectedSubjectForStats] = useState<
    string | null
  >(null);

  // 난이도 해금 조건
  const difficultyUnlockConditions = {
    쉬움: { minAttempts: 5, minAverage: 60 },
    중간: { minAttempts: 10, minAverage: 70 },
    어려움: { minAttempts: 15, minAverage: 80 },
    매우어려움: { minAttempts: 20, minAverage: 90 },
  };

  // 과목 정보 정의
  const subjects: Subject[] = [
    {
      id: "management",
      name: "경영학 시작하기",
      type: "management",
      subjects: ["경영학원론", "인사관리", "마케팅관리", "전체 통합"],
      description: "경영학 기초부터 고급까지 체계적 학습",
      icon: "📊",
      color: "bg-blue-500",
    },
    {
      id: "railway",
      name: "철도법령 시작하기",
      type: "railway",
      subjects: [
        "철도산업발전기본법",
        "철도산업발전기본법 시행령",
        "철도산업법",
        "철도산업법 시행령",
        "철도공사법",
        "철도공사법 시행령",
        "전체 통합",
      ],
      description: "철도 관련 법령 완전 정복",
      icon: "🚂",
      color: "bg-red-500",
    },
  ];

  // 난이도 해금 체크 함수
  const checkDifficultyUnlock = (difficulty: string) => {
    const condition =
      difficultyUnlockConditions[
        difficulty as keyof typeof difficultyUnlockConditions
      ];
    if (!condition) return false;

    const stats = userProgress.difficultyStats["매우쉬움"] || {
      attempts: 0,
      totalScore: 0,
      averageScore: 0,
    };
    return (
      stats.attempts >= condition.minAttempts &&
      stats.averageScore >= condition.minAverage
    );
  };

  // 컴포넌트 마운트 시 로컬 스토리지에서 사용자 진도 로드
  useEffect(() => {
    const savedProgress = localStorage.getItem("userProgress");
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        // 안전한 데이터 구조로 설정
        const newProgress = {
          averageScore: parsedProgress.averageScore || 0,
          totalPoints: parsedProgress.totalPoints || 0,
          unlockedDifficulties: parsedProgress.unlockedDifficulties || [
            "매우쉬움",
          ],
          completedSubjects: parsedProgress.completedSubjects || [],
          difficultyStats: parsedProgress.difficultyStats || {},
        };

        // 해금된 난이도 체크
        const unlockedDifficulties = ["매우쉬움"];
        Object.keys(difficultyUnlockConditions).forEach((difficulty) => {
          if (checkDifficultyUnlock(difficulty)) {
            unlockedDifficulties.push(difficulty);
          }
        });

        newProgress.unlockedDifficulties = unlockedDifficulties;
        setUserProgress(newProgress);
      } catch (error) {
        console.error("사용자 진도 데이터 파싱 오류:", error);
        // 기본값으로 설정
        setUserProgress({
          averageScore: 0,
          totalPoints: 0,
          unlockedDifficulties: ["매우쉬움"],
          completedSubjects: [],
          difficultyStats: {},
        });
      }
    }
  }, []);

  // 과목 선택 핸들러
  const handleSubjectSelect = (subject: Subject) => {
    // 선택한 과목 알럿창 표시
    // alert(`선택한 과목: ${subject.name}`);

    // 난이도 선택 페이지로 이동
    navigate(`/quiz/${subject.type}/difficulty`);
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
          <p className="text-lg text-gray-600">
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

              {/* 시작하기 버튼 */}
              <button
                className={`w-full py-3 px-6 ${subject.color} text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity`}
              >
                시작하기 →
              </button>
            </div>
          ))}
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            포인트: {userProgress.totalPoints} | 해금된 난이도:{" "}
            {userProgress.unlockedDifficulties.length}개
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
                    setSelectedSubjectForStats(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 과목 선택 */}
              {!selectedSubjectForStats ? (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    통계를 볼 과목을 선택하세요
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubjectForStats(subject.id)}
                        className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        <div className="text-2xl mb-2">{subject.icon}</div>
                        <div className="font-semibold text-gray-800">
                          {subject.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  {/* 과목별 난이도 통계 */}
                  <div className="mb-4">
                    <button
                      onClick={() => setSelectedSubjectForStats(null)}
                      className="text-blue-500 hover:text-blue-700 mb-4"
                    >
                      ← 과목 선택으로 돌아가기
                    </button>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      {
                        subjects.find((s) => s.id === selectedSubjectForStats)
                          ?.name
                      }{" "}
                      통계
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {["매우쉬움", "쉬움", "중간", "어려움", "매우어려움"].map(
                      (difficulty) => {
                        const stats = userProgress.difficultyStats[
                          difficulty
                        ] || {
                          attempts: 0,
                          totalScore: 0,
                          averageScore: 0,
                        };
                        const isUnlocked =
                          userProgress.unlockedDifficulties.includes(
                            difficulty
                          );

                        return (
                          <div
                            key={difficulty}
                            className={`bg-gray-50 rounded-lg p-4 text-center ${
                              isUnlocked
                                ? "border-2 border-green-200"
                                : "border-2 border-gray-200 opacity-60"
                            }`}
                          >
                            <div className="text-lg font-bold text-gray-800 mb-2">
                              {difficulty}
                              {isUnlocked ? " ✓" : " 🔒"}
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>풀이: {stats.attempts}번</div>
                              <div>
                                평균:{" "}
                                {Number(stats.averageScore || 0).toFixed(2)}점
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
