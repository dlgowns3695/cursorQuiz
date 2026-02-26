import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import SubjectSelectionPage from "./pages/SubjectSelectionPage";
import QuizPage from "./pages/quiz/QuizPage";

function App() {
  return (
    <Router basename="/cursorQuiz">
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/quiz/:subjectType/subjects"
          element={<SubjectSelectionPage />}
        />
        <Route path="/quiz/:subjectType/:subject" element={<QuizPage />} />
      </Routes>
    </Router>
  );
}

export default App;
