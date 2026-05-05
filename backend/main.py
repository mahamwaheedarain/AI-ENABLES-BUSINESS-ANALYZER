from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io
import uvicorn

app = FastAPI()

# Enable CORS for React integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Asset Paths (Strictly following your 99.49% model architecture)
MODEL_PATH = "./models/business_model.pkl"
SCALER_PATH = "./models/scaler.pkl"
SCHEMA_PATH = "./models/feature_schema.pkl"

try:
    model = pickle.load(open(MODEL_PATH, 'rb'))
    scaler = pickle.load(open(SCALER_PATH, 'rb'))
    features = pickle.load(open(SCHEMA_PATH, 'rb'))
    print("✨ IQ Brain Loaded Successfully (Batch Topper Edition Ready)")
except FileNotFoundError:
    print("❌ Error: .pkl files not found in /backend/models/")

@app.post("/predict")
async def get_insight(file: UploadFile = File(...)):
    # 1. Read the user's uploaded CSV
    contents = await file.read()
    raw_df = pd.read_csv(io.BytesIO(contents))
    
    # 2. Advanced Data Cleaning for Detailed Analysis
    # Fill NaN values with 0 so charts don't break on missing data
    raw_df = raw_df.fillna(0)
    
    # 3. Prepare data for the Model (Numerical only for prediction)
    model_df = raw_df.select_dtypes(include=['number'])
    model_df = model_df.reindex(columns=features, fill_value=0)
    
    # 4. Scale and Predict using your precise model
    scaled_data = scaler.transform(model_df)
    prediction = model.predict(scaled_data)
    
    # 5. Strategic Data Formatting for Unique Charts
    # 'orient=records' creates the JSON structure Recharts needs for Radar/Composed/Area views
    chart_ready_data = raw_df.to_dict(orient='records')
    
    return {
        "status": "success",
        "accuracy": "99.49%",
        "insights": prediction.tolist(),
        "data_rows": chart_ready_data  # Feeds all 10 detailed modules
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)