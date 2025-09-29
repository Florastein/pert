<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1cla9OtaOktUZBQIcSsBZvFYylAMWZ610

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Multi-user RAG (per-user knowledge base)

- Authentication via Firebase Auth (email/password or Google).
- Each user's documents are stored locally per-user and per-bot (localStorage) using the new `useRag` hook.
- In chat, the top-matching documents (cosine similarity over bag-of-words) are injected as context to the LLM.
- Manage docs from the new **Knowledge Base** panel in the chat window.

> Backend-ready: Swap `useRag` storage with API calls to your vector DB (Supabase pgvector, Pinecone, etc.). Keep the `search()` API signature.
