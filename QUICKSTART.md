# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- Python 3.9+ installed
- pip package manager

## Step 1: Clone and Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python init_db.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run on `http://localhost:8000`

## Step 2: Setup Frontend

Open a new terminal:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173`

## Step 3: Use the Application

1. Open `http://localhost:5173` in your browser
2. Fill in the farm context form:
   - Select crop type
   - Enter quantity (in quintals)
   - Enter farm location
   - Select storage condition
3. Click "Analyze Markets & Get Recommendation"
4. Review the results:
   - Agent reasoning trace
   - Revenue comparison table
   - Sensitivity analysis
   - Logistics checklist
   - Risk analysis

## API Testing

You can test the API directly:

```bash
curl -X POST http://localhost:8000/api/recommendations/generate \
  -H "Content-Type: application/json" \
  -d '{
    "crop": {
      "type": "wheat",
      "quantity": 50,
      "harvest_date": "2024-01-15",
      "current_storage": {}
    },
    "farm_location": {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "address": "Delhi"
    },
    "preferences": {
      "risk_tolerance": "medium",
      "preferred_markets": [],
      "storage_capacity": 100
    }
  }'
```

## Troubleshooting

### Backend Issues
- **Port already in use**: Change port in uvicorn command: `--port 8001`
- **Database errors**: Delete `farm_context.db` and run `python init_db.py` again
- **Import errors**: Make sure you're in the `backend` directory and virtual environment is activated

### Frontend Issues
- **API connection errors**: Check that backend is running on port 8000
- **Build errors**: Delete `node_modules` and run `npm install` again
- **CORS errors**: Backend CORS is configured to allow all origins in development

## Production Deployment

For production:
1. Set `VITE_API_URL` to your production API URL
2. Use PostgreSQL instead of SQLite
3. Configure proper CORS origins
4. Add authentication/authorization
5. Set up proper logging and monitoring

