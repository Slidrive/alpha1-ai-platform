#!/usr/bin/env python3
"""
Direct API test for agent endpoints
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001/api"

def test_login():
    """Test login and get token"""
    print("🔐 Testing login...")
    
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "admin@example.com",
        "password": "admin123"
    })
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access_token')
        print(f"✅ Login successful! Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_agents_endpoints(token):
    """Test all agent endpoints"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n🤖 Testing agent endpoints...")
    
    # Test 1: List agents
    print("\n1. Testing list agents...")
    response = requests.get(f"{BASE_URL}/agents", headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"✅ List agents successful! Total: {data.get('total_count')}")
    else:
        print(f"❌ List agents failed: {response.text}")
    
    # Test 2: Agent details
    print("\n2. Testing agent details...")
    response = requests.get(f"{BASE_URL}/agents/project-manager", headers=headers)
    if response.status_code == 200:
        data = response.json()
        agent = data.get('agent', {})
        print(f"✅ Agent details successful! Agent: {agent.get('name')}")
        print(f"   Conversations: {agent.get('runtime_stats', {}).get('total_conversations', 0)}")
    else:
        print(f"❌ Agent details failed: {response.text}")
    
    # Test 3: Chat with agent
    print("\n3. Testing chat with agent...")
    response = requests.post(f"{BASE_URL}/agents/project-manager/chat", 
                           headers=headers,
                           json={
                               "message": "Hello, can you help me with project planning?",
                               "session_id": f"test-session-{int(time.time())}"
                           })
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Chat successful! Response: {data.get('response', '')[:100]}...")
    else:
        print(f"❌ Chat failed: {response.text}")
    
    # Test 4: Agent status
    print("\n4. Testing agent status...")
    response = requests.get(f"{BASE_URL}/agents/status", headers=headers)
    if response.status_code == 200:
        data = response.json()
        summary = data.get('summary', {})
        print(f"✅ Agent status successful!")
        print(f"   Active agents: {summary.get('active_agents')}")
        print(f"   Total conversations: {summary.get('total_conversations')}")
        print(f"   System health: {summary.get('system_health')}")
    else:
        print(f"❌ Agent status failed: {response.text}")

def main():
    print("🚀 Alpha 1 AI Platform - Direct Agent API Test")
    print("=" * 50)
    
    # Login first
    token = test_login()
    if not token:
        print("❌ Cannot proceed without authentication token")
        return
    
    # Test agent endpoints
    test_agents_endpoints(token)
    
    print("\n" + "=" * 50)
    print("✅ Direct API test completed!")

if __name__ == "__main__":
    main()