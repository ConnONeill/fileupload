from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from services.uploader import FileUploadService 
import os
from fastapi.middleware.cors import CORSMiddleware


appman = FastAPI()

# Allow requests from React dev server
origins = [
    "http://localhost:5173",  # React dev server
]

appman.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # can set ["*"] for all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



#root endpoint: simple message showing endpoints are working
@appman.get("/")
async def root():
    return {"message": "Upload backend ready"}


@appman.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    return await FileUploadService.save_file(file)




# #web pages
# @appman.get("/index")
# async def serve_index():
#     return FileResponse(Path("index.html"))

#file upload endpoint: handles file uploads with size and type checks

