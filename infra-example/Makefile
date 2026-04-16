.PHONY: up down tf-init tf-apply tf-destroy tf-plan logs

# Start all containers (ministack + backend + frontend)
up:
	docker compose up -d --build

# Stop all containers
down:
	docker compose down -v

# Initialize Terraform
tf-init:
	cd terraform && terraform init

# Plan Terraform changes against local ministack
tf-plan: tf-init
	cd terraform && terraform plan

# Apply Terraform to ministack (creates S3, DynamoDB, RDS, EC2, CloudFront)
tf-apply: tf-init
	cd terraform && terraform apply -auto-approve

# Destroy all Terraform resources in ministack
tf-destroy:
	cd terraform && terraform destroy -auto-approve

# Full local dev setup: start ministack first, then apply infra
dev: up
	@echo "Waiting for ministack to be ready..."
	@until curl -sf http://localhost:4566/_localstack/health > /dev/null; do sleep 2; done
	@echo "ministack ready — applying Terraform..."
	$(MAKE) tf-apply
	@echo ""
	@echo "  Frontend : http://localhost:8080"
	@echo "  Backend  : http://localhost:3000"
	@echo "  MiniStack: http://localhost:4566"

logs:
	docker compose logs -f
