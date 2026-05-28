import { useState, useRef } from "react";

const API_BASE = "http://localhost:8000";

const initialData = {
  personal_info: { full_name: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  job_target: "Full Stack Developer"
};

const skillSuggestions = ["Python","React","Node.js","FastAPI","MongoDB","PostgreSQL","Docker","AWS","Git","JavaScript","TypeScript","Tailwind CSS","Redis","GraphQL","REST API","CI/CD","Linux","Flask","Django","Next.js"];

export default function App() {
  const [data, setData] = useState(initialData);
  const [step, setStep] = useState(0);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState({});
  const [activeTab, setActiveTab] = useState("edit");
  const [toast, setToast] = useState(null);
  const [expList, setExpList] = useState([]);
  const [eduList, setEduList] = useState([]);
  const [projList, setProjList] = useState([]);
  const [newExp, setNewExp] = useState({ company: "", role: "", duration: "", description: "" });
  const [newEdu, setNewEdu] = useState({ institution: "", degree: "", year: "", grade: "" });
  const [newProj, setNewProj] = useState({ name: "", tech_stack: "", description: "", github_link: "" });

  const steps = ["Personal Info", "Summary", "Experience", "Education", "Skills", "Projects", "Export"];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updatePersonal = (k, v) => setData(d => ({ ...d, personal_info: { ...d.personal_info, [k]: v } }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !data.skills.includes(s)) {
      setData(d => ({ ...d, skills: [...d.skills, s] }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => setData(d => ({ ...d, skills: d.skills.filter(s => s !== skill) }));

  const addExp = () => {
    if (!newExp.company || !newExp.role) return;
    const updated = [...expList, newExp];
    setExpList(updated);
    setData(d => ({ ...d, experience: updated }));
    setNewExp({ company: "", role: "", duration: "", description: "" });
  };

  const addEdu = () => {
    if (!newEdu.institution || !newEdu.degree) return;
    const updated = [...eduList, newEdu];
    setEduList(updated);
    setData(d => ({ ...d, education: updated }));
    setNewEdu({ institution: "", degree: "", year: "", grade: "" });
  };

  const addProj = () => {
    if (!newProj.name || !newProj.tech_stack) return;
    const updated = [...projList, newProj];
    setProjList(updated);
    setData(d => ({ ...d, projects: updated }));
    setNewProj({ name: "", tech_stack: "", description: "", github_link: "" });
  };

  const enhanceWithAI = async (type, text, setter) => {
    if (!text.trim()) return showToast("Please enter some text first", "error");
    setLoading(l => ({ ...l, [type]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/enhance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, type, job_target: data.job_target })
      });
      const json = await res.json();
      setter(json.enhanced_text);
      showToast("✨ AI enhanced successfully!");
    } catch {
      showToast("AI unavailable — add your GEMINI_API_KEY to backend/.env", "error");
    }
    setLoading(l => ({ ...l, [type]: false }));
  };

  const generateSummary = async () => {
    setLoading(l => ({ ...l, summary: true }));
    try {
      const res = await fetch(`${API_BASE}/api/generate-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      setData(d => ({ ...d, summary: json.summary }));
      showToast("✨ Summary generated!");
    } catch {
      showToast("AI unavailable — add your GEMINI_API_KEY to backend/.env", "error");
    }
    setLoading(l => ({ ...l, summary: false }));
  };

  const exportPDF = async () => {
    setLoading(l => ({ ...l, pdf: true }));
    try {
      const res = await fetch(`${API_BASE}/api/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.personal_info.full_name || "Resume"}_Resume.pdf`;
      a.click();
      showToast("📄 PDF downloaded!");
    } catch {
      showToast("Backend not running. Run: uvicorn main:app --reload", "error");
    }
    setLoading(l => ({ ...l, pdf: false }));
  };

  const pi = data.personal_info;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#0f0f13", color: "#e8e8f0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 24, zIndex: 1000,
          background: toast.type === "error" ? "#ff4444" : "#00c896",
          color: "#fff", padding: "12px 20px", borderRadius: 12,
          fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          animation: "slideIn 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1a1a24; } ::-webkit-scrollbar-thumb { background: #3a3a50; border-radius: 3px; }
        input, textarea, select { outline: none; }
        .step-btn:hover { background: #1e1e2e !important; }
        .skill-tag:hover { background: #ff6b6b !important; cursor: pointer; }
        .action-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .card { animation: fadeUp 0.4s ease; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#13131a", borderBottom: "1px solid #2a2a3a", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #6c63ff, #00c896)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>ResumeAI</div>
            <div style={{ fontSize: 11, color: "#666", marginTop: -2 }}>Powered by Gemini AI</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["edit", "preview"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
              background: activeTab === t ? "linear-gradient(135deg, #6c63ff, #5a52e0)" : "#1e1e2e",
              color: activeTab === t ? "#fff" : "#888"
            }}>{t === "edit" ? "✏️ Edit" : "👁 Preview"}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 69px)" }}>

        {/* Sidebar Steps */}
        <div style={{ width: 220, background: "#13131a", borderRight: "1px solid #2a2a3a", padding: "24px 12px", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, paddingLeft: 8 }}>Sections</div>
          {steps.map((s, i) => (
            <button key={i} className="step-btn" onClick={() => setStep(i)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
              borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
              background: step === i ? "linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,200,150,0.1))" : "transparent",
              color: step === i ? "#a78bfa" : "#888", fontWeight: step === i ? 600 : 400,
              fontSize: 13, marginBottom: 2, transition: "all 0.2s",
              borderLeft: step === i ? "3px solid #6c63ff" : "3px solid transparent"
            }}>
              <span style={{ fontSize: 16 }}>{["👤","📝","💼","🎓","🛠","🚀","📄"][i]}</span>
              {s}
            </button>
          ))}

          <div style={{ marginTop: "auto", paddingTop: 24 }}>
            <div style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,200,150,0.1))", borderRadius: 12, padding: 14, border: "1px solid rgba(108,99,255,0.2)" }}>
              <div style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600, marginBottom: 6 }}>🎯 Target Role</div>
              <input value={data.job_target} onChange={e => setData(d => ({ ...d, job_target: e.target.value }))}
                style={{ width: "100%", background: "transparent", border: "none", color: "#e8e8f0", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
                placeholder="e.g. Full Stack Developer" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          {activeTab === "edit" ? (
            <div className="card" style={{ maxWidth: 740, margin: "0 auto" }}>

              {/* Step 0 - Personal Info */}
              {step === 0 && (
                <Section title="Personal Information" icon="👤">
                  <Grid2>
                    <Field label="Full Name *" value={pi.full_name} onChange={v => updatePersonal("full_name", v)} placeholder="Danny Shetty" />
                    <Field label="Email *" value={pi.email} onChange={v => updatePersonal("email", v)} placeholder="danny@email.com" />
                    <Field label="Phone *" value={pi.phone} onChange={v => updatePersonal("phone", v)} placeholder="+91 9876543210" />
                    <Field label="Location *" value={pi.location} onChange={v => updatePersonal("location", v)} placeholder="Pune, Maharashtra" />
                    <Field label="LinkedIn" value={pi.linkedin} onChange={v => updatePersonal("linkedin", v)} placeholder="linkedin.com/in/dannyy69" />
                    <Field label="GitHub" value={pi.github} onChange={v => updatePersonal("github", v)} placeholder="github.com/Dannyy69" />
                  </Grid2>
                  <Field label="Portfolio" value={pi.portfolio} onChange={v => updatePersonal("portfolio", v)} placeholder="yourportfolio.com" />
                </Section>
              )}

              {/* Step 1 - Summary */}
              {step === 1 && (
                <Section title="Professional Summary" icon="📝">
                  <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
                    <AIButton loading={loading.summary} onClick={generateSummary} label="✨ Auto-Generate with AI" />
                  </div>
                  <textarea value={data.summary} onChange={e => setData(d => ({ ...d, summary: e.target.value }))}
                    placeholder="Write a powerful summary of your skills, experience, and goals..."
                    rows={6} style={{ ...textareaStyle, width: "100%" }} />
                  <AIButton loading={loading.summary_enhance} onClick={() => enhanceWithAI("summary", data.summary, v => setData(d => ({ ...d, summary: v })))} label="✨ Enhance Existing Text with AI" secondary />
                </Section>
              )}

              {/* Step 2 - Experience */}
              {step === 2 && (
                <Section title="Work Experience" icon="💼">
                  {expList.map((e, i) => (
                    <div key={i} style={cardItemStyle}>
                      <div style={{ fontWeight: 600, color: "#a78bfa" }}>{e.role}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>{e.company} · {e.duration}</div>
                      <div style={{ fontSize: 13, marginTop: 6, color: "#ccc", whiteSpace: "pre-wrap" }}>{e.description}</div>
                      <button onClick={() => { const u = expList.filter((_,j)=>j!==i); setExpList(u); setData(d=>({...d,experience:u})); }} style={removeBtn}>✕ Remove</button>
                    </div>
                  ))}
                  <div style={addCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#6c63ff", marginBottom: 12 }}>+ Add Experience</div>
                    <Grid2>
                      <Field label="Company" value={newExp.company} onChange={v => setNewExp(e => ({ ...e, company: v }))} placeholder="Google" />
                      <Field label="Role" value={newExp.role} onChange={v => setNewExp(e => ({ ...e, role: v }))} placeholder="Software Engineer" />
                      <Field label="Duration" value={newExp.duration} onChange={v => setNewExp(e => ({ ...e, duration: v }))} placeholder="Jan 2024 – Present" />
                    </Grid2>
                    <label style={labelStyle}>Description</label>
                    <textarea value={newExp.description} onChange={e => setNewExp(x => ({ ...x, description: e.target.value }))}
                      placeholder="Describe your responsibilities and achievements..." rows={3}
                      style={{ ...textareaStyle, width: "100%", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <AIButton loading={loading.experience} onClick={() => enhanceWithAI("experience", newExp.description, v => setNewExp(e => ({ ...e, description: v })))} label="✨ Enhance with AI" secondary />
                      <button onClick={addExp} style={primaryBtn}>+ Add</button>
                    </div>
                  </div>
                </Section>
              )}

              {/* Step 3 - Education */}
              {step === 3 && (
                <Section title="Education" icon="🎓">
                  {eduList.map((e, i) => (
                    <div key={i} style={cardItemStyle}>
                      <div style={{ fontWeight: 600, color: "#a78bfa" }}>{e.degree}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>{e.institution} · {e.year} {e.grade && `· ${e.grade}`}</div>
                      <button onClick={() => { const u = eduList.filter((_,j)=>j!==i); setEduList(u); setData(d=>({...d,education:u})); }} style={removeBtn}>✕ Remove</button>
                    </div>
                  ))}
                  <div style={addCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#6c63ff", marginBottom: 12 }}>+ Add Education</div>
                    <Grid2>
                      <Field label="Institution" value={newEdu.institution} onChange={v => setNewEdu(e => ({ ...e, institution: v }))} placeholder="MIT / SPPU" />
                      <Field label="Degree" value={newEdu.degree} onChange={v => setNewEdu(e => ({ ...e, degree: v }))} placeholder="B.Tech Computer Science" />
                      <Field label="Year" value={newEdu.year} onChange={v => setNewEdu(e => ({ ...e, year: v }))} placeholder="2024" />
                      <Field label="Grade / CGPA" value={newEdu.grade} onChange={v => setNewEdu(e => ({ ...e, grade: v }))} placeholder="8.5 CGPA" />
                    </Grid2>
                    <button onClick={addEdu} style={primaryBtn}>+ Add</button>
                  </div>
                </Section>
              )}

              {/* Step 4 - Skills */}
              {step === 4 && (
                <Section title="Technical Skills" icon="🛠">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {data.skills.map(s => (
                      <span key={s} className="skill-tag" onClick={() => removeSkill(s)} style={{
                        background: "rgba(108,99,255,0.2)", color: "#a78bfa", padding: "6px 14px",
                        borderRadius: 20, fontSize: 13, fontWeight: 500, border: "1px solid rgba(108,99,255,0.3)",
                        transition: "all 0.2s", cursor: "pointer"
                      }}>{s} ✕</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                    <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addSkill(skillInput)}
                      placeholder="Type a skill and press Enter..."
                      style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={() => addSkill(skillInput)} style={primaryBtn}>Add</button>
                  </div>
                  <div style={{ fontSize: 12, color: "#555", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick Add</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skillSuggestions.filter(s => !data.skills.includes(s)).map(s => (
                      <button key={s} onClick={() => addSkill(s)} style={{
                        background: "#1e1e2e", color: "#888", padding: "5px 12px", borderRadius: 16,
                        border: "1px solid #2a2a3a", cursor: "pointer", fontSize: 12, transition: "all 0.2s"
                      }}>{s}</button>
                    ))}
                  </div>
                </Section>
              )}

              {/* Step 5 - Projects */}
              {step === 5 && (
                <Section title="Projects" icon="🚀">
                  {projList.map((p, i) => (
                    <div key={i} style={cardItemStyle}>
                      <div style={{ fontWeight: 600, color: "#a78bfa" }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#00c896", marginTop: 2 }}>{p.tech_stack}</div>
                      <div style={{ fontSize: 13, marginTop: 6, color: "#ccc" }}>{p.description}</div>
                      {p.github_link && <a href={p.github_link} style={{ fontSize: 12, color: "#6c63ff" }}>{p.github_link}</a>}
                      <button onClick={() => { const u = projList.filter((_,j)=>j!==i); setProjList(u); setData(d=>({...d,projects:u})); }} style={removeBtn}>✕ Remove</button>
                    </div>
                  ))}
                  <div style={addCardStyle}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#6c63ff", marginBottom: 12 }}>+ Add Project</div>
                    <Grid2>
                      <Field label="Project Name" value={newProj.name} onChange={v => setNewProj(p => ({ ...p, name: v }))} placeholder="AI Resume Builder" />
                      <Field label="Tech Stack" value={newProj.tech_stack} onChange={v => setNewProj(p => ({ ...p, tech_stack: v }))} placeholder="React, Python, FastAPI" />
                      <Field label="GitHub Link" value={newProj.github_link} onChange={v => setNewProj(p => ({ ...p, github_link: v }))} placeholder="github.com/Dannyy69/..." />
                    </Grid2>
                    <label style={labelStyle}>Description</label>
                    <textarea value={newProj.description} onChange={e => setNewProj(p => ({ ...p, description: e.target.value }))}
                      placeholder="What does it do? What problem does it solve?" rows={3}
                      style={{ ...textareaStyle, width: "100%", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <AIButton loading={loading.project} onClick={() => enhanceWithAI("project", newProj.description, v => setNewProj(p => ({ ...p, description: v })))} label="✨ Enhance with AI" secondary />
                      <button onClick={addProj} style={primaryBtn}>+ Add</button>
                    </div>
                  </div>
                </Section>
              )}

              {/* Step 6 - Export */}
              {step === 6 && (
                <Section title="Export Your Resume" icon="📄">
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                      {pi.full_name || "Your Resume"} is Ready!
                    </div>
                    <div style={{ color: "#888", marginBottom: 32, fontSize: 14 }}>
                      Switch to Preview tab to see how it looks, then download as PDF
                    </div>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                      <button onClick={() => setActiveTab("preview")} style={{ ...primaryBtn, padding: "14px 28px", fontSize: 15 }}>
                        👁 Preview Resume
                      </button>
                      <button className="action-btn" onClick={exportPDF} disabled={loading.pdf} style={{
                        padding: "14px 28px", borderRadius: 12, border: "none", cursor: "pointer",
                        background: loading.pdf ? "#333" : "linear-gradient(135deg, #00c896, #00a87a)",
                        color: "#fff", fontWeight: 700, fontSize: 15, transition: "all 0.2s"
                      }}>
                        {loading.pdf ? "⏳ Generating..." : "📄 Download PDF"}
                      </button>
                    </div>
                    <div style={{ marginTop: 32, background: "#1a1a24", borderRadius: 12, padding: 20, textAlign: "left", border: "1px solid #2a2a3a" }}>
                      <div style={{ fontWeight: 600, marginBottom: 12, color: "#a78bfa" }}>📋 Resume Checklist</div>
                      {[
                        ["Personal Info", pi.full_name && pi.email && pi.phone],
                        ["Professional Summary", data.summary.length > 20],
                        ["Work Experience", data.experience.length > 0],
                        ["Education", data.education.length > 0],
                        ["Skills", data.skills.length >= 5],
                        ["Projects", data.projects.length > 0],
                      ].map(([label, done]) => (
                        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 14 }}>
                          <span style={{ color: done ? "#00c896" : "#ff6b6b" }}>{done ? "✅" : "❌"}</span>
                          <span style={{ color: done ? "#ccc" : "#888" }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              )}

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
                  style={{ ...primaryBtn, background: step === 0 ? "#1a1a24" : "#1e1e2e", color: step === 0 ? "#444" : "#888" }}>
                  ← Back
                </button>
                <button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))} disabled={step === steps.length - 1}
                  style={{ ...primaryBtn, background: "linear-gradient(135deg, #6c63ff, #5a52e0)" }}>
                  Next →
                </button>
              </div>
            </div>
          ) : (
            /* PREVIEW */
            <div style={{ maxWidth: 740, margin: "0 auto" }}>
              <div style={{
                background: "#fff", color: "#1a1a2e", borderRadius: 16, overflow: "hidden",
                boxShadow: "0 32px 80px rgba(0,0,0,0.5)", fontFamily: "Georgia, serif"
              }}>
                {/* Resume Header */}
                <div style={{ background: "#1a1a2e", color: "#fff", padding: "36px 40px 28px" }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
                    {pi.full_name || "Your Name"}
                  </div>
                  <div style={{ color: "#a78bfa", fontSize: 15, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
                    {data.job_target}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginTop: 14, fontSize: 13, color: "#ccc", fontFamily: "'DM Sans', sans-serif" }}>
                    {pi.email && <span>✉ {pi.email}</span>}
                    {pi.phone && <span>📞 {pi.phone}</span>}
                    {pi.location && <span>📍 {pi.location}</span>}
                    {pi.linkedin && <span>💼 {pi.linkedin}</span>}
                    {pi.github && <span>🔗 {pi.github}</span>}
                  </div>
                </div>

                <div style={{ padding: "32px 40px" }}>
                  {data.summary && (
                    <PreviewSection title="Professional Summary">
                      <p style={{ lineHeight: 1.7, color: "#444", margin: 0, fontSize: 14 }}>{data.summary}</p>
                    </PreviewSection>
                  )}

                  {data.skills.length > 0 && (
                    <PreviewSection title="Technical Skills">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {data.skills.map(s => (
                          <span key={s} style={{ background: "#f0eeff", color: "#6c63ff", padding: "4px 12px", borderRadius: 16, fontSize: 13, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{s}</span>
                        ))}
                      </div>
                    </PreviewSection>
                  )}

                  {data.experience.length > 0 && (
                    <PreviewSection title="Work Experience">
                      {data.experience.map((e, i) => (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "'DM Sans', sans-serif" }}>{e.role}</div>
                            <div style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif" }}>{e.duration}</div>
                          </div>
                          <div style={{ color: "#6c63ff", fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>{e.company}</div>
                          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{e.description}</div>
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {data.projects.length > 0 && (
                    <PreviewSection title="Projects">
                      {data.projects.map((p, i) => (
                        <div key={i} style={{ marginBottom: 14 }}>
                          <div style={{ fontWeight: 700, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                            {p.name} {p.github_link && <span style={{ color: "#6c63ff", fontSize: 12, fontWeight: 400 }}>— {p.github_link}</span>}
                          </div>
                          <div style={{ color: "#00a87a", fontSize: 12, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>{p.tech_stack}</div>
                          <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{p.description}</div>
                        </div>
                      ))}
                    </PreviewSection>
                  )}

                  {data.education.length > 0 && (
                    <PreviewSection title="Education">
                      {data.education.map((e, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{e.degree}</div>
                            <div style={{ fontSize: 13, color: "#666" }}>{e.institution}</div>
                          </div>
                          <div style={{ textAlign: "right", fontSize: 13, color: "#888" }}>
                            <div>{e.year}</div>
                            {e.grade && <div style={{ color: "#6c63ff" }}>{e.grade}</div>}
                          </div>
                        </div>
                      ))}
                    </PreviewSection>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button className="action-btn" onClick={exportPDF} disabled={loading.pdf} style={{
                  padding: "14px 36px", borderRadius: 12, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #00c896, #00a87a)",
                  color: "#fff", fontWeight: 700, fontSize: 15, transition: "all 0.2s"
                }}>
                  {loading.pdf ? "⏳ Generating PDF..." : "📄 Download PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
function Section({ title, icon, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0, color: "#fff" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function PreviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#6c63ff", marginBottom: 10 }}>{title}</div>
      <div style={{ borderTop: "2px solid #1a1a2e", paddingTop: 12 }}>{children}</div>
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>{children}</div>;
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...inputStyle, width: "100%" }} />
    </div>
  );
}

function AIButton({ loading, onClick, label, secondary }) {
  return (
    <button onClick={onClick} disabled={loading} className="action-btn" style={{
      padding: "8px 16px", borderRadius: 8, border: secondary ? "1px solid rgba(108,99,255,0.3)" : "none",
      cursor: loading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 13, transition: "all 0.2s",
      background: loading ? "#1e1e2e" : secondary ? "rgba(108,99,255,0.1)" : "linear-gradient(135deg, #6c63ff, #5a52e0)",
      color: loading ? "#555" : "#a78bfa"
    }}>
      {loading ? "⏳ Enhancing..." : label}
    </button>
  );
}

// Styles
const inputStyle = {
  background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 10,
  padding: "10px 14px", color: "#e8e8f0", fontSize: 14,
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box", transition: "border 0.2s"
};
const textareaStyle = {
  background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 10,
  padding: "10px 14px", color: "#e8e8f0", fontSize: 14, resize: "vertical",
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box"
};
const labelStyle = { display: "block", fontSize: 12, color: "#666", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 };
const primaryBtn = { padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, background: "linear-gradient(135deg, #6c63ff, #5a52e0)", color: "#fff", transition: "all 0.2s" };
const cardItemStyle = { background: "#1a1a24", border: "1px solid #2a2a3a", borderRadius: 12, padding: 16, marginBottom: 12, position: "relative" };
const addCardStyle = { background: "#13131a", border: "1px dashed #2a2a3a", borderRadius: 12, padding: 20, marginTop: 8 };
const removeBtn = { position: "absolute", top: 12, right: 12, background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", color: "#ff6b6b", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 11 };
