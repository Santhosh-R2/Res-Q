# ResQ AI Disaster Detection Service

This is a professional AI-powered disaster detection service built with **FastAPI** and **PyTorch (ResNet50)**.

## Features
- **High-Performance**: Powered by FastAPI for asynchronous request handling.
- **Robust Model**: Uses a pre-trained ResNet50 model for reliable image classification.
- **Smart Mapping**: Maps over 1000+ ImageNet categories to specific disaster types (Fire, Flood, Medical, etc.).
- **Easy Integration**: Simple JSON API with CORS enabled.

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Service**:
   ```bash
   python main.py
   ```
   The service will run at `http://localhost:8000`.

## API Documentation

- **GET /**: Health check and status.
- **POST /predict**: Upload an image to detect the disaster type.
  - Payload: File (form-data, key='file')
  - Returns: JSON with `disaster_type`, `top_prediction`, and `confidence`.
