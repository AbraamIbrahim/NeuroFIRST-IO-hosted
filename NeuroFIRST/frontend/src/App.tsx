import "./App.css";
import { Routes, Route } from "react-router-dom";
import Triage from "./triage/Triage";
import Results from "./results/results";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Triage />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}