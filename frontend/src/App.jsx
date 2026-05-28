import { useState } from "react";

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "", email: "", phone: "", location: "",
    linkedin: "", github: "", summary: "",
    skills: [], experience: [], education: [], projects: []
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f13",
      color: "#e8e8f0",
      fontFamily: "sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 24
    }}>
      ⚡ ResumeAI is Working!
    </div>
  );
}