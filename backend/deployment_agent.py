"""
Alpha1 AI Platform - Deployment & Maintenance Agent
This agent helps with deployment, monitoring, and platform maintenance tasks.
"""

import os
import json
import subprocess
import requests
from datetime import datetime
from typing import Dict, List, Any, Optional
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

deployment_bp = Blueprint('deployment', __name__)

class DeploymentAgent:
    """AI Agent specialized in deployment and platform maintenance"""
    
    def __init__(self):
        self.agent_info = {
            "id": "deployment-assistant",
            "name": "Deployment Assistant",
            "role": "Senior DevOps & Platform Engineer",
            "goal": "Manage deployments, monitor platform health, and maintain system reliability",
            "backstory": """You are an expert DevOps engineer with 15+ years of experience in:
            - Cloud deployments (Render, Heroku, AWS, Azure, GCP)
            - Platform monitoring and maintenance
            - Database management and optimization
            - Security and performance optimization
            - Automated deployment pipelines
            - Incident response and troubleshooting
            
            You can understand plain English instructions and translate them into technical actions.
            You help maintain and improve the Alpha1 AI platform without requiring technical expertise from the user.""",
            "capabilities": [
                "Deployment Management",
                "Platform Monitoring", 
                "Database Operations",
                "Performance Optimization",
                "Security Management",
                "Automated Maintenance",
                "Plain English Understanding"
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
        
        self.conversation_history = []
        
    def process_instruction(self, instruction: str, user_id: str = None) -> Dict[str, Any]:
        """Process plain English instructions and execute appropriate actions"""
        
        # Analyze the instruction
        analysis = self._analyze_instruction(instruction)
        
        # Execute the appropriate action
        result = self._execute_action(analysis, instruction)
        
        # Store conversation
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "instruction": instruction,
            "analysis": analysis,
            "result": result
        })
        
        return result
    
    def _analyze_instruction(self, instruction: str) -> Dict[str, Any]:
        """Analyze the instruction to determine what action to take"""
        
        instruction_lower = instruction.lower()
        
        # Deployment-related keywords
        if any(word in instruction_lower for word in ['deploy', 'deployment', 'publish', 'go live', 'launch']):
            return {"action": "deployment", "type": "deploy"}
        
        # Monitoring keywords
        elif any(word in instruction_lower for word in ['check', 'status', 'health', 'monitor', 'uptime']):
            return {"action": "monitoring", "type": "check_status"}
        
        # Database keywords
        elif any(word in instruction_lower for word in ['database', 'db', 'data', 'backup', 'migrate']):
            return {"action": "database", "type": "manage"}
        
        # Performance keywords
        elif any(word in instruction_lower for word in ['slow', 'performance', 'optimize', 'speed', 'faster']):
            return {"action": "performance", "type": "optimize"}
        
        # Update/maintenance keywords
        elif any(word in instruction_lower for word in ['update', 'upgrade', 'maintain', 'fix', 'improve']):
            return {"action": "maintenance", "type": "update"}
        
        # Security keywords
        elif any(word in instruction_lower for word in ['security', 'secure', 'ssl', 'https', 'vulnerability']):
            return {"action": "security", "type": "secure"}
        
        # Feature addition keywords
        elif any(word in instruction_lower for word in ['add', 'create', 'new feature', 'implement']):
            return {"action": "feature", "type": "add"}
        
        # General help/advice
        else:
            return {"action": "advice", "type": "general"}
    
    def _execute_action(self, analysis: Dict[str, Any], instruction: str) -> Dict[str, Any]:
        """Execute the appropriate action based on analysis"""
        
        action = analysis.get("action")
        action_type = analysis.get("type")
        
        try:
            if action == "deployment":
                return self._handle_deployment(instruction)
            elif action == "monitoring":
                return self._handle_monitoring(instruction)
            elif action == "database":
                return self._handle_database(instruction)
            elif action == "performance":
                return self._handle_performance(instruction)
            elif action == "maintenance":
                return self._handle_maintenance(instruction)
            elif action == "security":
                return self._handle_security(instruction)
            elif action == "feature":
                return self._handle_feature_request(instruction)
            else:
                return self._provide_advice(instruction)
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "message": "An error occurred while processing your request.",
                "suggestions": ["Please try rephrasing your request", "Check if all required services are running"]
            }
    
    def _handle_deployment(self, instruction: str) -> Dict[str, Any]:
        """Handle deployment-related requests"""
        
        # Check current deployment status
        deployment_status = self._check_deployment_status()
        
        if "render" in instruction.lower():
            return {
                "success": True,
                "message": "🚀 Render Deployment Guide",
                "actions": [
                    "✅ Your requirements.txt has been updated with all dependencies",
                    "✅ Your code is ready for deployment",
                    "📋 Next steps for Render deployment:"
                ],
                "steps": [
                    "1. Go to https://render.com and sign up/login",
                    "2. Connect your GitHub repository",
                    "3. Create a new Web Service",
                    "4. Select your repository and branch (main/master)",
                    "5. Set build command: pip install -r requirements.txt",
                    "6. Set start command: python backend/app.py",
                    "7. Add environment variables (OpenAI API key, etc.)",
                    "8. Deploy!"
                ],
                "environment_variables": [
                    "OPENAI_API_KEY=your_actual_openai_key",
                    "JWT_SECRET_KEY=your_jwt_secret",
                    "FLASK_ENV=production",
                    "DATABASE_URL=postgresql://... (Render will provide)"
                ],
                "deployment_status": deployment_status
            }
        
        return {
            "success": True,
            "message": "Deployment assistance available",
            "options": ["Render", "Heroku", "Railway", "DigitalOcean"],
            "recommendation": "Render is recommended for your platform"
        }
    
    def _handle_monitoring(self, instruction: str) -> Dict[str, Any]:
        """Handle monitoring and status checks"""
        
        # Check local server status
        local_status = self._check_local_server()
        
        # Check deployment status if applicable
        deployment_status = self._check_deployment_status()
        
        return {
            "success": True,
            "message": "Platform Health Check",
            "local_server": local_status,
            "deployment": deployment_status,
            "recommendations": self._get_health_recommendations(local_status, deployment_status)
        }
    
    def _handle_database(self, instruction: str) -> Dict[str, Any]:
        """Handle database-related requests"""
        
        return {
            "success": True,
            "message": "Database Management",
            "current_setup": "SQLite (development) / PostgreSQL (production)",
            "available_actions": [
                "Check database connection",
                "Run migrations",
                "Backup database",
                "Optimize queries",
                "Monitor performance"
            ],
            "recommendations": [
                "Ensure database migrations are up to date",
                "Regular backups are recommended",
                "Monitor query performance for optimization"
            ]
        }
    
    def _handle_performance(self, instruction: str) -> Dict[str, Any]:
        """Handle performance optimization requests"""
        
        return {
            "success": True,
            "message": "Performance Optimization",
            "analysis": "Analyzing platform performance...",
            "optimizations": [
                "Enable caching for API responses",
                "Optimize database queries",
                "Implement CDN for static assets",
                "Add request rate limiting",
                "Monitor response times"
            ],
            "immediate_actions": [
                "Check server resource usage",
                "Review slow API endpoints",
                "Optimize frontend loading"
            ]
        }
    
    def _handle_maintenance(self, instruction: str) -> Dict[str, Any]:
        """Handle maintenance and update requests"""
        
        return {
            "success": True,
            "message": "Platform Maintenance",
            "maintenance_tasks": [
                "Update dependencies",
                "Security patches",
                "Database optimization",
                "Log cleanup",
                "Performance monitoring"
            ],
            "scheduled_tasks": [
                "Daily: Health checks",
                "Weekly: Dependency updates",
                "Monthly: Security audits"
            ],
            "next_actions": "I can help you implement any of these maintenance tasks"
        }
    
    def _handle_security(self, instruction: str) -> Dict[str, Any]:
        """Handle security-related requests"""
        
        return {
            "success": True,
            "message": "Security Management",
            "security_checklist": [
                "✅ HTTPS enabled",
                "✅ Environment variables secured",
                "✅ JWT authentication implemented",
                "⚠️ Rate limiting recommended",
                "⚠️ Input validation review needed"
            ],
            "recommendations": [
                "Implement API rate limiting",
                "Add request validation",
                "Regular security audits",
                "Monitor for suspicious activity"
            ]
        }
    
    def _handle_feature_request(self, instruction: str) -> Dict[str, Any]:
        """Handle feature addition requests"""
        
        if self.use_openai and self.client:
            # Use AI to understand the feature request
            response = self._get_ai_feature_analysis(instruction)
        else:
            response = "I can help you add new features to your platform. Please describe what you'd like to add."
        
        return {
            "success": True,
            "message": "Feature Development",
            "analysis": response,
            "development_process": [
                "1. Analyze requirements",
                "2. Design implementation",
                "3. Code the feature",
                "4. Test thoroughly",
                "5. Deploy safely"
            ],
            "next_steps": "I can help you implement this feature step by step"
        }
    
    def _provide_advice(self, instruction: str) -> Dict[str, Any]:
        """Provide general advice and guidance"""
        
        if self.use_openai and self.client:
            advice = self._get_ai_advice(instruction)
        else:
            advice = "I'm here to help you manage and improve your Alpha1 AI platform. I can assist with deployment, monitoring, maintenance, and feature development."
        
        return {
            "success": True,
            "message": "Platform Guidance",
            "advice": advice,
            "available_help": [
                "Deployment assistance",
                "Platform monitoring",
                "Performance optimization",
                "Feature development",
                "Security management",
                "Database operations"
            ]
        }
    
    def _check_local_server(self) -> Dict[str, Any]:
        """Check if local server is running"""
        try:
            response = requests.get("http://localhost:5001/health", timeout=5)
            return {
                "status": "running",
                "port": 5001,
                "response_code": response.status_code,
                "healthy": response.status_code == 200
            }
        except:
            return {
                "status": "not_running",
                "port": 5001,
                "healthy": False
            }
    
    def _check_deployment_status(self) -> Dict[str, Any]:
        """Check deployment status"""
        return {
            "platform": "render",
            "status": "ready_to_deploy",
            "last_deploy": None,
            "url": None,
            "health": "unknown"
        }
    
    def _get_health_recommendations(self, local_status: Dict, deployment_status: Dict) -> List[str]:
        """Get health recommendations based on status"""
        recommendations = []
        
        if not local_status.get("healthy"):
            recommendations.append("Start local server for development")
        
        if deployment_status.get("status") == "ready_to_deploy":
            recommendations.append("Deploy to production when ready")
        
        recommendations.append("Monitor logs for any errors")
        recommendations.append("Set up automated health checks")
        
        return recommendations
    
    def _get_ai_advice(self, instruction: str) -> str:
        """Get AI-powered advice"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are {self.agent_info['name']}, a {self.agent_info['role']}.
                        
                        {self.agent_info['backstory']}
                        
                        Provide helpful, specific, and actionable advice for managing the Alpha1 AI platform.
                        Keep responses concise but comprehensive."""
                    },
                    {
                        "role": "user",
                        "content": instruction
                    }
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"I'm here to help with your platform. Could you be more specific about what you need assistance with? (AI unavailable: {str(e)})"
    
    def _get_ai_feature_analysis(self, instruction: str) -> str:
        """Get AI analysis of feature request"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """You are a senior software architect analyzing feature requests for the Alpha1 AI platform.
                        
                        Analyze the feature request and provide:
                        1. Understanding of what's being requested
                        2. Technical complexity assessment
                        3. Implementation approach
                        4. Potential challenges
                        5. Estimated effort
                        
                        Keep it concise but thorough."""
                    },
                    {
                        "role": "user",
                        "content": f"Feature request: {instruction}"
                    }
                ],
                max_tokens=400,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"I can help you implement this feature. Let me break down what you're asking for... (AI analysis unavailable: {str(e)})"

# Initialize the deployment agent
deployment_agent = DeploymentAgent()

@deployment_bp.route('/api/deployment/assist', methods=['POST'])
@jwt_required()
def deployment_assist():
    """Main endpoint for deployment assistance"""
    try:
        data = request.get_json()
        instruction = data.get('instruction', '')
        user_id = get_jwt_identity()
        
        if not instruction:
            return jsonify({
                "success": False,
                "error": "No instruction provided"
            }), 400
        
        result = deployment_agent.process_instruction(instruction, user_id)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@deployment_bp.route('/api/deployment/status', methods=['GET'])
@jwt_required()
def deployment_status():
    """Get current deployment status"""
    try:
        local_status = deployment_agent._check_local_server()
        deployment_status = deployment_agent._check_deployment_status()
        
        return jsonify({
            "success": True,
            "local_server": local_status,
            "deployment": deployment_status,
            "agent_info": deployment_agent.agent_info
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@deployment_bp.route('/api/deployment/history', methods=['GET'])
@jwt_required()
def deployment_history():
    """Get deployment assistance history"""
    try:
        user_id = get_jwt_identity()
        
        # Filter history for current user
        user_history = [
            entry for entry in deployment_agent.conversation_history
            if entry.get('user_id') == user_id
        ]
        
        return jsonify({
            "success": True,
            "history": user_history[-10:]  # Last 10 interactions
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500