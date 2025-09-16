import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-2xl">🚂</span>
            <span className="font-semibold">철도법령 학습 앱</span>
          </div>
          <p className="text-gray-400 text-sm mb-2">
            한국철도공사 철도법령 교육용 모바일 앱
          </p>
          <div className="text-gray-500 text-xs">
            <p>© 2024 한국철도공사. All rights reserved.</p>
            <p className="mt-1">모바일 최적화 버전</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

