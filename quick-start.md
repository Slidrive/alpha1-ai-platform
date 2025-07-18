# AI Platform - Quick Deployment Guide

**The Fastest Way to Deploy Your AI Platform**

## One-Command Deployment (Recommended)

Deploy the entire AI platform with a single command:

```bash
curl -sSL https://raw.githubusercontent.com/your-repo/ai-platform/main/scripts/deploy.sh | bash
```

**What this does:**
- Installs Docker and all dependencies automatically
- Downloads and configures all services
- Sets up database and security
- Starts all components
- Provides immediate access

**Access your platform:**
- **Dashboard:** http://localhost
- **API:** http://localhost:5001
- **Monitoring:** http://localhost:3000

## Alternative Methods

**Docker Compose (2 commands):**
```bash
git clone https://github.com/your-repo/ai-platform.git
cd ai-platform && docker-compose up -d
```

**Manual Setup (for developers):**
```bash
git clone https://github.com/your-repo/ai-platform.git
cd ai-platform && ./scripts/dev.sh
```

## System Requirements

**Minimum:**
- Ubuntu 20.04+ or compatible Linux
- 4 GB RAM
- 20 GB storage
- Internet connection

**Recommended:**
- Ubuntu 22.04 LTS
- 8+ GB RAM
- 50+ GB SSD storage

## Features Included

✅ **Real-time AI Analytics Dashboard**  
✅ **3 Pre-trained AI Models** (Predictive, Anomaly Detection, Classification)  
✅ **Real-time Data Processing** (1000+ items/second)  
✅ **Comprehensive Monitoring** (Prometheus + Grafana)  
✅ **Enterprise Security** (RBAC, Encryption, Threat Detection)  
✅ **REST API** (Complete with authentication)  
✅ **Database Integration** (PostgreSQL + Redis)  
✅ **Automated Testing** (Unit, Integration, Performance)  

## Immediate Next Steps

1. **Access the Dashboard:** Open http://localhost in your browser
2. **Explore AI Models:** Navigate to the AI Models section
3. **Process Data:** Upload data in the Data Processing section
4. **Monitor Performance:** Check the Monitoring dashboard
5. **Review API:** Access http://localhost:5001/api/health

## Getting Help

- **Full Documentation:** See `complete-documentation.pdf`
- **Troubleshooting:** Run `./scripts/health-check.sh`
- **Support:** Check the troubleshooting section in the documentation

## Production Deployment

For production environments:
- Use the Kubernetes deployment with `./scripts/deploy-k8s.sh`
- Configure SSL certificates and domain names
- Set up automated backups
- Enable monitoring alerts

The platform is production-ready with enterprise-grade security, monitoring, and scalability features built-in.

