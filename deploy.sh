#!/bin/bash

# Alpha1 AI Platform Deployment Script
# This script deploys the complete Alpha1 AI platform to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE_DEFAULT="default"
NAMESPACE_DATABASE="database"
NAMESPACE_MONITORING="monitoring"
NAMESPACE_SECURITY="security"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if kubectl is available
check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    print_success "kubectl is available"
}

# Function to check if cluster is accessible
check_cluster() {
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    print_success "Kubernetes cluster is accessible"
}

# Function to create namespaces
create_namespaces() {
    print_status "Creating namespaces..."
    
    # Extract and apply namespace definitions from YAML files
    kubectl apply -f k8s/database-deployment.yaml --dry-run=client -o yaml | grep -A 10 "kind: Namespace" | kubectl apply -f - || true
    kubectl apply -f k8s/monitoring-deployment.yaml --dry-run=client -o yaml | grep -A 10 "kind: Namespace" | kubectl apply -f - || true
    kubectl apply -f k8s/security-deployment.yaml --dry-run=client -o yaml | grep -A 10 "kind: Namespace" | kubectl apply -f - || true
    
    print_success "Namespaces created"
}

# Function to deploy database layer
deploy_database() {
    print_status "Deploying database layer..."
    
    kubectl apply -f k8s/database-deployment.yaml
    
    print_status "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgresql -n $NAMESPACE_DATABASE --timeout=300s
    
    print_status "Waiting for Redis to be ready..."
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE_DATABASE --timeout=300s
    
    print_success "Database layer deployed successfully"
}

# Function to deploy security layer
deploy_security() {
    print_status "Deploying security layer..."
    
    kubectl apply -f k8s/security-deployment.yaml
    
    print_success "Security layer deployed successfully"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend application..."
    
    kubectl apply -f k8s/backend-deployment.yaml
    
    print_status "Waiting for backend to be ready..."
    kubectl wait --for=condition=ready pod -l app=alpha1-backend -n $NAMESPACE_DEFAULT --timeout=300s
    
    print_success "Backend deployed successfully"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend application..."
    
    kubectl apply -f k8s/frontend-deployment.yaml
    
    print_status "Waiting for frontend to be ready..."
    kubectl wait --for=condition=ready pod -l app=alpha1-frontend -n $NAMESPACE_DEFAULT --timeout=300s
    
    print_success "Frontend deployed successfully"
}

# Function to deploy monitoring
deploy_monitoring() {
    print_status "Deploying monitoring stack..."
    
    kubectl apply -f k8s/monitoring-deployment.yaml
    
    print_status "Waiting for Prometheus to be ready..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n $NAMESPACE_MONITORING --timeout=300s
    
    print_status "Waiting for Grafana to be ready..."
    kubectl wait --for=condition=ready pod -l app=grafana -n $NAMESPACE_MONITORING --timeout=300s
    
    print_success "Monitoring stack deployed successfully"
}

# Function to run database initialization
init_database() {
    print_status "Initializing database..."
    
    # Wait for the init job to complete
    kubectl wait --for=condition=complete job/postgresql-init -n $NAMESPACE_DATABASE --timeout=300s
    
    print_success "Database initialized successfully"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check all pods are running
    print_status "Checking pod status..."
    kubectl get pods --all-namespaces
    
    # Check services
    print_status "Checking services..."
    kubectl get services --all-namespaces
    
    # Check ingress
    print_status "Checking ingress..."
    kubectl get ingress --all-namespaces
    
    print_success "Deployment verification completed"
}

# Function to display access information
show_access_info() {
    print_status "Deployment completed! Access information:"
    
    echo ""
    echo "=== Alpha1 AI Platform Access Information ==="
    echo ""
    
    # Get LoadBalancer IPs/URLs
    FRONTEND_LB=$(kubectl get service alpha1-frontend-service -n $NAMESPACE_DEFAULT -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "<pending>")
    GRAFANA_LB=$(kubectl get service grafana-service -n $NAMESPACE_MONITORING -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "<pending>")
    
    echo "🌐 Frontend Application:"
    if [ "$FRONTEND_LB" != "<pending>" ]; then
        echo "   URL: https://$FRONTEND_LB"
    else
        echo "   URL: Use 'kubectl port-forward service/alpha1-frontend-service 3000:80 -n default' for local access"
        echo "   Then visit: http://localhost:3000"
    fi
    
    echo ""
    echo "📊 Monitoring (Grafana):"
    if [ "$GRAFANA_LB" != "<pending>" ]; then
        echo "   URL: http://$GRAFANA_LB:3000"
    else
        echo "   URL: Use 'kubectl port-forward service/grafana-service 3000:3000 -n monitoring' for local access"
        echo "   Then visit: http://localhost:3000"
    fi
    echo "   Username: admin"
    echo "   Password: admin123"
    
    echo ""
    echo "📈 Prometheus:"
    echo "   URL: Use 'kubectl port-forward service/prometheus-service 9090:9090 -n monitoring' for local access"
    echo "   Then visit: http://localhost:9090"
    
    echo ""
    echo "🔒 Security Scanner (OWASP ZAP):"
    echo "   URL: Use 'kubectl port-forward service/security-scanner-service 8080:8080 -n security' for local access"
    echo "   Then visit: http://localhost:8080"
    
    echo ""
    echo "📋 Useful Commands:"
    echo "   View all pods: kubectl get pods --all-namespaces"
    echo "   View logs: kubectl logs -f deployment/<deployment-name> -n <namespace>"
    echo "   Scale deployment: kubectl scale deployment <deployment-name> --replicas=<number> -n <namespace>"
    echo "   Delete deployment: ./deploy.sh --delete"
    
    echo ""
    print_success "Alpha1 AI Platform is ready for use!"
}

# Function to delete deployment
delete_deployment() {
    print_warning "Deleting Alpha1 AI Platform deployment..."
    
    read -p "Are you sure you want to delete the entire deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deletion cancelled"
        exit 0
    fi
    
    print_status "Deleting applications..."
    kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found=true
    kubectl delete -f k8s/backend-deployment.yaml --ignore-not-found=true
    
    print_status "Deleting monitoring..."
    kubectl delete -f k8s/monitoring-deployment.yaml --ignore-not-found=true
    
    print_status "Deleting security..."
    kubectl delete -f k8s/security-deployment.yaml --ignore-not-found=true
    
    print_status "Deleting database..."
    kubectl delete -f k8s/database-deployment.yaml --ignore-not-found=true
    
    print_status "Deleting namespaces..."
    kubectl delete namespace $NAMESPACE_DATABASE --ignore-not-found=true
    kubectl delete namespace $NAMESPACE_MONITORING --ignore-not-found=true
    kubectl delete namespace $NAMESPACE_SECURITY --ignore-not-found=true
    
    print_success "Alpha1 AI Platform deployment deleted"
}

# Function to show help
show_help() {
    echo "Alpha1 AI Platform Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --help, -h          Show this help message"
    echo "  --delete            Delete the entire deployment"
    echo "  --verify            Verify existing deployment"
    echo "  --database-only     Deploy only database layer"
    echo "  --backend-only      Deploy only backend application"
    echo "  --frontend-only     Deploy only frontend application"
    echo "  --monitoring-only   Deploy only monitoring stack"
    echo "  --security-only     Deploy only security layer"
    echo ""
    echo "Examples:"
    echo "  $0                  # Full deployment"
    echo "  $0 --verify         # Verify existing deployment"
    echo "  $0 --delete         # Delete deployment"
    echo "  $0 --backend-only   # Deploy only backend"
}

# Main deployment function
main() {
    print_status "Starting Alpha1 AI Platform deployment..."
    
    check_kubectl
    check_cluster
    create_namespaces
    deploy_security
    deploy_database
    init_database
    deploy_backend
    deploy_frontend
    deploy_monitoring
    verify_deployment
    show_access_info
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --delete)
        check_kubectl
        check_cluster
        delete_deployment
        exit 0
        ;;
    --verify)
        check_kubectl
        check_cluster
        verify_deployment
        exit 0
        ;;
    --database-only)
        check_kubectl
        check_cluster
        create_namespaces
        deploy_database
        init_database
        exit 0
        ;;
    --backend-only)
        check_kubectl
        check_cluster
        deploy_backend
        exit 0
        ;;
    --frontend-only)
        check_kubectl
        check_cluster
        deploy_frontend
        exit 0
        ;;
    --monitoring-only)
        check_kubectl
        check_cluster
        create_namespaces
        deploy_monitoring
        exit 0
        ;;
    --security-only)
        check_kubectl
        check_cluster
        create_namespaces
        deploy_security
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac