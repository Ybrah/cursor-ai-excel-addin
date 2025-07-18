# Cursor AI for Excel - Backend

AI-powered Excel assistant backend built with FastAPI and LangGraph.

## Features

- FastAPI REST API
- LangGraph AI workflows
- OpenAI integration
- Excel data processing
- Chat interface support

## Development

```bash
poetry install
poetry run uvicorn app.main:app --reload
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

- `OPENAI_API_KEY`: Your OpenAI API key
- `CORS_ORIGINS`: Allowed CORS origins (default: http://localhost:3000) 