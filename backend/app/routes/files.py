from fastapi import APIRouter, UploadFile, File
from app.services import extractors, embeddings, supabase_db

router = APIRouter()

@router.post("/process")
async def process_file(file: UploadFile = File(...), user_id: str = "anonymous"):
    data = await file.read()
    text = extractors.extract_text(file, data)
    chunks = extractors.chunk_text(text)

    for chunk in chunks:
        vector = embeddings.generate_embedding(chunk)
        supabase_db.store_document(user_id, file.filename, chunk, vector)

    return {"status": "stored", "chunks": len(chunks)}
