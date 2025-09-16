import React from "react";

const Header: React.FC = () => {
  return (
    <header className="bg-railway-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-railway-blue font-bold text-lg">🚂</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">철도법령 학습</h1>
              <p className="text-sm text-blue-200">한국철도공사</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">모바일 최적화</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

