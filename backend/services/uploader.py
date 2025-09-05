from pathlib import Path
from fastapi import HTTPException, UploadFile
from services.config import UPLOAD_DIR, MAX_FILE_SIZE, CHUNK_SIZE, ALLOWED_EXTENSIONS

def to_megabytes(size_in_bytes: float):
    # Convert file size from bytes to MBs and round to 2 decimal places
    return round(size_in_bytes / 1024 / 1024, 2)

class FileUploadService:
    @staticmethod
    async def save_file(file: UploadFile) -> dict:
        # Sanitise file path
        safe_filename = Path(file.filename).name
        file_path = Path(UPLOAD_DIR) / safe_filename

        # Check if extension is allowed
        filename_ext = file_path.suffix.lower()
        if filename_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"File type '{filename_ext}' not allowed.")

        # Check if file already exists
        if file_path.exists():
            raise HTTPException(status_code=409, detail=f"File: '{file_path}' already exists.")

        total_size = 0
        try:
            with file_path.open("wb") as buffer:
                while chunk := await file.read(CHUNK_SIZE):  # Read 5 MB chunks
                    total_size += len(chunk)
                    if total_size > MAX_FILE_SIZE:
                        buffer.close()
                        file_path.unlink(missing_ok=True)
                        raise HTTPException(status_code=413, detail=f"File: '{file_path}' too large (max 50 MB).")
                    buffer.write(chunk)
       
        finally:
            await file.close()
            #debug message:
            print(f"Wrote {to_megabytes(total_size)} MB to {file_path}")
            
        # returns file name and size in MBs to 2 decimal places.
        return {"filename": safe_filename, "size": to_megabytes(total_size)} 
