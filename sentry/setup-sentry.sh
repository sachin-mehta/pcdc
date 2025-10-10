#!/bin/bash

# Setup script for Sentry 9.1.2
# This script helps initialize Sentry with proper configuration

set -e

echo "Setting up Sentry 9.1.2..."

# Generate a secret key for Sentry
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
echo "Generated secret key: $SECRET_KEY"

# Update docker-compose with the secret key
sed -i.bak "s/your-secret-key-change-this-in-production/$SECRET_KEY/g" docker-compose.sentry.yml

echo "Starting Sentry services..."
docker-compose -f docker-compose.sentry.yml up -d

echo "Waiting for services to be ready..."
sleep 30

echo "Running Sentry migrations and creating superuser..."
docker-compose -f docker-compose.sentry.yml exec sentry-web sentry upgrade --noinput

echo "Creating superuser account..."
# Create superuser with default credentials (user should change these)
echo "Creating superuser with default credentials..."
echo "Username: admin"
echo "Email: admin@localhost"
echo "Password: admin123"
echo ""

# Create superuser non-interactively
docker-compose -f docker-compose.sentry.yml exec -T sentry-web sentry createuser \
    --email admin@localhost \
    --password admin123 \
    --superuser \
    --no-input || echo "Superuser may already exist, continuing..."

echo ""
echo "IMPORTANT: Please change the default superuser password after first login!"

echo ""
echo "Sentry is now running at: http://localhost:9000"
echo "Secret key: $SECRET_KEY"
echo ""
echo "To stop Sentry: docker-compose -f docker-compose.sentry.yml down"
echo "To view logs: docker-compose -f docker-compose.sentry.yml logs -f"
