# ViduthaVel - Agentic AI Market Price and Harvest Logistics Planner

> **Built for AI Ignite National Gen AI Hackathon**

An intelligent decision support system that helps farmers maximize their harvest returns by analyzing market prices, transport costs, and storage losses using a multi-agent AI system.

## 🌟 Features

### Core Functionality
- **Multi-Agent AI System**: Coordinated agents for market analysis, logistics planning, and storage strategy
- **Net Revenue Comparison**: Compare "Sell Now" vs "Sell Later" scenarios across multiple markets
- **Dynamic Loss Modeling**: Calculate value degradation based on crop shelf-life and storage conditions
- **Logistics Toolkit**: Route planning, transport cost estimation, and pre-market checklist
- **Risk Analysis**: Price volatility assessment and storage risk evaluation
- **Agentic Traceability**: Step-by-step reasoning trace showing how AI reached recommendations
- **Diminishing Returns Analysis**: Visual graph showing optimal sell timing
- **Sensitivity Analysis**: Interactive sliders to adjust fuel prices and loss rates

### Advanced Features
- **Multilingual Support**: English and Hindi (हिंदी) interface
- **Database Persistence**: SQLite database to remember user farm context
- **ReAct Agent Architecture**: Reasoning + Acting pattern for transparent decision-making
- **FAO/ICAR Citations**: Data sources properly cited for credibility

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: Vite + React 18
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React Query for API state
- **Charts**: Recharts for data visualization
- **Routing**: React Router

### Backend (Python + FastAPI)
- **Framework**: FastAPI with async/await
- **AI Framework**: LangChain/LangGraph for ReAct agents
- **Database**: SQLite with SQLAlchemy ORM
- **Agents**:
  - **Market Analyst**: Fetches and predicts market prices
  - **Logistics Coordinator**: Calculates routes and transport costs
  - **Storage Strategist**: Models storage losses over time
  - **Supervisor**: Orchestrates all agents and generates final recommendation

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.9+
- pip

### Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -c "from models.database import init_db; init_db()"

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Backend
DATABASE_URL=sqlite:///./farm_context.db
VITE_API_URL=http://localhost:8000
```

## 🚀 Usage

1. **Enter Farm Context**: Select crop type, quantity, location, and storage conditions
2. **Analyze**: Click "Analyze Markets & Get Recommendation"
3. **Review Results**:
   - View agent reasoning trace
   - Compare revenue across markets and timeframes
   - Check logistics checklist
   - Review risk analysis
   - Adjust sensitivity parameters
4. **Make Decision**: Use the recommendation to decide when and where to sell

## 📊 Data Sources

- **Market Prices**: Mock data (in production, integrate with Agmarknet API)
- **Loss Rates**: Based on FAO Post-Harvest Loss Guidelines
- **Storage Parameters**: Referenced from ICAR Research Publications
- **Transport Costs**: Indicative averages based on regional data

## 🔒 Safety & Ethics

- Clear disclaimers that recommendations are estimates
- Citations to FAO and ICAR for default parameters
- No personal data shared without consent
- Transparent agent reasoning trace

## 🛠️ Development

### Project Structure

```
ViduthaVel/
├── backend/
│   ├── app/
│   │   └── main.py           # FastAPI application
│   ├── models/
│   │   └── database.py       # Database models
│   ├── src/
│   │   ├── agents/           # AI agents
│   │   │   ├── supervisor.py
│   │   │   ├── marketAnalyst.py
│   │   │   ├── logisticsCoordinator.py
│   │   │   ├── storageStrategist.py
│   │   │   └── react_agent.py
│   │   └── types.py          # Pydantic models
│   └── requirements.txt
├── src/
│   ├── agents/               # Frontend agent types
│   ├── api/                   # API client
│   ├── components/            # React components
│   ├── lib/                   # Utilities & i18n
│   └── pages/                 # Page components
└── README.md
```

### API Endpoints

- `GET /` - API health check
- `POST /api/recommendations/generate` - Generate recommendation
- `GET /api/farm-context/{user_id}` - Get saved farm contexts
- `GET /api/recommendations/history/{user_id}` - Get recommendation history

## 🎯 Innovation Highlights

1. **Diminishing Returns Logic**: Graphical visualization of optimal sell timing
2. **Multilingual Support**: Localized UI for regional languages
3. **Sensitivity Analysis**: Interactive parameter adjustment
4. **Agentic Traceability**: Full reasoning transparency
5. **Database Persistence**: Context memory across sessions

## 📝 License

This project is built for the AI Ignite National Gen AI Hackathon.

## 🤝 Contributing

This is a hackathon project. For improvements or issues, please create an issue or pull request.

## 🙏 Acknowledgments

- **FAO** (Food and Agriculture Organization) for post-harvest loss guidelines
- **ICAR** (Indian Council of Agricultural Research) for storage parameter references
- **Agmarknet** for market price data structure inspiration

---

**Disclaimer**: This tool provides estimates based on simulated data. Always verify current market prices before making selling decisions.

