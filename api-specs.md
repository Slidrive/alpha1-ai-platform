# API Specifications

## Authentication Endpoints

### POST /api/auth/login
**Description**: Authenticate user and return JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### POST /api/auth/refresh
**Description**: Refresh JWT token

**Request Body**:
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Data Processing Endpoints

### POST /api/data/ingest
**Description**: Ingest real-time data for processing

**Request Body**:
```json
{
  "source": "sensor_network",
  "timestamp": "2025-06-09T10:30:00Z",
  "data": {
    "temperature": 25.5,
    "humidity": 60.2,
    "pressure": 1013.25
  }
}
```

### GET /api/data/stream
**Description**: Get real-time data stream (WebSocket endpoint)

**WebSocket Events**:
- `data_update`: Real-time data updates
- `alert`: System alerts and notifications
- `model_prediction`: AI model predictions

## AI Model Endpoints

### POST /api/models/predict
**Description**: Get prediction from AI model

**Request Body**:
```json
{
  "model_id": "predictive_analytics_v1",
  "features": {
    "feature1": 0.75,
    "feature2": 1.23,
    "feature3": -0.45
  }
}
```

**Response**:
```json
{
  "prediction": 0.87,
  "confidence": 0.92,
  "model_version": "1.2.3",
  "timestamp": "2025-06-09T10:30:00Z"
}
```

### GET /api/models
**Description**: List available AI models

**Response**:
```json
{
  "models": [
    {
      "id": "predictive_analytics_v1",
      "name": "Predictive Analytics Model",
      "version": "1.2.3",
      "status": "active",
      "accuracy": 0.94
    }
  ]
}
```

### POST /api/models/train
**Description**: Trigger model training

**Request Body**:
```json
{
  "model_id": "predictive_analytics_v1",
  "training_data": "dataset_id_123",
  "parameters": {
    "epochs": 100,
    "learning_rate": 0.001
  }
}
```

## Analytics Endpoints

### GET /api/analytics/metrics
**Description**: Get system metrics and KPIs

**Query Parameters**:
- `start_time`: ISO 8601 timestamp
- `end_time`: ISO 8601 timestamp
- `metric_type`: Type of metric (performance, accuracy, usage)

**Response**:
```json
{
  "metrics": [
    {
      "name": "model_accuracy",
      "value": 0.94,
      "timestamp": "2025-06-09T10:30:00Z"
    },
    {
      "name": "response_time",
      "value": 125.5,
      "unit": "ms",
      "timestamp": "2025-06-09T10:30:00Z"
    }
  ]
}
```

### GET /api/analytics/reports
**Description**: Generate analytics reports

**Query Parameters**:
- `report_type`: Type of report (daily, weekly, monthly)
- `format`: Output format (json, pdf, csv)

## Monitoring Endpoints

### GET /api/health
**Description**: Health check endpoint

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-06-09T10:30:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "ai_models": "healthy"
  }
}
```

### GET /api/metrics
**Description**: Prometheus metrics endpoint

**Response**: Prometheus format metrics

## User Management Endpoints

### GET /api/users
**Description**: List users (admin only)

**Response**:
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "role": "admin",
      "created_at": "2025-01-01T00:00:00Z",
      "last_login": "2025-06-09T09:00:00Z"
    }
  ]
}
```

### POST /api/users
**Description**: Create new user (admin only)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securepassword",
  "role": "user"
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  }
}
```

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- Data ingestion: 1000 requests per minute per user
- Model prediction: 100 requests per minute per user
- Analytics: 50 requests per minute per user

## WebSocket Events

### Real-time Data Stream
**Event**: `data_update`
```json
{
  "type": "data_update",
  "source": "sensor_network",
  "data": {
    "temperature": 25.5,
    "timestamp": "2025-06-09T10:30:00Z"
  }
}
```

### Model Predictions
**Event**: `prediction`
```json
{
  "type": "prediction",
  "model_id": "predictive_analytics_v1",
  "prediction": 0.87,
  "confidence": 0.92
}
```

### System Alerts
**Event**: `alert`
```json
{
  "type": "alert",
  "severity": "warning",
  "message": "High CPU usage detected",
  "timestamp": "2025-06-09T10:30:00Z"
}
```

