from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import io
from fastapi.responses import StreamingResponse
import json

app = FastAPI(title="AI Resume Builder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-gemini-api-key-here")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash")


class PersonalInfo(BaseModel):
    full_name: str
    email: str
    phone: str
    location: str
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    portfolio: Optional[str] = ""


class Experience(BaseModel):
    company: str
    role: str
    duration: str
    description: str


class Education(BaseModel):
    institution: str
    degree: str
    year: str
    grade: Optional[str] = ""


class Project(BaseModel):
    name: str
    tech_stack: str
    description: str
    github_link: Optional[str] = ""


class ResumeData(BaseModel):
    personal_info: PersonalInfo
    summary: Optional[str] = ""
    experience: List[Experience] = []
    education: List[Education] = []
    skills: List[str] = []
    projects: List[Project] = []
    job_target: Optional[str] = ""


class AIEnhanceRequest(BaseModel):
    text: str
    type: str  # "summary", "experience", "project"
    job_target: Optional[str] = "Software Developer"


@app.get("/")
def root():
    return {"message": "AI Resume Builder API is running 🚀"}


@app.post("/api/enhance")
async def enhance_with_ai(request: AIEnhanceRequest):
    try:
        prompts = {
            "summary": f"""You are an expert resume writer. Rewrite this professional summary to be powerful, concise, and ATS-optimized for a {request.job_target} role. Make it 3-4 sentences max. Use strong action words. Return only the improved text, nothing else.

Original: {request.text}""",

            "experience": f"""You are an expert resume writer. Rewrite this job experience description to be impactful for a {request.job_target} role. Use strong action verbs, add quantifiable metrics where possible, make it ATS-friendly. Return 3-4 bullet points starting with •. Return only the bullet points, nothing else.

Original: {request.text}""",

            "project": f"""You are an expert resume writer. Rewrite this project description to highlight technical skills and impact for a {request.job_target} role. Make it 2-3 sentences, mention the tech stack impact. Return only the improved text, nothing else.

Original: {request.text}"""
        }

        prompt = prompts.get(request.type, prompts["summary"])
        response = model.generate_content(prompt)
        return {"enhanced_text": response.text.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-summary")
async def generate_summary(resume: ResumeData):
    try:
        skills_str = ", ".join(resume.skills[:10]) if resume.skills else "various technologies"
        exp_str = resume.experience[0].role if resume.experience else "software development"

        prompt = f"""Write a powerful professional summary for a resume. 
Name: {resume.personal_info.full_name}
Target Role: {resume.job_target or 'Full Stack Developer'}
Skills: {skills_str}
Experience: {exp_str}

Write 3-4 sentences that are ATS-optimized, use strong action words, and highlight value. Return only the summary text."""

        response = model.generate_content(prompt)
        return {"summary": response.text.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export-pdf")
async def export_pdf(resume: ResumeData):
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=0.6 * inch,
            leftMargin=0.6 * inch,
            topMargin=0.6 * inch,
            bottomMargin=0.6 * inch
        )

        styles = getSampleStyleSheet()
        story = []

        # Custom styles
        name_style = ParagraphStyle(
            'Name', fontSize=22, fontName='Helvetica-Bold',
            textColor=colors.HexColor('#1a1a2e'), alignment=TA_CENTER, spaceAfter=4
        )
        contact_style = ParagraphStyle(
            'Contact', fontSize=9, fontName='Helvetica',
            textColor=colors.HexColor('#555555'), alignment=TA_CENTER, spaceAfter=2
        )
        section_style = ParagraphStyle(
            'Section', fontSize=11, fontName='Helvetica-Bold',
            textColor=colors.HexColor('#1a1a2e'), spaceBefore=12, spaceAfter=4
        )
        body_style = ParagraphStyle(
            'Body', fontSize=9.5, fontName='Helvetica',
            textColor=colors.HexColor('#333333'), spaceAfter=3, leading=14
        )
        sub_style = ParagraphStyle(
            'Sub', fontSize=9, fontName='Helvetica-Bold',
            textColor=colors.HexColor('#1a1a2e'), spaceAfter=2
        )

        # Header
        story.append(Paragraph(resume.personal_info.full_name, name_style))

        contact_parts = [resume.personal_info.email, resume.personal_info.phone, resume.personal_info.location]
        if resume.personal_info.linkedin:
            contact_parts.append(resume.personal_info.linkedin)
        if resume.personal_info.github:
            contact_parts.append(resume.personal_info.github)
        story.append(Paragraph(" | ".join(contact_parts), contact_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#1a1a2e'), spaceAfter=8))

        # Summary
        if resume.summary:
            story.append(Paragraph("PROFESSIONAL SUMMARY", section_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))
            story.append(Paragraph(resume.summary, body_style))

        # Skills
        if resume.skills:
            story.append(Paragraph("TECHNICAL SKILLS", section_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))
            story.append(Paragraph(", ".join(resume.skills), body_style))

        # Experience
        if resume.experience:
            story.append(Paragraph("WORK EXPERIENCE", section_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))
            for exp in resume.experience:
                story.append(Paragraph(f"{exp.role} — {exp.company} | {exp.duration}", sub_style))
                story.append(Paragraph(exp.description, body_style))
                story.append(Spacer(1, 4))

        # Projects
        if resume.projects:
            story.append(Paragraph("PROJECTS", section_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))
            for proj in resume.projects:
                link = f" | <a href='{proj.github_link}'>{proj.github_link}</a>" if proj.github_link else ""
                story.append(Paragraph(f"{proj.name} | {proj.tech_stack}{link}", sub_style))
                story.append(Paragraph(proj.description, body_style))
                story.append(Spacer(1, 4))

        # Education
        if resume.education:
            story.append(Paragraph("EDUCATION", section_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#cccccc'), spaceAfter=6))
            for edu in resume.education:
                grade_str = f" | {edu.grade}" if edu.grade else ""
                story.append(Paragraph(f"{edu.degree} — {edu.institution} | {edu.year}{grade_str}", body_style))

        doc.build(story)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={resume.personal_info.full_name.replace(' ', '_')}_Resume.pdf"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
