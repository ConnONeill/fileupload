from pathlib import Path

# Upload directory
UPLOAD_DIR = Path("uploads")

# Maximum file size (50 MB)
MAX_FILE_SIZE = 50 * 1024 * 1024

# Chunk size (5 MB)
CHUNK_SIZE = 5 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {".parquet", ".txt", ".csv", ".pdf"}