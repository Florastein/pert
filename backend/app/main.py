from fastapi import FastAPI
from app.routes import files, scrape, query

app = FastAPI(title="RAG Backend", version="1.0")

# Register routes
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(scrape.router, prefix="/scrape", tags=["scraping"])
app.include_router(query.router, prefix="/query", tags=["rag"])

@app.get("/")
def root():
    return {"message": "RAG Backend is running!"}
