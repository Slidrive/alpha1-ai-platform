"""
Alpha1 AI Platform - Customer Support Chatbot Agent
This agent provides intelligent customer support and platform guidance.
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

customer_support_bp = Blueprint('customer_support', __name__)

class CustomerSupportAgent:
    """AI Agent specialized in customer support and platform guidance"""
    
    def __init__(self):
        self.agent_info = {
            "id": "customer-support",
            "name": "Alpha1 Support Assistant",
            "role": "Senior Customer Success Specialist",
            "goal": "Provide exceptional customer support and help users maximize their success with Alpha1 AI platform",
            "backstory": """You are an expert customer success specialist with deep knowledge of the Alpha1 AI platform.
            
            You help customers with:
            - Platform navigation and features
            - AI agent usage and best practices
            - Troubleshooting common issues
            - Subscription and billing questions
            - Feature requests and feedback
            - Onboarding new users
            
            You're friendly, patient, and always focused on helping customers succeed.
            You can escalate complex technical issues to the development team when needed.""",
            "capabilities": [
                "Platform Guidance",
                "Feature Explanation", 
                "Troubleshooting",
                "User Onboarding",
                "Best Practices",
                "Issue Escalation"
            ]
        }
        
        # Initialize OpenAI if available
        if OPENAI_AVAILABLE:
            api_key = os.getenv('OPENAI_API_KEY')
            if api_key and api_key.startswith('sk-'):
                self.client = OpenAI(api_key=api_key)
                self.use_openai = True
            else:
                self.client = None
                self.use_openai = False
        else:
            self.client = None
            self.use_openai = False
        
        # Knowledge base about the platform
        self.knowledge_base = {
            "platform_features": {
                "ai_agents": {
                    "description": "Alpha1 provides multiple specialized AI agents for different tasks",
                    "agents": [
                        "Project Manager - Manages projects and coordinates teams",
                        "Senior Developer - Writes and reviews code",
                        "QA Engineer - Ensures quality through testing",
                        "DevOps Engineer - Manages infrastructure and deployments",
                        "AI/ML Engineer - Develops and optimizes AI models",
                        "Technical Writer - Creates documentation",
                        "Marketing Specialist - Handles marketing strategies",
                        "AI Trainer - Improves agent performance"
                    ],
                    "usage": "Select an agent based on your task, then chat with them for specialized assistance"
                },
                "dashboard": {
                    "description": "Central hub for managing your AI projects and agents",
                    "features": [
                        "Agent selection and management",
                        "Project overview and tracking",
                        "Usage analytics and insights",
                        "Settings and configuration"
                    ]
                },
                "api_access": {
                    "description": "RESTful API for integrating Alpha1 agents into your applications",
                    "endpoints": [
                        "/api/agents/chat - Chat with specific agents",
                        "/api/agents/list - Get available agents",
                        "/api/projects - Manage projects",
                        "/api/analytics - Get usage analytics"
                    ]
                }
            },
            "common_issues": {
                "login_problems": {
                    "symptoms": ["Can't log in", "Password not working", "Account locked"],
                    "solutions": [
                        "Check email and password spelling",
                        "Use password reset if needed",
                        "Clear browser cache and cookies",
                        "Try incognito/private browsing mode"
                    ]
                },
                "agent_not_responding": {
                    "symptoms": ["Agent doesn't respond", "Slow responses", "Error messages"],
                    "solutions": [
                        "Check internet connection",
                        "Refresh the page",
                        "Try a different agent",
                        "Contact support if issue persists"
                    ]
                },
                "subscription_issues": {
                    "symptoms": ["Billing questions", "Plan changes", "Usage limits"],
                    "solutions": [
                        "Check subscription status in dashboard",
                        "Review usage analytics",
                        "Contact billing support for plan changes",
                        "Upgrade plan if hitting limits"
                    ]
                }
            },
            "getting_started": {
                "new_users": [
                    "1. Sign up for your Alpha1 account",
                    "2. Complete your profile setup",
                    "3. Explore the dashboard and available agents",
                    "4. Start with a simple task to test an agent",
                    "5. Review our tutorials and best practices"
                ],
                "best_practices": [
                    "Be specific in your requests to agents",
                    "Provide context for better responses",
                    "Use the right agent for each task type",
                    "Review and iterate on agent suggestions",
                    "Save important conversations for reference"
                ]
            }
        }
        
        self.conversation_sessions = {}
    
    def handle_customer_query(self, message: str, session_id: str = None, user_info: Dict = None) -> Dict[str, Any]:
        """Handle customer support queries with intelligent responses"""
        
        # Initialize session if needed
        if session_id and session_id not in self.conversation_sessions:
            self.conversation_sessions[session_id] = {
                "messages": [],
                "user_info": user_info or {},
                "created_at": datetime.now().isoformat(),
                "issue_category": None,
                "escalated": False
            }
        
        # Analyze the query
        analysis = self._analyze_query(message)
        
        # Generate response
        if self.use_openai and self.client:
            response = self._generate_ai_response(message, analysis, session_id)
        else:
            response = self._generate_knowledge_based_response(message, analysis)
        
        # Store conversation
        if session_id:
            self.conversation_sessions[session_id]["messages"].extend([
                {"role": "user", "content": message, "timestamp": datetime.now().isoformat()},
                {"role": "assistant", "content": response["message"], "timestamp": datetime.now().isoformat()}
            ])
            
            if analysis.get("category"):
                self.conversation_sessions[session_id]["issue_category"] = analysis["category"]
        
        return response
    
    def _analyze_query(self, message: str) -> Dict[str, Any]:
        """Analyze customer query to determine category and intent"""
        
        message_lower = message.lower()
        
        # Greeting detection
        if any(word in message_lower for word in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            return {"category": "greeting", "intent": "greeting", "urgency": "low"}
        
        # Login/account issues
        elif any(word in message_lower for word in ['login', 'password', 'account', 'sign in', 'access']):
            return {"category": "account", "intent": "login_issue", "urgency": "medium"}
        
        # Agent-related queries
        elif any(word in message_lower for word in ['agent', 'ai', 'chat', 'response', 'not working']):
            return {"category": "agents", "intent": "agent_issue", "urgency": "medium"}
        
        # Billing/subscription
        elif any(word in message_lower for word in ['billing', 'subscription', 'payment', 'plan', 'upgrade', 'price']):
            return {"category": "billing", "intent": "billing_inquiry", "urgency": "high"}
        
        # Feature questions
        elif any(word in message_lower for word in ['how to', 'how do i', 'tutorial', 'guide', 'help']):
            return {"category": "guidance", "intent": "how_to", "urgency": "low"}
        
        # Technical issues
        elif any(word in message_lower for word in ['error', 'bug', 'broken', 'not working', 'problem']):
            return {"category": "technical", "intent": "technical_issue", "urgency": "high"}
        
        # General inquiry
        else:
            return {"category": "general", "intent": "general_inquiry", "urgency": "low"}
    
    def _generate_ai_response(self, message: str, analysis: Dict, session_id: str = None) -> Dict[str, Any]:
        """Generate AI-powered customer support response"""
        
        # Get conversation context
        context = ""
        if session_id and session_id in self.conversation_sessions:
            recent_messages = self.conversation_sessions[session_id]["messages"][-4:]
            context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in recent_messages])
        
        # Create system prompt
        system_prompt = f"""You are {self.agent_info['name']}, a {self.agent_info['role']} for Alpha1 AI platform.

{self.agent_info['backstory']}

Platform Knowledge:
- Alpha1 provides specialized AI agents for different tasks (Project Manager, Developer, QA Engineer, DevOps, AI/ML Engineer, Technical Writer, Marketing, AI Trainer)
- Users can chat with agents through our dashboard or API
- We offer different subscription plans with varying usage limits
- The platform includes project management, analytics, and collaboration features

Customer Query Category: {analysis.get('category', 'general')}
Intent: {analysis.get('intent', 'general_inquiry')}
Urgency: {analysis.get('urgency', 'low')}

Guidelines:
- Be friendly, helpful, and professional
- Provide specific, actionable solutions
- Ask clarifying questions when needed
- Escalate complex technical issues appropriately
- Always aim to resolve the customer's issue completely

Recent conversation context:
{context}

Respond to the customer's query with empathy and expertise."""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            
            return {
                "success": True,
                "message": ai_response,
                "category": analysis.get("category"),
                "urgency": analysis.get("urgency"),
                "escalation_needed": analysis.get("urgency") == "high" and "technical" in analysis.get("category", ""),
                "suggested_actions": self._get_suggested_actions(analysis)
            }
            
        except Exception as e:
            # Fallback to knowledge-based response
            return self._generate_knowledge_based_response(message, analysis)
    
    def _generate_knowledge_based_response(self, message: str, analysis: Dict) -> Dict[str, Any]:
        """Generate response based on knowledge base"""
        
        category = analysis.get("category", "general")
        intent = analysis.get("intent", "general_inquiry")
        
        if category == "greeting":
            return {
                "success": True,
                "message": "Hello! Welcome to Alpha1 AI platform support. I'm here to help you with any questions about our AI agents, features, or account. How can I assist you today?",
                "category": category,
                "suggested_actions": ["Ask about platform features", "Get help with agents", "Report an issue"]
            }
        
        elif category == "account":
            return {
                "success": True,
                "message": "I can help you with account and login issues. Here are some common solutions:\n\n• Check your email and password spelling\n• Use the 'Forgot Password' link if needed\n• Clear your browser cache and cookies\n• Try using incognito/private browsing mode\n\nIf you're still having trouble, please let me know the specific error message you're seeing.",
                "category": category,
                "suggested_actions": ["Reset password", "Clear browser cache", "Contact technical support"]
            }
        
        elif category == "agents":
            agents_info = self.knowledge_base["platform_features"]["ai_agents"]
            return {
                "success": True,
                "message": f"Our AI agents are designed to help with specific tasks:\n\n{chr(10).join(['• ' + agent for agent in agents_info['agents']])}\n\n{agents_info['usage']}\n\nWhich agent would you like to know more about, or are you experiencing a specific issue?",
                "category": category,
                "suggested_actions": ["Learn about specific agents", "Report agent issue", "Get usage tips"]
            }
        
        elif category == "billing":
            return {
                "success": True,
                "message": "I can help with billing and subscription questions. You can:\n\n• Check your subscription status in the dashboard\n• View usage analytics to track your consumption\n• Upgrade your plan if you're hitting limits\n• Contact our billing team for payment issues\n\nWhat specific billing question can I help you with?",
                "category": category,
                "urgency": "high",
                "suggested_actions": ["Check subscription status", "View usage analytics", "Contact billing team"]
            }
        
        elif category == "guidance":
            getting_started = self.knowledge_base["getting_started"]
            return {
                "success": True,
                "message": f"I'd be happy to guide you! Here's how to get started:\n\n{chr(10).join(['• ' + step for step in getting_started['new_users']])}\n\nBest practices:\n{chr(10).join(['• ' + tip for tip in getting_started['best_practices']])}\n\nWhat specific feature would you like help with?",
                "category": category,
                "suggested_actions": ["Platform tour", "Agent tutorials", "Best practices guide"]
            }
        
        elif category == "technical":
            return {
                "success": True,
                "message": "I'm sorry you're experiencing a technical issue. To help resolve this quickly:\n\n• Please describe the specific error or problem\n• Let me know which browser you're using\n• Tell me what you were trying to do when the issue occurred\n• Include any error messages you see\n\nI'll do my best to help, and can escalate to our technical team if needed.",
                "category": category,
                "urgency": "high",
                "escalation_needed": True,
                "suggested_actions": ["Provide error details", "Try basic troubleshooting", "Escalate to technical team"]
            }
        
        else:
            return {
                "success": True,
                "message": "Thank you for contacting Alpha1 support! I'm here to help with:\n\n• Platform features and navigation\n• AI agent usage and best practices\n• Account and billing questions\n• Technical troubleshooting\n• Feature requests and feedback\n\nHow can I assist you today?",
                "category": "general",
                "suggested_actions": ["Ask about features", "Get technical help", "Provide feedback"]
            }
    
    def _get_suggested_actions(self, analysis: Dict) -> List[str]:
        """Get suggested actions based on query analysis"""
        
        category = analysis.get("category", "general")
        
        action_map = {
            "account": ["Reset password", "Clear browser cache", "Contact support"],
            "agents": ["Try different agent", "Check agent status", "Review tutorials"],
            "billing": ["Check subscription", "View usage", "Contact billing"],
            "technical": ["Provide error details", "Try troubleshooting", "Escalate issue"],
            "guidance": ["View tutorials", "Read documentation", "Try demo"],
            "general": ["Browse help center", "Contact support", "Provide feedback"]
        }
        
        return action_map.get(category, ["Contact support", "Browse help center"])
    
    def get_conversation_summary(self, session_id: str) -> Dict[str, Any]:
        """Get summary of customer conversation"""
        
        if session_id not in self.conversation_sessions:
            return {"success": False, "error": "Session not found"}
        
        session = self.conversation_sessions[session_id]
        
        return {
            "success": True,
            "session_id": session_id,
            "created_at": session["created_at"],
            "message_count": len(session["messages"]),
            "issue_category": session.get("issue_category"),
            "escalated": session.get("escalated", False),
            "user_info": session.get("user_info", {}),
            "last_message": session["messages"][-1] if session["messages"] else None
        }
    
    def escalate_issue(self, session_id: str, reason: str) -> Dict[str, Any]:
        """Escalate customer issue to human support"""
        
        if session_id in self.conversation_sessions:
            self.conversation_sessions[session_id]["escalated"] = True
            self.conversation_sessions[session_id]["escalation_reason"] = reason
            self.conversation_sessions[session_id]["escalated_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": "Your issue has been escalated to our technical team. You'll receive a response within 24 hours.",
            "ticket_id": f"ALPHA1-{session_id[:8].upper()}",
            "escalation_reason": reason
        }

# Initialize the customer support agent
customer_support_agent = CustomerSupportAgent()

@customer_support_bp.route('/api/support/chat', methods=['POST'])
def support_chat():
    """Main customer support chat endpoint"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        session_id = data.get('session_id')
        user_info = data.get('user_info', {})
        
        if not message:
            return jsonify({
                "success": False,
                "error": "No message provided"
            }), 400
        
        # Generate session ID if not provided
        if not session_id:
            session_id = f"support_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{os.urandom(4).hex()}"
        
        response = customer_support_agent.handle_customer_query(message, session_id, user_info)
        response["session_id"] = session_id
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@customer_support_bp.route('/api/support/session/<session_id>', methods=['GET'])
def get_support_session(session_id):
    """Get customer support session details"""
    try:
        summary = customer_support_agent.get_conversation_summary(session_id)
        return jsonify(summary)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@customer_support_bp.route('/api/support/escalate', methods=['POST'])
def escalate_support():
    """Escalate customer support issue"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        reason = data.get('reason', 'Customer requested escalation')
        
        if not session_id:
            return jsonify({
                "success": False,
                "error": "Session ID required"
            }), 400
        
        result = customer_support_agent.escalate_issue(session_id, reason)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@customer_support_bp.route('/api/support/knowledge', methods=['GET'])
def get_knowledge_base():
    """Get customer support knowledge base"""
    try:
        return jsonify({
            "success": True,
            "knowledge_base": customer_support_agent.knowledge_base,
            "agent_info": customer_support_agent.agent_info
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500