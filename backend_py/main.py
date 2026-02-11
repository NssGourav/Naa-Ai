import os
import shutil
import traceback
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from nlp_pipeline import NLPPipeline
from storage import Storage

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Newton School Lecture Intelligence")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

nlp = NLPPipeline()
storage = Storage()
UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@app.get("/")
async def root():
    return {"message": "Newton School Lecture Intelligence API is running"}

@app.post("/api/ingest")
async def ingest_lecture(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        structured_data = nlp.extract_and_structure(file_path)
        

        analysis = {
            "title": structured_data["title"],
            "summary": nlp.get_summary(structured_data["all_text"]),
            "keywords": nlp.get_keywords(structured_data["all_text"]),
            "notes": nlp.generate_exam_notes(structured_data),
            "all_text": structured_data["all_text"],
            "pages": structured_data["pages"]
        }
        
        lecture_id = storage.save_lecture(analysis)
        
        return {"lecture_id": lecture_id, "title": analysis["title"]}
    
    except Exception as e:
        logger.error(f"Ingest failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path) 

@app.get("/api/lecture/{lecture_id}")
async def get_lecture(lecture_id: str):
    data = storage.get_lecture(lecture_id)
    if not data:
        raise HTTPException(status_code=404, detail="Lecture not found")
    return data

@app.get("/api/lectures")
async def list_lectures():
    return storage.list_lectures()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
