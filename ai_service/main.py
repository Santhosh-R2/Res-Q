from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from classifier import classifier
import uvicorn

app = FastAPI(title="ResQ AI Disaster Detection Service")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "ResQ AI Service is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    result = classifier.predict(contents)
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
