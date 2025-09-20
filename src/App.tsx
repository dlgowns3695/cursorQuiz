import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import SubjectSelectionPage from "./pages/SubjectSelectionPage";
import DifficultySelectionPage from "./pages/quiz/DifficultySelectionPage";
import QuizPage from "./pages/quiz/QuizPage";
import ResultPage from "./pages/quiz/ResultPage";

function App() {
  return (
    <Router basename="/cursorQuiz">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/quiz/:subjectType/subjects"
          element={<SubjectSelectionPage />}
        />
        <Route
          path="/quiz/:subjectType/:subject/difficulty"
          element={<DifficultySelectionPage />}
        />
        <Route
          path="/quiz/:subjectType/:subject/:difficulty"
          element={<QuizPage />}
        />
        <Route
          path="/quiz/:subjectType/:subject/:difficulty/result"
          element={<ResultPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
