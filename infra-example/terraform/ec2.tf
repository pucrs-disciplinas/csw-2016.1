data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_security_group" "backend" {
  name        = "${var.app_name}-backend-sg"
  description = "Allow HTTP and SSH"

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-backend-sg"
  }
}

resource "aws_iam_role" "backend_role" {
  name = "${var.app_name}-backend-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "backend_policy" {
  name = "${var.app_name}-backend-policy"
  role = aws_iam_role.backend_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
        Resource = [
          aws_s3_bucket.app_files.arn,
          "${aws_s3_bucket.app_files.arn}/*"
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem", "dynamodb:Scan", "dynamodb:Query"]
        Resource = aws_dynamodb_table.sessions.arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "backend" {
  name = "${var.app_name}-backend-profile"
  role = aws_iam_role.backend_role.name
}

resource "aws_instance" "backend" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.backend.id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs

    mkdir -p /opt/app
    cd /opt/app

    # In production, download the app bundle from S3 or CodeDeploy
    # aws s3 cp s3://${aws_s3_bucket.app_files.id}/backend.tar.gz .

    cat > /etc/systemd/system/backend.service <<SERVICE
    [Unit]
    Description=Backend API
    After=network.target

    [Service]
    ExecStart=/usr/bin/node /opt/app/dist/index.js
    Restart=always
    Environment=PORT=3000
    Environment=AWS_REGION=${var.aws_region}
    Environment=S3_BUCKET=${aws_s3_bucket.app_files.id}
    Environment=DYNAMO_TABLE=${aws_dynamodb_table.sessions.name}
    Environment=DB_HOST=${aws_db_instance.main.address}
    Environment=DB_PORT=${aws_db_instance.main.port}
    Environment=DB_NAME=${var.db_name}
    Environment=DB_USER=${var.db_username}
    Environment=DB_PASSWORD=${var.db_password}

    [Install]
    WantedBy=multi-user.target
    SERVICE

    systemctl enable backend
    systemctl start backend
  EOF
  )

  tags = {
    Name        = "${var.app_name}-backend"
    Environment = "local"
  }


}
