
# CloudCost Guardian

AWS Cloud Cost Optimization & Governance Platform

CloudCost Guardian is a full-stack AWS cloud governance and cost optimization platform built to help organizations monitor, analyze, automate, and reduce cloud infrastructure spending.

The platform combines Terraform Infrastructure as Code (IaC), AWS serverless services, automation workflows, and a modern Next.js dashboard to provide centralized visibility into cloud costs, waste detection, budget tracking, forecasting, and governance enforcement.

---

# Features

## Cost Monitoring & Analytics
- AWS Cost and Usage Report (CUR) ingestion
- Athena-powered SQL cost analysis
- Daily spend tracking
- Team-based cost attribution
- Environment-based cost analysis
- Top AWS services by spend
- Cost forecasting using AWS Cost Explorer

## Waste Detection Automation
- Detect idle EC2 instances using CloudWatch metrics
- Detect unattached EBS volumes
- Identify over-provisioned compute resources
- Automated development environment shutdown schedules
- Real-time SNS alerting

## Governance & Security
- AWS Config compliance rules
- Required resource tagging enforcement
- CloudTrail auditing
- IAM least-privilege policies
- Team ownership tracking
- Environment separation (dev/staging/prod)

## Dashboard & Visualization
- Next.js 14 dashboard
- Recharts-based visualizations
- Budget status monitoring
- Rightsizing recommendations
- Cost trends and forecasting
- Resource waste visibility

## Infrastructure as Code
- Fully modular Terraform architecture
- Remote Terraform state with S3 backend
- Environment-based configuration
- Automated provisioning workflows

---

# Architecture Overview

The platform is built using six major layers:

| Layer | AWS Services | Purpose |
|---|---|---|
| Data Collection | CUR, CloudWatch, Config, CloudTrail | Collect raw billing and infrastructure data |
| Storage | Amazon S3, Glue Data Catalog | Store and catalog billing data |
| Query Engine | Amazon Athena | Query cost and usage data |
| Automation | Lambda, EventBridge, SNS, SES | Waste detection and alerting |
| Governance | AWS Config, IAM, CloudTrail | Compliance and auditing |
| Dashboard | Next.js, AWS SDK, Recharts | Visualization and reporting |

---

# Tech Stack

## Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React

## Backend & Cloud
- AWS Lambda
- Amazon Athena
- AWS Glue
- Amazon S3
- AWS Cost Explorer API
- AWS Budgets
- AWS Config
- AWS CloudTrail
- Amazon SNS
- Amazon SES
- EventBridge

## Infrastructure
- Terraform >= 1.6.0

## Deployment
- Vercel (Frontend)
- AWS (Infrastructure & Backend)

---

# Project Structure

```bash
cloudcost-guardian/
├── main.tf
├── variables.tf
├── outputs.tf
├── providers.tf
├── backend.tf
├── terraform.tfvars
└── modules/
    ├── foundation/
    ├── data-pipeline/
    ├── automation/
    └── security/
````

## Module Responsibilities

### foundation

Creates:

* CUR S3 bucket
* Athena results bucket
* CUR report definition

### data-pipeline

Creates:

* Glue database
* Glue crawler
* Athena workgroup
* Athena saved queries

### automation

Creates:

* Lambda functions
* EventBridge schedules
* SNS alerts
* AWS Budgets
* SES integration

### security

Creates:

* CloudTrail
* AWS Config
* Required tagging rules

---

# Prerequisites

Before starting, install:

| Tool      | Version  |
| --------- | -------- |
| Terraform | >= 1.6.0 |
| AWS CLI   | >= 2.0   |
| Node.js   | >= 18    |
| Git       | Latest   |

---

# AWS Account Setup

## 1. Create AWS Account

Create an AWS account from:
https://aws.amazon.com/

## 2. Enable MFA

Enable Multi-Factor Authentication on the root account immediately.

## 3. Create IAM Deployment User

Create a dedicated IAM user with Role permissions

## 4. Configure AWS CLI

```bash
aws configure
```

Example:

```bash
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region: us-east-1
Default output format: json
```

Verify identity:

```bash
aws sts get-caller-identity
```

---

# Terraform Backend Bootstrap

Terraform state storage must be created manually before initialization.

## Create State Bucket

```bash
aws s3api create-bucket \
  --bucket cloudcost-terraform-state \
  --region us-east-1
```

Enable versioning:

```bash
aws s3api put-bucket-versioning \
  --bucket cloudcost-terraform-state \
  --versioning-configuration Status=Enabled
```

---

# Terraform Backend Configuration

```hcl
terraform {
  backend "s3" {
    bucket       = "cloudcost-terraform-state"
    key          = "cloudcost-guardian/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

---

# Deployment Guide

## Step 1 — Initialize Terraform

```bash
terraform init -reconfigure
```

## Step 2 — Validate

```bash
terraform validate
```

## Step 3 — Review Plan

```bash
terraform plan -out=tfplan
```

## Step 4 — Apply Infrastructure

```bash
terraform apply tfplan
```

---

# Manual AWS Console Steps

Some AWS features require manual activation.

## Enable IAM Billing Access

Go to:
Billing → Billing Preferences → Activate IAM Access

## Enable Cost Explorer

Go to:
Billing → Cost Explorer

## Activate Cost Allocation Tags

Go to:
Billing → Cost Allocation Tags

Activate:

* Team
* Environment
* Owner
* Project
* ManagedBy

## Confirm SNS Subscription

Confirm email subscription from inbox.

## Verify SES Identity

Confirm SES verification email.

## Enable Compute Optimizer

```bash
aws compute-optimizer update-enrollment-status --status Active
```

---

# CUR & Athena Setup

## Wait for CUR Delivery

CUR files can take up to 24 hours to appear in S3.

## Run Glue Crawler

```bash
aws glue start-crawler --name cloudcost-guardian-cur-crawler
```

Verify:

```bash
aws glue get-tables \
  --database-name cloudcost_db
```

---

# Lambda Automation

## Automated Jobs

| Function                | Purpose                       |
| ----------------------- | ----------------------------- |
| idle-ec2-detector       | Detect idle EC2 instances     |
| unattached-ebs-detector | Detect unused EBS volumes     |
| dev-env-shutdown        | Stop dev/staging instances    |
| daily-cost-report       | Send daily cost report emails |

---

# Dashboard Setup

## Create Next.js App

```bash
npx create-next-app@latest cloudcost-ui \
  --typescript --tailwind --app --no-src-dir
```

## Install Dependencies

```bash
npm install \
  @aws-sdk/client-cost-explorer \
  @aws-sdk/client-ec2 \
  @aws-sdk/client-budgets \
  @aws-sdk/client-compute-optimizer \
  recharts \
  lucide-react
```

---

# Environment Variables

Create `.env.local`

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

Add `.env.local` to `.gitignore`.

---

# API Routes

| Route                  | Purpose                     |
| ---------------------- | --------------------------- |
| `/api/costs`           | Cost analytics              |
| `/api/waste`           | Waste detection             |
| `/api/budgets`         | Budget tracking             |
| `/api/recommendations` | Rightsizing recommendations |

---

# Cost Allocation Tags

Required tags:

| Tag         | Example                                     |
| ----------- | ------------------------------------------- |
| Team        | engineering                                 |
| Environment | dev                                         |
| Owner       | [jane@company.com](mailto:jane@company.com) |
| Project     | cloudcost-guardian                          |
| ManagedBy   | Terraform                                   |

---

# Testing

## Verify Infrastructure

```bash
terraform output
```

## Check S3 Buckets

```bash
aws s3 ls | grep cloudcost
```

## Check Lambda Functions

```bash
aws lambda list-functions
```

## Verify CUR

```bash
aws cur describe-report-definitions --region us-east-1
```

---

# Example Athena Queries

## Daily Spend by Team

* Cost attribution per team

## Spend by Environment

* Dev vs staging vs production costs

## EC2 Cost by Instance

* Per-instance spend analysis

## EBS Volume Costs

* Detect unused volumes

## Top Services

* Top 10 AWS services by spend

---

# Troubleshooting

## 301 Redirect on Terraform Init

Cause:

* S3 bucket region mismatch

Fix:

* Ensure `backend.tf` region matches bucket region

---

## CUR Files Missing

Cause:

* CUR delivery delay

Fix:

* Wait up to 24 hours

---

## Glue Schema Not Found

Cause:

* Crawler not run

Fix:

```bash
aws glue start-crawler --name cloudcost-guardian-cur-crawler
```

---

## SES Email Not Sending

Cause:

* SES identity not verified

Fix:

* Verify email identity in SES

---

# Security Design

## IAM Least Privilege

Lambda permissions are scoped tightly:

* Stop only `dev` and `staging` instances
* Publish only to specific SNS topics
* Read-only Cost Explorer access

## CloudTrail

* Multi-region logging
* Log validation enabled
* API activity auditing

## AWS Config

Enforces:

* Required tagging rules
* Compliance monitoring

---

# Why Not AWS Trusted Advisor?

AWS Trusted Advisor cost optimization checks require Business or Enterprise support plans.

Instead, this platform implements:

* Custom Lambda-based waste detection
* CloudWatch metric analysis
* EventBridge scheduling
* SNS alerting

This provides:

* Zero additional support costs
* Full customization
* Infrastructure-level automation

---

# Cost Estimate

Estimated operational cost:

| Service    | Monthly Cost |
| ---------- | ------------ |
| Lambda     | Free Tier    |
| S3         | ~$0.01       |
| Athena     | ~$0.01       |
| Glue       | Free Tier    |
| SNS        | Free Tier    |
| SES        | Free Tier    |
| CloudTrail | Free Tier    |
| Vercel     | Free         |

Estimated total:

* ~$0.12/month on Free Tier
* Typically under $5/month at moderate scale

---

# Future Improvements

* Multi-account AWS Organizations support
* Slack & Microsoft Teams alert integrations
* AI-powered anomaly detection
* Historical forecasting dashboards
* Kubernetes cost monitoring
* Reserved Instance recommendations
* Savings Plans analysis

---

# Key Learning Outcomes

This project demonstrates:

* Terraform Infrastructure as Code
* AWS serverless architecture
* Cloud cost optimization strategies
* Cloud governance implementation
* AWS billing and CUR analytics
* Serverless automation workflows
* Full-stack cloud engineering
* FinOps best practices

---

# Author

Michael Ebo Andorful
Frontend & Cloud Engineer

---

# License

MIT License

---

# Acknowledgements

Built using:

* AWS
* Terraform
* Next.js
* Vercel
* Recharts
* AWS SDK for JavaScript

```
```
