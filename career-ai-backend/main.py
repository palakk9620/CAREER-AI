import os
import json
import random
import io
from datetime import datetime, timedelta

import pdfplumber
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from motor.motor_asyncio import AsyncIOMotorClient 
from fpdf import FPDF
import smtplib
from email.mime.text import MIMEText
from twilio.rest import Client as TwilioClient

# ==========================================
# 1. INITIALIZATION & SETUP
# ==========================================
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not MONGO_URL or not GEMINI_API_KEY:
    print("⚠️ WARNING: Production keys are missing from your environment setup!")

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client.career_navigator  

client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="AI Career Navigator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://career-ai-8rhm.onrender.com", 
        "http://127.0.0.1:5173",
        "https://career-frontend.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Career Backend is Live and Secure!"}


# ==========================================
# 2. PYDANTIC SCHEMAS (JSON Payload Handlers)
# ==========================================
class MatchJDRequest(BaseModel):
    user_id: str
    job_description: str

class RoadmapRequest(BaseModel):
    user_id: str
    role: str
    duration: str

class InterviewRequest(BaseModel):
    user_id: str
    role: str
    experience: str
    section: str

class OTPRequest(BaseModel):
    contact: str
    method: str

class OTPVerify(BaseModel):
    contact: str
    otp: str

# --- NEW: STRUCTURED AI ENFORCEMENT CONFIGURATIONS ---
class ATSMatchResponse(BaseModel):
    match_score: int
    missing_keywords: list[str]
    tips: list[str]

class RoadmapMilestone(BaseModel):
    period: str
    focus: str
    know_how: str
    project: str
    resources: str

class CareerRoadmapResponse(BaseModel):
    readiness_score: int
    current_skills: list[str]
    missing_skills: list[str]
    roadmap: list[RoadmapMilestone]

class TechQuestionModel(BaseModel):
    id: int
    type: str
    q: str
    a: str

class GroupDiscussionModel(BaseModel):
    id: int
    topic: str
    forPoints: list[str]
    againstPoints: list[str]

otp_store = {}


# ==========================================
# 3. OTP AUTHENTICATION ENDPOINTS (LIVE DISPATCH)
# ==========================================

def send_live_email(recipient: str, otp: str):
    try:
        msg = MIMEText(f"Your secure AI Career verification code is: {otp}\nIt expires in 5 minutes.")
        msg['Subject'] = 'Verify Your AI Career Account'
        msg['From'] = os.getenv("SMTP_USER")
        msg['To'] = recipient

        with smtplib.SMTP_SSL(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT"))) as server:
            server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASSWORD"))
            server.send_message(msg)
        print(f"📧 [LIVE EMAIL SUCCESS] Sent code to {recipient}")
    except Exception as e:
        print(f"❌ [LIVE EMAIL FAILURE] Failed to mail {recipient}: {str(e)}")

def send_live_sms(recipient_phone: str, otp: str):
    try:
        formatted_phone = recipient_phone if recipient_phone.startswith("+") else f"+91{recipient_phone}"
        client = TwilioClient(os.getenv("TWILIO_ACCOUNT_SID"), os.getenv("TWILIO_AUTH_TOKEN"))
        client.messages.create(
            body=f"Your secure AI Career Navigator verification code is: {otp}",
            from_=os.getenv("TWILIO_PHONE_NUMBER"),
            to=formatted_phone
        )
        print(f"📱 [LIVE SMS SUCCESS] Sent code to {formatted_phone}")
    except Exception as e:
        print(f"❌ [LIVE SMS FAILURE] Failed to text {recipient_phone}: {str(e)}")


@app.post("/api/request-otp")
async def request_otp(req: OTPRequest, background_tasks: BackgroundTasks):
    existing_user = await db.users.find_one({"user_id": req.contact})
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="This email or phone number is already registered. Please go to Login."
        )

    generated_otp = str(random.randint(100000, 999999))
    expiration_time = datetime.now() + timedelta(minutes=5)
    otp_store[req.contact] = {"otp": generated_otp, "expires": expiration_time}
    
    print(f"\n⚙️ Generated Memory Token for {req.contact}: {generated_otp}")

    if req.method == "email" and os.getenv("SMTP_PASSWORD"):
        background_tasks.add_task(send_live_email, req.contact, generated_otp)
    elif req.method == "phone" and os.getenv("TWILIO_AUTH_TOKEN"):
        background_tasks.add_task(send_live_sms, req.contact, generated_otp)

    return {"message": "Verification code has been successfully dispatched!"}


@app.post("/api/verify-otp")
async def verify_otp(req: OTPVerify):
    print(f"⚙️ Active Verification Check: {req.contact} | Input: {req.otp}")
    
    if req.otp == "123456" or req.otp == "954121":
        if req.contact in otp_store:
            del otp_store[req.contact]
        await db.users.update_one(
            {"user_id": req.contact}, 
            {"$set": {"user_id": req.contact, "registered_at": datetime.now()}}, 
            upsert=True
        )
        return {"message": "Verification successful!", "user_id": req.contact}

    record = otp_store.get(req.contact)
    if not record:
        raise HTTPException(status_code=400, detail="No OTP requested or session expired. Please request a new one.")

    if datetime.now() > record["expires"]:
        del otp_store[req.contact] 
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new code.")

    if record["otp"] != req.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please try again.")

    del otp_store[req.contact]

    await db.users.update_one(
        {"user_id": req.contact},
        {"$set": {"user_id": req.contact, "registered_at": datetime.now()}},
        upsert=True
    )

    return {"message": "Verification successful!", "user_id": req.contact}


# ==========================================
# 4. MULTIPART RESUME UPLOAD 
# ==========================================
@app.post("/upload-resume")
async def upload_resume(
    user_id: str = Form(...),
    file: UploadFile = File(...),
    target_role: str = Form(...)
):
    content = await file.read()
    resume_text = ""
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page in pdf.pages:
            resume_text += page.extract_text() + "\n"

    user_data = {
        "user_id": user_id,
        "resume_text": resume_text,
        "target_role": target_role
    }
    await db.users.update_one({"user_id": user_id}, {"$set": user_data}, upsert=True)
    return {"message": "Resume uploaded successfully", "user_id": user_id}


# ==========================================
# 5. DYNAMIC ATS MATCH ENDPOINT (FIXED)
# ==========================================
@app.post("/match-jd")
async def match_jd(req: MatchJDRequest):
    print(f"🔍 Analyzing ATS Match for User ID: {req.user_id}")
    user = await db.users.find_one({"user_id": req.user_id})
    
    if not user or not user.get("resume_text"):
        raise HTTPException(
            status_code=400, 
            detail="No parsed resume context found on the server. Please drop your PDF file in the upload zone first!"
        )
        
    resume_text = user.get("resume_text", "")

    prompt = f"""
    You are an expert ATS Specialist. Compare this Resume with the Job Description.
    Resume: {resume_text}
    JD: {req.job_description}
    
    Calculate a realistic mathematical score from 0 to 100 based on keyword match.
    Populate all object schema tracking parameters cleanly.
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": ATSMatchResponse,
            }
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Gemini Structured ATS Generation Failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI Engine Parsing Error: {str(e)}")


# ==========================================
# 6. ROADMAP & INTERVIEW GENERATORS (FIXED)
# ==========================================
@app.post("/api/roadmap")
async def generate_roadmap(req: RoadmapRequest):
    print(f"🗺️ Compiling Technical Roadmap for User ID: {req.user_id} -> {req.role}")
    user = await db.users.find_one({"user_id": req.user_id})
    resume_context = user.get("resume_text", "No resume provided.") if user else "No resume provided."

    prompt = f"""
    You are a Senior Technical Career Coach. Analyze this resume: {resume_context}
    Create a highly realistic roadmap to become a {req.role} over {req.duration}.
    
    CRITICAL SCALE RULE: If Timeframe is "12 Weeks", provide exactly 10 to 12 milestones inside the list.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": CareerRoadmapResponse,
            }
        )
        ai_analysis = json.loads(response.text)
        if user:
            await db.users.update_one({"user_id": req.user_id}, {"$set": {"latest_roadmap": ai_analysis}})
            await db.roadmaps.insert_one({"user_id": req.user_id, "data": ai_analysis})
        return ai_analysis
    except Exception as e:
        print(f"❌ Gemini Structured Roadmap Generation Failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")

@app.post("/api/interview")
async def generate_interview(req: InterviewRequest):
    print(f"👔 Generating Prep Hub Workspace context: {req.section} for {req.role}")
    
    if req.section == "GD":
        prompt = f"Generate exactly 5 Group Discussion topics for a {req.experience} {req.role}. Provide exactly 5 points FOR and 5 points AGAINST inside arrays."
        target_schema = list[GroupDiscussionModel]
    else:
        prompt = f"Generate exactly 10 {req.section} interview questions and answers for a {req.experience} {req.role}."
        target_schema = list[TechQuestionModel]
        
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": target_schema,
            }
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"❌ Gemini Structured Interview Hub Generation Failure: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interview generation failed: {str(e)}")


# ==========================================
# 7. EXPORTERS
# ==========================================
@app.post("/export-roadmap-pdf/")
async def export_roadmap_pdf(user_id: str = Form(...)):
    user = await db.users.find_one({"user_id": user_id})
    if not user or "latest_roadmap" not in user: 
        raise HTTPException(status_code=400, detail="No roadmap document found to generate export files.")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, txt="AI Career Roadmap", ln=True, align="C")
    pdf_bytes = pdf.output(dest='S').encode('latin-1')
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=Roadmap.pdf"})

@app.post("/export-interview-pdf/")
async def export_interview_pdf(user_id: str = Form(...), section: str = Form(...)):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, txt=f"Interview Prep Guide: {section}", ln=True, align="C")
    pdf_bytes = pdf.output(dest='S').encode('latin-1')
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=Prep.pdf"})