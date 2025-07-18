import pytest
import json

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.json == {'status': 'healthy'}

def test_analytics_endpoint(client):
    response = client.get('/api/analytics/summary')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'metrics' in data
    assert isinstance(data['metrics'], dict)

@pytest.mark.parametrize('invalid_path', [
    '/api/nonexistent',
    '/api/analytics/invalid'
])
def test_invalid_endpoints(client, invalid_path):
    response = client.get(invalid_path)
    assert response.status_code == 404