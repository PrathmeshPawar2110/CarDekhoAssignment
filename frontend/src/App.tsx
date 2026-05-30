import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Wizard } from "./pages/Wizard";
import { Results } from "./pages/Results";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/results" element={<Results />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
