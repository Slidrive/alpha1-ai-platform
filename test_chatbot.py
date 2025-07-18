#!/usr/bin/env python3
"""
Simple test script to verify the chatbot API is working
"""

import requests
import json

def test_chatbot():
    base_url = "http://localhost:5001"
    
    print("🧪 Testing Alpha 1 AI Platform Chatbot...")
    
    # Step 1: Get guest token
    print("\n1. Getting guest authentication token...")
    try:
        auth_response = requests.post(f"{base_url}/api/auth/guest-token", 
                                    json={"session_id": "test_session_123"})
        if auth_response.status_code == 200:
            token = auth_response.json()["token"]
            print(f"✅ Got guest token: {token[:20]}...")
        else:
            print(f"❌ Failed to get token: {auth_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Auth error: {e}")
        return
    
    # Step 2: Test chatbot with documentation agent
    print("\n2. Testing chatbot with documentation agent...")
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        test_message = "What AI agents do you have available?"
        
        chat_response = requests.post(f"{base_url}/api/agents/documentation/chat",
                                    headers=headers,
                                    json={
                                        "message": test_message,
                                        "session_id": "test_session_123",
                                        "context": "homepage_chatbot"
                                    })
        
        if chat_response.status_code == 200:
            response_data = chat_response.json()
            print(f"✅ Chat response received!")
            print(f"📝 Response: {response_data.get('response', 'No response')[:200]}...")
        else:
            print(f"❌ Chat failed: {chat_response.status_code}")
            print(f"Error: {chat_response.text}")
    except Exception as e:
        print(f"❌ Chat error: {e}")
    
    print("\n🎉 Test completed!")

if __name__ == "__main__":
    test_chatbot()