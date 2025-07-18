# BidzPro 2.0 API Documentation

## Overview
This document provides detailed information about the BidzPro 2.0 REST API endpoints, including authentication, request/response formats, and example usage.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All API endpoints require JWT authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Analytics

#### GET /analytics/overview
Retrieve analytics overview data.

**Response:**
```json
{
  "total_projects": 150,
  "active_bids": 45,
  "success_rate": 0.75,
  "revenue_forecast": 1250000
}
```

#### GET /analytics/trends
Retrieve historical trend data.

**Query Parameters:**
- `start_date` (optional): Start date in ISO format (YYYY-MM-DD)
- `end_date` (optional): End date in ISO format (YYYY-MM-DD)
- `metric` (required): One of ["bids", "revenue", "success_rate"]

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "value": 125000
    },
    {
      "date": "2024-01-02",
      "value": 130000
    }
  ],
  "metric": "revenue"
}
```

### Projects

#### GET /projects
Retrieve list of projects.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `status` (optional): Filter by status ["active", "completed", "pending"]

**Response:**
```json
{
  "projects": [
    {
      "id": 1,
      "name": "Office Building Renovation",
      "status": "active",
      "bid_amount": 750000,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "per_page": 20
}
```

#### POST /projects
Create a new project.

**Request Body:**
```json
{
  "name": "New Construction Project",
  "description": "Construction of new retail space",
  "bid_amount": 1500000,
  "start_date": "2024-03-01",
  "end_date": "2024-09-01"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Construction Project",
  "status": "pending",
  "created_at": "2024-01-15T00:00:00Z"
}
```

## Error Handling

The API uses standard HTTP status codes and returns error details in the response body:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid project dates provided",
    "details": {
      "start_date": "Start date must be in the future"
    }
  }
}
```

## Rate Limiting

API requests are limited to 100 requests per minute per API key. Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1516131012
```

## Webhooks

Webhooks can be configured to receive real-time updates about project status changes and bid updates.

**Webhook Payload Example:**
```json
{
  "event": "project.status_changed",
  "project_id": 1,
  "old_status": "pending",
  "new_status": "active",
  "timestamp": "2024-01-15T00:00:00Z"
}
```

## SDK Support

Official SDK libraries are available for:
- Python
- JavaScript/TypeScript
- Java
- C#

## Support

For API support or feature requests, please contact:
- Email: api-support@bidzpro.com
- Developer Portal: https://developers.bidzpro.com