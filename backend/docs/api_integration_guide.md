# BidzPro 2.0 API Integration Guide

## Introduction

This guide provides detailed instructions for integrating with the BidzPro 2.0 API, including best practices, code examples, and common integration patterns.

## Getting Started

### 1. Obtain API Credentials

1. Register for a developer account at [developers.bidzpro.com](https://developers.bidzpro.com)
2. Create a new application to receive your API credentials:
   - Client ID
   - Client Secret
   - API Key

### 2. Environment Setup

#### Development Environment
```
API_BASE_URL=http://localhost:5000/api/v1
```

#### Production Environment
```
API_BASE_URL=https://api.bidzpro.com/v1
```

## Authentication

### JWT Token Authentication

1. Obtain JWT token using login endpoint
2. Include token in all subsequent requests

#### Python Example
```python
import requests

def get_auth_token(email, password):
    response = requests.post(
        f"{API_BASE_URL}/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    return response.json()["token"]

def make_authenticated_request(token, endpoint, method="GET", data=None):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.request(
        method,
        f"{API_BASE_URL}/{endpoint}",
        headers=headers,
        json=data
    )
    return response.json()
```

#### JavaScript Example
```javascript
async function getAuthToken(email, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });
  const data = await response.json();
  return data.token;
}

async function makeAuthenticatedRequest(token, endpoint, method = 'GET', data = null) {
  const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : null
  });
  return response.json();
}
```

## Common Integration Patterns

### 1. Real-time Project Updates

Implement webhook listeners to receive real-time updates:

```python
from flask import Flask, request

app = Flask(__name__)

@app.route('/webhooks/project-updates', methods=['POST'])
def handle_project_update():
    event = request.json
    project_id = event['project_id']
    new_status = event['new_status']
    
    # Handle the update
    update_local_project_status(project_id, new_status)
    
    return {'status': 'success'}, 200
```

### 2. Batch Processing

Handle multiple projects efficiently:

```python
async def process_projects_batch(token, projects):
    tasks = []
    for project in projects:
        task = asyncio.create_task(
            make_authenticated_request(
                token,
                'projects',
                method='POST',
                data=project
            )
        )
        tasks.append(task)
    
    results = await asyncio.gather(*tasks)
    return results
```

### 3. Error Handling

Implement robust error handling:

```javascript
class APIError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function makeAPIRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new APIError(
        response.status,
        data.error.code,
        data.error.message
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      // Handle specific API errors
      handleAPIError(error);
    } else {
      // Handle network or other errors
      handleNetworkError(error);
    }
    throw error;
  }
}
```

## Rate Limiting

### Handling Rate Limits

```javascript
class RateLimitHandler {
  constructor() {
    this.requestQueue = [];
    this.processing = false;
  }

  async addRequest(request) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    this.processing = true;
    while (this.requestQueue.length > 0) {
      const { request, resolve, reject } = this.requestQueue.shift();
      try {
        const response = await request();
        resolve(response);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit: 1 request per second
      } catch (error) {
        if (error.status === 429) { // Too Many Requests
          const retryAfter = parseInt(error.headers.get('Retry-After')) || 60;
          await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
          this.requestQueue.unshift({ request, resolve, reject });
        } else {
          reject(error);
        }
      }
    }
    this.processing = false;
  }
}
```

## Best Practices

### 1. Caching

Implement caching for frequently accessed data:

```python
from functools import lru_cache
from datetime import datetime, timedelta

class APICache:
    def __init__(self, ttl_seconds=300):
        self.ttl_seconds = ttl_seconds
        self.cache = {}
        self.timestamps = {}

    def get(self, key):
        if key in self.cache:
            if datetime.now() - self.timestamps[key] < timedelta(seconds=self.ttl_seconds):
                return self.cache[key]
            else:
                del self.cache[key]
                del self.timestamps[key]
        return None

    def set(self, key, value):
        self.cache[key] = value
        self.timestamps[key] = datetime.now()
```

### 2. Retry Strategy

Implement exponential backoff for failed requests:

```javascript
async function retryWithBackoff(operation, retries = 3, backoff = 300) {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isRetryable(error)) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return retryWithBackoff(operation, retries - 1, backoff * 2);
    }
    throw error;
  }
}

function isRetryable(error) {
  return error.status === 429 || // Rate limit exceeded
         error.status >= 500;    // Server errors
}
```

### 3. Logging

Implement comprehensive logging:

```python
import logging
import json

class APILogger:
    def __init__(self):
        self.logger = logging.getLogger('bidzpro_api')
        self.logger.setLevel(logging.INFO)

    def log_request(self, method, endpoint, data=None):
        self.logger.info({
            'type': 'request',
            'method': method,
            'endpoint': endpoint,
            'data': data
        })

    def log_response(self, status_code, response_data):
        self.logger.info({
            'type': 'response',
            'status_code': status_code,
            'data': response_data
        })

    def log_error(self, error):
        self.logger.error({
            'type': 'error',
            'message': str(error),
            'stack_trace': traceback.format_exc()
        })
```

## Testing

### 1. Integration Tests

```python
import pytest

@pytest.fixture
def api_client():
    token = get_auth_token(TEST_EMAIL, TEST_PASSWORD)
    return APIClient(token)

def test_project_creation(api_client):
    project_data = {
        'name': 'Test Project',
        'bid_amount': 100000
    }
    response = api_client.create_project(project_data)
    assert response['status'] == 'success'
    assert 'id' in response
```

### 2. Mock Responses

```javascript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get(`${API_BASE_URL}/projects`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        projects: [
          {
            id: 1,
            name: 'Test Project',
            status: 'active'
          }
        ]
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Security Considerations

1. Always use HTTPS in production
2. Implement token rotation
3. Validate all input data
4. Use secure headers
5. Implement request signing for sensitive operations

## Troubleshooting

### Common Issues and Solutions

1. Authentication Failures
   - Verify token expiration
   - Check token format
   - Ensure correct credentials

2. Rate Limiting
   - Implement backoff strategy
   - Monitor rate limit headers
   - Cache frequently accessed data

3. Data Validation Errors
   - Review request payload format
   - Check required fields
   - Validate data types

## Support

For technical support:
- Email: api-support@bidzpro.com
- Developer Portal: https://developers.bidzpro.com
- API Status: https://status.bidzpro.com