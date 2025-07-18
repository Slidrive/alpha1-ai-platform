# AI Platform - API Reference

## Authentication

All API endpoints require JWT authentication except for `/health` and `/auth/login`.

**Login:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'
```

**Use Token:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5001/api/models
```

## Core Endpoints

### Health Check
```bash
GET /api/health
```
Returns comprehensive system status including AI models, database, and performance metrics.

### AI Models
```bash
# List all models
GET /api/models

# Get model details
GET /api/models/{model_name}/status

# Make prediction
POST /api/models/predict
{
  "model_name": "predictive_analytics_v1",
  "input_data": [[1.0, 2.0, 3.0, 4.0, 5.0]]
}

# Train model
POST /api/models/train
{
  "model_name": "predictive_analytics_v1",
  "training_data": [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6]],
  "labels": [0.8, 0.9]
}
```

### Data Processing
```bash
# Process data
POST /api/data/process
{
  "data": [
    {
      "timestamp": "2025-06-09T12:00:00Z",
      "value": 42.5,
      "source": "sensor_001"
    }
  ]
}

# Get recent data
GET /api/data/recent?limit=100&source=sensor_001
```

### Analytics
```bash
# Get analytics summary
GET /api/analytics/summary

# Get trends
GET /api/analytics/trends?period=day&metric=accuracy
```

### Monitoring
```bash
# Real-time metrics
GET /api/metrics/real-time

# System status
GET /api/monitoring/system-status
```

## Response Formats

**Success Response:**
```json
{
  "status": "success",
  "data": {...},
  "timestamp": "2025-06-09T21:30:00Z"
}
```

**Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data format",
    "details": {...}
  }
}
```

## Rate Limits

- Standard Users: 1000 requests/hour
- Premium Users: 5000 requests/hour
- Admin Users: 10000 requests/hour

## SDK Examples

**Python:**
```python
import requests

class AIPlatformClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def predict(self, model_name, data):
        response = requests.post(
            f'{self.base_url}/models/predict',
            json={'model_name': model_name, 'input_data': data},
            headers=self.headers
        )
        return response.json()

client = AIPlatformClient('http://localhost:5001/api', 'your_token')
result = client.predict('predictive_analytics_v1', [[1, 2, 3, 4, 5]])
```

**JavaScript:**
```javascript
const client = {
    baseUrl: 'http://localhost:5001/api',
    token: 'your_token',
    
    async predict(modelName, data) {
        const response = await fetch(`${this.baseUrl}/models/predict`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model_name: modelName,
                input_data: data
            })
        });
        return response.json();
    }
};

const result = await client.predict('predictive_analytics_v1', [[1, 2, 3, 4, 5]]);
```

## WebSocket Events

Connect to `ws://localhost:5001/ws` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:5001/ws');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log('Real-time update:', data);
};
```

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

