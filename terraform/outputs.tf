# Alpha1 AI Platform - Terraform Outputs

# VPC Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

# EKS Cluster Outputs
output "cluster_id" {
  description = "EKS cluster ID"
  value       = aws_eks_cluster.main.id
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = aws_eks_cluster.main.arn
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "cluster_iam_role_name" {
  description = "IAM role name associated with EKS cluster"
  value       = aws_iam_role.eks_cluster.name
}

output "cluster_iam_role_arn" {
  description = "IAM role ARN associated with EKS cluster"
  value       = aws_iam_role.eks_cluster.arn
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
}

output "cluster_primary_security_group_id" {
  description = "The cluster primary security group ID created by the EKS cluster"
  value       = aws_eks_cluster.main.vpc_config[0].cluster_security_group_id
}

output "cluster_oidc_issuer_url" {
  description = "The URL on the EKS cluster OIDC Issuer"
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# EKS Node Group Outputs
output "node_groups" {
  description = "EKS node groups"
  value       = aws_eks_node_group.main
}

output "node_security_group_id" {
  description = "ID of the EKS node shared security group"
  value       = aws_security_group.eks_nodes.id
}

# Database Outputs
output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "db_instance_name" {
  description = "RDS instance name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_username" {
  description = "RDS instance root username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "db_subnet_group_name" {
  description = "RDS subnet group name"
  value       = aws_db_subnet_group.main.name
}

output "db_parameter_group_name" {
  description = "RDS parameter group name"
  value       = aws_db_instance.main.parameter_group_name
}

# Redis Outputs
output "redis_cluster_address" {
  description = "Redis cluster endpoint address"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
  sensitive   = true
}

output "redis_cluster_port" {
  description = "Redis cluster port"
  value       = aws_elasticache_replication_group.main.port
}

output "redis_subnet_group_name" {
  description = "Redis subnet group name"
  value       = aws_elasticache_subnet_group.main.name
}

# S3 Outputs
output "s3_bucket_id" {
  description = "S3 bucket ID"
  value       = aws_s3_bucket.app_data.id
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN"
  value       = aws_s3_bucket.app_data.arn
}

output "s3_bucket_domain_name" {
  description = "S3 bucket domain name"
  value       = aws_s3_bucket.app_data.bucket_domain_name
}

output "s3_bucket_regional_domain_name" {
  description = "S3 bucket region-specific domain name"
  value       = aws_s3_bucket.app_data.bucket_regional_domain_name
}

# IAM Outputs
output "worker_iam_role_name" {
  description = "IAM role name for EKS worker nodes"
  value       = aws_iam_role.eks_nodes.name
}

output "worker_iam_role_arn" {
  description = "IAM role ARN for EKS worker nodes"
  value       = aws_iam_role.eks_nodes.arn
}

output "cluster_autoscaler_iam_role_arn" {
  description = "IAM role ARN for cluster autoscaler"
  value       = var.enable_cluster_autoscaler ? aws_iam_role.cluster_autoscaler[0].arn : null
}

output "aws_load_balancer_controller_iam_role_arn" {
  description = "IAM role ARN for AWS Load Balancer Controller"
  value       = aws_iam_role.aws_load_balancer_controller.arn
}

output "app_service_account_iam_role_arn" {
  description = "IAM role ARN for application service account"
  value       = aws_iam_role.app_service_account.arn
}

# Security Group Outputs
output "cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = aws_security_group.eks_cluster.id
}

output "worker_security_group_id" {
  description = "EKS worker nodes security group ID"
  value       = aws_security_group.eks_nodes.id
}

output "rds_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
}

output "redis_security_group_id" {
  description = "Redis security group ID"
  value       = aws_security_group.redis.id
}

# CloudWatch Outputs
output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.eks_cluster.name
}

output "application_log_group_name" {
  description = "Application CloudWatch log group name"
  value       = aws_cloudwatch_log_group.application.name
}

# OIDC Provider Outputs
output "oidc_provider_arn" {
  description = "The ARN of the OIDC Provider if enabled"
  value       = var.enable_cluster_autoscaler ? aws_iam_openid_connect_provider.eks[0].arn : null
}

# Configuration for kubectl
output "configure_kubectl" {
  description = "Configure kubectl: make sure you're logged in with the correct AWS profile and run the following command to update your kubeconfig"
  value       = "aws eks --region ${var.aws_region} update-kubeconfig --name ${aws_eks_cluster.main.id}"
}

# Environment Configuration
output "environment_config" {
  description = "Environment configuration for the application"
  value = {
    AWS_REGION                = var.aws_region
    EKS_CLUSTER_NAME         = aws_eks_cluster.main.id
    DATABASE_URL             = "postgresql://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
    REDIS_URL                = "redis://${aws_elasticache_replication_group.main.primary_endpoint_address}:${aws_elasticache_replication_group.main.port}"
    S3_BUCKET_NAME           = aws_s3_bucket.app_data.id
    CLOUDWATCH_LOG_GROUP     = aws_cloudwatch_log_group.application.name
    APP_SERVICE_ACCOUNT_ROLE = aws_iam_role.app_service_account.arn
  }
  sensitive = true
}

# Deployment Information
output "deployment_info" {
  description = "Important information for deployment"
  value = {
    cluster_name                           = aws_eks_cluster.main.id
    cluster_endpoint                       = aws_eks_cluster.main.endpoint
    cluster_ca_certificate                 = aws_eks_cluster.main.certificate_authority[0].data
    aws_load_balancer_controller_role_arn  = aws_iam_role.aws_load_balancer_controller.arn
    cluster_autoscaler_role_arn           = var.enable_cluster_autoscaler ? aws_iam_role.cluster_autoscaler[0].arn : null
    app_service_account_role_arn          = aws_iam_role.app_service_account.arn
    oidc_provider_arn                     = var.enable_cluster_autoscaler ? aws_iam_openid_connect_provider.eks[0].arn : null
  }
}

# Monitoring URLs (when deployed)
output "monitoring_info" {
  description = "Monitoring service information"
  value = var.enable_monitoring ? {
    grafana_url     = "http://grafana.${var.domain_name != "" ? var.domain_name : "localhost"}"
    prometheus_url  = "http://prometheus.${var.domain_name != "" ? var.domain_name : "localhost"}"
    grafana_admin   = "admin"
    note           = "Access Grafana with the admin password specified in variables"
  } : null
}

# Cost Estimation
output "estimated_monthly_cost" {
  description = "Estimated monthly cost breakdown (approximate)"
  value = {
    eks_cluster     = "$73 (cluster) + $30-120 (nodes)"
    rds_postgres    = "$15-50 (depending on instance class)"
    elasticache     = "$15-30 (depending on node type)"
    nat_gateway     = "$45 (per gateway)"
    data_transfer   = "Variable based on usage"
    cloudwatch_logs = "$0.50 per GB ingested"
    s3_storage      = "$0.023 per GB"
    total_estimate  = "$200-400 per month (varies by usage)"
    note           = "Costs vary significantly based on actual usage, data transfer, and instance sizes"
  }
}