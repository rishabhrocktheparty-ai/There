variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "there"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "api_domain" {
  description = "API domain for backend"
  type        = string
  default     = "api.yourdomain.com"
}