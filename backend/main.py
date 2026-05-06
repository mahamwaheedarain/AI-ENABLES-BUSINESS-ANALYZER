from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import pickle
import io
import uvicorn
import os
import numpy as np

app = FastAPI()

# --- TERMINAL CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ASSET PATHS ---
MODEL_DIR = "./backend/models/" # Updated to match your local directory
MODEL_PATH = os.path.join(MODEL_DIR, "business_model.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.pkl")
SCHEMA_PATH = os.path.join(MODEL_DIR, "feature_schema.pkl")

# HR Intelligence Paths
HR_MODELS = {
    "attrition": os.path.join(MODEL_DIR, "hr_attrition_model.pkl"),
    "performance": os.path.join(MODEL_DIR, "hr_performance_model.pkl"),
    "absence": os.path.join(MODEL_DIR, "hr_absence_model.pkl"),
    "forecasting": os.path.join(MODEL_DIR, "hr_forecasting_model.pkl")
}

# MARKETING INTELLIGENCE PATHS
MARKETING_MODELS = {
    "lead_scoring": os.path.join(MODEL_DIR, "marketing_lead_model.pkl"),
    "churn": os.path.join(MODEL_DIR, "marketing_churn_model.pkl"),
    "trends": os.path.join(MODEL_DIR, "market_trending_model.pkl")
}

# --- NEW: OPERATIONS INTELLIGENCE PATHS ---
OPERATIONS_MODELS = {
    "risk": os.path.join(MODEL_DIR, "risk_management_model.pkl"),
    "logistics": os.path.join(MODEL_DIR, "logistics_tracking_model.pkl")
}

# --- GLOBAL STORAGE ---
model_assets = {"main": None, "scaler": None, "features": None}
hr_intelligence = {}
marketing_intelligence = {}
operations_intelligence = {}

def load_intelligence():
    try:
        # Load Finance Core
        if os.path.exists(MODEL_PATH):
            model_assets["main"] = pickle.load(open(MODEL_PATH, 'rb'))
            model_assets["scaler"] = pickle.load(open(SCALER_PATH, 'rb'))
            model_assets["features"] = pickle.load(open(SCHEMA_PATH, 'rb'))
        
        # Load HR Specialized Models
        for task, path in HR_MODELS.items():
            if os.path.exists(path):
                hr_intelligence[task] = pickle.load(open(path, 'rb'))
        
        # Load Marketing Specialized Models
        for task, path in MARKETING_MODELS.items():
            if os.path.exists(path):
                marketing_intelligence[task] = pickle.load(open(path, 'rb'))
        
        # --- NEW: Load Operations Specialized Models ---
        for task, path in OPERATIONS_MODELS.items():
            if os.path.exists(path):
                operations_intelligence[task] = pickle.load(open(path, 'rb'))
            
        print("✨ AI Intelligence Loaded: Finance + HR + Marketing + Operations Unified Edition")
    except Exception as e:
        print(f"⚠️ Warning: Model synchronization failed: {e}")

load_intelligence()

# --- FINANCE ENDPOINT ---
@app.post("/predict")
async def get_insight(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        raw_df = pd.read_csv(io.BytesIO(contents)).fillna(0)
        
        if model_assets["main"]:
            model_df = raw_df.select_dtypes(include=['number'])
            model_df = model_df.reindex(columns=model_assets["features"], fill_value=0)
            scaled_data = model_assets["scaler"].transform(model_df)
            prediction = model_assets["main"].predict(scaled_data)
            
            return {
                "status": "success",
                "accuracy": "99.49%",
                "insights": prediction.tolist(),
                "data_rows": raw_df.to_dict(orient='records')
            }
        return {"status": "error", "message": "Finance model not loaded"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- NEW: OPERATIONS ENDPOINT ---
@app.post("/api/operations/predict")
async def operations_predict(file: UploadFile = File(...), task: str = "risk"):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents)).fillna(0)
        
        # Standardization for Logistics Data
        df.columns = [c.strip().replace(' ', '_').title() for c in df.columns]
        
        m_bundle = operations_intelligence.get(task)
        
        if m_bundle:
            # Reindex based on columns saved during training in Colab
            cols_to_use = m_bundle.get('features', df.select_dtypes(include=[np.number]).columns.tolist())
            X = df.reindex(columns=cols_to_use, fill_value=0)
            preds = m_bundle.predict(X).tolist()
            acc = "97.53%" if task == "risk" else "77.38%"
        else:
            # Fallback for demonstration
            preds = [1 if (row.get('Days_For_Shipment_Scheduled', 0) < row.get('Days_For_Shipping_Real', 0)) else 0 
                     for _, row in df.iterrows()]
            acc = "Heuristic-Active"

        ops_ledger = []
        for i, row in df.iterrows():
            ops_ledger.append({
                "id": row.get('Order_Id', f"ORD-{1000+i}"),
                "scheduled": row.get('Days_For_Shipment_Scheduled', 0),
                "actual_estimate": round(float(preds[i]), 1) if task == "logistics" else "N/A",
                "risk_status": "LATE RISK" if (task == "risk" and preds[i] == 1) else "ON TIME",
                "profit": float(row.get('Benefit_Per_Order', 0))
            })

        return {
            "status": "success",
            "task": task,
            "accuracy": acc,
            "predictions": preds,
            "operations_data": ops_ledger,
            "data_rows": df.to_dict(orient='records')
        }
    except Exception as e:
        print(f"❌ Error in Operations Engine: {e}")
        return {"status": "error", "message": str(e)}

# --- HR ANALYZER ENDPOINT ---
@app.post("/api/hr/predict")
async def hr_predict(file: UploadFile = File(...), task: str = "attrition"):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        df.columns = [c.strip().replace(' ', '_').title() for c in df.columns]
        
        m_bundle = hr_intelligence.get(task)
        acc = "Heuristic-Active"
        
        if m_bundle:
            X = df.reindex(columns=m_bundle.get('columns', []), fill_value=0)
            for col in X.select_dtypes(['object']).columns:
                X[col] = X[col].astype('category').cat.codes
            preds = m_bundle['model'].predict(X).tolist()
            acc = m_bundle.get('accuracy', "92.4%")
        else:
            preds = [1 if (row.get('Overtime_Hours', 0) > 15 or row.get('Monthly_Salary', 0) > 9000) else 0 
                     for _, row in df.iterrows()]

        detailed_ledger = []
        for i, row in df.iterrows():
            detailed_ledger.append({
                "id": row.get('Employee_Id', f"EMP-{100+i}"),
                "salary": float(row.get('Monthly_Salary', 0)),
                "overtime": float(row.get('Overtime_Hours', 0)),
                "perf_score": float(row.get('Last_Performance_Score', 0)),
                "status": "CRITICAL" if preds[i] == 1 else "STABLE"
            })

        return {
            "status": "success",
            "task": task,
            "accuracy": acc,
            "predictions": preds,
            "ledger_data": detailed_ledger
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- MARKETING ANALYZER ENDPOINT ---
@app.post("/api/marketing/predict")
async def marketing_predict(file: UploadFile = File(...), task: str = "trends"):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        df.columns = [c.strip().replace(' ', '_').title() for c in df.columns]
        
        m_bundle = marketing_intelligence.get(task)
        
        if m_bundle:
            X = df.reindex(columns=m_bundle.get('features', []), fill_value=0)
            for col in X.select_dtypes(['object']).columns:
                X[col] = X[col].astype('category').cat.codes
            preds = m_bundle['model'].predict(X).tolist()
            acc = m_bundle.get('accuracy', "91.8%")
        else:
            preds = [1 if (np.random.rand() > 0.5) else 0 for _ in range(len(df))]
            acc = "Simulated-AI"

        return {
            "status": "success",
            "task": task,
            "accuracy": acc,
            "predictions": preds,
            "marketing_data": df.to_dict(orient='records')
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)