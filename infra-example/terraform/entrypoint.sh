#!/bin/sh
set -e

ENDPOINT="${TF_VAR_ministack_endpoint:-http://ministack:4566}"
export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_ENDPOINT_URL="$ENDPOINT"

terraform init -input=false

# Import a resource into state only if it is not already tracked.
# Usage: try_import <terraform_address> <resource_id>
try_import() {
  local addr="$1"
  local id="$2"
  if terraform state show "$addr" > /dev/null 2>&1; then
    echo "already in state: $addr"
    return
  fi
  echo "importing $addr ($id)..."
  terraform import -input=false "$addr" "$id" 2>/dev/null && echo "imported $addr" || echo "not found in ministack: $addr (will be created)"
}

# ── S3 ────────────────────────────────────────────────────────────────────────
try_import aws_s3_bucket.app_files      "infra-example-files"
try_import aws_s3_bucket.frontend       "infra-example-frontend"

# ── DynamoDB ──────────────────────────────────────────────────────────────────
try_import aws_dynamodb_table.sessions  "infra-example-sessions"

# ── IAM ───────────────────────────────────────────────────────────────────────
try_import aws_iam_role.backend_role            "infra-example-backend-role"
try_import aws_iam_instance_profile.backend     "infra-example-backend-profile"

# ── Security Groups (need IDs from API) ───────────────────────────────────────
sg_id() {
  aws ec2 describe-security-groups \
    --endpoint-url="$ENDPOINT" \
    --filters "Name=group-name,Values=$1" \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null | grep -v '^None$' || true
}

SG_BACKEND=$(sg_id "infra-example-backend-sg")
SG_RDS=$(sg_id "infra-example-rds-sg")
[ -n "$SG_BACKEND" ] && try_import aws_security_group.backend "$SG_BACKEND"
[ -n "$SG_RDS"     ] && try_import aws_security_group.rds     "$SG_RDS"

# ── RDS ───────────────────────────────────────────────────────────────────────
try_import aws_db_subnet_group.main  "infra-example-subnet-group"
try_import aws_db_instance.main      "infra-example-db"

# ── EC2 ───────────────────────────────────────────────────────────────────────
EC2_ID=$(aws ec2 describe-instances \
  --endpoint-url="$ENDPOINT" \
  --filters "Name=tag:Name,Values=infra-example-backend" \
  --query 'Reservations[0].Instances[0].InstanceId' \
  --output text 2>/dev/null | grep -v '^None$' || true)
[ -n "$EC2_ID" ] && try_import aws_instance.backend "$EC2_ID"

echo ""
echo "==> Running terraform apply..."
terraform apply -input=false -auto-approve
