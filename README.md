# Cursor AI for Excel

A comprehensive AI-powered Excel add-in that brings Cursor AI capabilities directly into Microsoft Excel. Built with React TypeScript, FastAPI, and LangGraph for intelligent data analysis and automation.

## 🚀 Features

- **Natural Language Queries**: Ask questions about your data in plain English
- **Smart Data Analysis**: AI-powered insights and pattern recognition  
- **Formula Generation**: Convert natural language to Excel formulas
- **Chart Suggestions**: Intelligent visualization recommendations
- **Data Cleaning**: Automated data preprocessing and validation
- **Real-time Chat Interface**: Interactive AI assistant with white background theme
- **Excel Integration**: Seamless Office.js integration for native Excel experience

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Excel Client  │ ←→ │  React Add-in   │ ←→ │  FastAPI Backend│
│   (Office.js)   │    │ (Assistant-UI)  │    │  (LangGraph)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                  ↓
                       ┌─────────────────┐
                       │   AI Services   │
                       │ (OpenAI/Azure)  │
                       └─────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Assistant-UI.com** for chat interface
- **Office.js** for Excel integration
- **Tailwind CSS** for styling
- **Vite** for development and building

### Backend  
- **FastAPI** for high-performance API
- **LangGraph** for AI workflow orchestration
- **LangChain** for AI chain management
- **OpenAI API** for language models
- **Poetry** for dependency management
- **Pandas** for data manipulation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.9+
- Poetry for Python dependency management
- OpenAI API key
- Microsoft Excel (for testing the add-in)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   poetry install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenAI API key
   ```

4. **Start the backend server**
   ```bash
   poetry run uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

### Excel Add-in Setup

1. **Enable Developer Mode in Excel**
   - File → Options → Customize Ribbon → Check "Developer"

2. **Load the add-in manifest**
   - Developer tab → Add-ins → Upload My Add-in
   - Select `frontend/public/manifest.xml`

3. **Access the add-in**
   - Look for "Cursor AI" button in the Home ribbon
   - Click to open the task pane

## 📁 Project Structure

```
cursor-excel-ai/
├── frontend/                   # React TypeScript add-in
│   ├── public/
│   │   ├── manifest.xml       # Office add-in manifest
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # React components
│   │   │   └── ChatInterface/ # Main chat component
│   │   ├── services/          # API communication
│   │   │   ├── excelService.ts
│   │   │   └── apiService.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                   # FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/           # API routes
│   │   │   ├── chat.py
│   │   │   ├── data.py
│   │   │   └── analysis.py
│   │   ├── core/             # Core functionality
│   │   │   └── config.py
│   │   ├── services/         # Business logic
│   │   │   ├── ai_service.py
│   │   │   ├── excel_service.py
│   │   │   └── langgraph_service.py
│   │   ├── models/           # Pydantic models
│   │   │   ├── chat.py
│   │   │   └── excel.py
│   │   └── main.py
│   ├── pyproject.toml
│   └── README.md
├── docs/                     # Documentation
└── README.md
```

## 🎯 Usage Examples

### Data Analysis
1. Select a range in Excel with your data
2. Click "Get Selected Data" in the add-in
3. Ask: "What trends do you see in this data?"
4. Get AI-powered insights and suggestions

### Formula Generation
1. Select a cell where you want a formula
2. Ask: "Create a formula to calculate the average of the sales column"
3. The AI will generate and explain the formula

### Chart Creation
1. Select your data range
2. Ask: "What's the best chart type for this data?"
3. Get chart suggestions with reasoning

## 🔧 Configuration

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
CORS_ORIGINS=http://localhost:3000,https://localhost:3000
DEBUG=false
```

### Office Add-in Manifest

The `manifest.xml` file configures the Excel add-in. Update the URLs to match your deployment:

```xml
<SourceLocation DefaultValue="https://your-domain.com/index.html"/>
```

## 🚀 Deployment

### Frontend Deployment
- Deploy to static hosting (Azure Static Web Apps, Netlify, Vercel)
- Update manifest.xml with production URLs
- Ensure HTTPS for Office add-in compatibility

### Backend Deployment  
- Deploy to cloud platforms (Azure, AWS, DigitalOcean)
- Set environment variables
- Configure CORS for frontend domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Assistant-UI.com](https://assistant-ui.com) for the excellent chat interface components
- [LangGraph](https://github.com/langchain-ai/langgraph) for AI workflow orchestration
- [Office.js](https://docs.microsoft.com/en-us/office/dev/add-ins/) for Excel integration
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance backend

## 📞 Support

- Create an issue for bug reports or feature requests
- Check the [documentation](./docs/) for detailed guides
- Review the project outline for implementation details

---

**Built with ❤️ for Excel power users and data enthusiasts** 