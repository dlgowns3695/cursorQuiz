import React from "react";

const MainMenu: React.FC = () => {
  const menuItems = [
    {
      id: 1,
      title: "철도법 기본",
      description: "철도법의 기본 개념과 원칙",
      icon: "📚",
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "안전관리규정",
      description: "철도 안전관리 관련 규정",
      icon: "🛡️",
      color: "bg-green-500",
    },
    {
      id: 3,
      title: "운행규정",
      description: "철도 운행 및 운영 규정",
      icon: "🚄",
      color: "bg-purple-500",
    },
    {
      id: 4,
      title: "시설관리규정",
      description: "철도 시설 관리 및 유지보수",
      icon: "🔧",
      color: "bg-orange-500",
    },
    {
      id: 5,
      title: "퀴즈 테스트",
      description: "학습한 내용을 테스트해보세요",
      icon: "📝",
      color: "bg-red-500",
    },
    {
      id: 6,
      title: "진도 관리",
      description: "학습 진도 확인 및 관리",
      icon: "📊",
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          철도법령 학습에 오신 것을 환영합니다
        </h2>
        <p className="text-gray-600">
          체계적인 학습을 통해 철도법령을 마스터하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex items-start space-x-4">
              <div
                className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white text-2xl`}
              >
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">학습 팁</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• 매일 조금씩 꾸준히 학습하세요</li>
          <li>• 퀴즈를 통해 이해도를 확인하세요</li>
          <li>• 중요한 내용은 메모해두세요</li>
          <li>• 진도 관리를 통해 학습 계획을 세우세요</li>
        </ul>
      </div>
    </div>
  );
};

export default MainMenu;

