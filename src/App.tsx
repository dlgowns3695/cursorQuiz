import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DifficultySelectionPage from "./pages/quiz/DifficultySelectionPage";
import QuizPage from "./pages/quiz/QuizPage";
import ResultPage from "./pages/quiz/ResultPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/quiz/:subjectType/difficulty"
          element={<DifficultySelectionPage />}
        />
        <Route path="/quiz/:subjectType/:difficulty" element={<QuizPage />} />
        <Route
          path="/quiz/:subjectType/:difficulty/result"
          element={<ResultPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
