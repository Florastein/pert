from supabase import create_client
import os

SUPABASE_URL = os.getenv("https://fqwysozkhauzpdnclkls.supabase.co")
SUPABASE_KEY = os.getenv("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd3lzb3praGF1enBkbmNsa2xzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMyNTcyOCwiZXhwIjoyMDU1OTAxNzI4fQ.6ilUUlcsOZ-ZofP36eD-hbKRmNJrG2THl3UJ3hrJgiI")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def store_document(user_id: str, filename: str, content: str, embedding: list):
    supabase.table("documents").insert({
        "user_id": user_id,
        "filename": filename,
        "content": content,
        "embedding": embedding
    }).execute()
