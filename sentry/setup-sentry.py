#!/usr/bin/env python3
"""
Setup script for Sentry 9.1.2
This script helps initialize Sentry with proper configuration
Windows-compatible version of setup-sentry.sh
"""

import os
import sys
import subprocess
import secrets
import time
import re

def run_command(command, shell=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=shell, capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(f"Error: {e.stderr}")
        return None

def check_docker():
    """Check if Docker is installed and running"""
    print("Checking Docker installation...")
    docker_version = run_command("docker --version")
    if not docker_version:
        print("ERROR: Docker is not installed or not running!")
        print("Please install Docker Desktop and make sure it's running.")
        return False
    
    print(f"Docker found: {docker_version}")
    
    # Check if Docker daemon is running
    docker_info = run_command("docker info")
    if not docker_info:
        print("ERROR: Docker daemon is not running!")
        print("Please start Docker Desktop.")
        return False
    
    print("Docker is running ✓")
    return True

def generate_secret_key():
    """Generate a secret key for Sentry"""
    print("Generating secret key for Sentry...")
    secret_key = secrets.token_urlsafe(50)
    print(f"Generated secret key: {secret_key}")
    return secret_key

def update_docker_compose(secret_key):
    """Update docker-compose.sentry.yml with the secret key"""
    print("Updating docker-compose.sentry.yml with secret key...")
    
    compose_file = "docker-compose.sentry.yml"
    if not os.path.exists(compose_file):
        print(f"ERROR: {compose_file} not found!")
        return False
    
    # Read the file
    with open(compose_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Create backup
    backup_file = f"{compose_file}.bak"
    with open(backup_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created backup: {backup_file}")
    
    # Replace the secret key
    # Look for the current secret key pattern
    pattern = r'SENTRY_SECRET_KEY: ".*?"'
    replacement = f'SENTRY_SECRET_KEY: "{secret_key}"'
    
    updated_content = re.sub(pattern, replacement, content)
    
    # Write the updated content
    with open(compose_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    
    print("Updated docker-compose.sentry.yml ✓")
    return True

def start_sentry_services():
    """Start Sentry services using docker-compose"""
    print("Starting Sentry services...")
    
    # Start services in detached mode
    result = run_command("docker-compose -f docker-compose.sentry.yml up -d")
    if result is None:
        print("ERROR: Failed to start Sentry services!")
        return False
    
    print("Sentry services started ✓")
    return True

def wait_for_services():
    """Wait for services to be ready"""
    print("Waiting for services to be ready...")
    print("This may take a few minutes...")
    
    # Wait for 30 seconds
    for i in range(30):
        print(f"Waiting... {i+1}/30 seconds")
        time.sleep(1)
    
    print("Services should be ready now ✓")
    return True

def run_sentry_migrations():
    """Run Sentry migrations and create superuser"""
    print("Running Sentry migrations and creating superuser...")
    
    # Run migrations
    result = run_command("docker-compose -f docker-compose.sentry.yml exec sentry-web sentry upgrade --noinput")
    if result is None:
        print("ERROR: Failed to run Sentry migrations!")
        return False
    
    print("Migrations completed ✓")
    return True

def create_superuser():
    """Create superuser account"""
    print("Creating superuser account...")
    print("Creating superuser with default credentials...")
    print("Username: admin")
    print("Email: admin@localhost")
    print("Password: admin123")
    print("")
    
    # Create superuser non-interactively
    result = run_command(
        "docker-compose -f docker-compose.sentry.yml exec -T sentry-web sentry createuser "
        "--email admin@localhost "
        "--password admin123 "
        "--superuser "
        "--no-input"
    )
    
    if result is None:
        print("Superuser may already exist, continuing...")
    else:
        print("Superuser created ✓")
    
    return True

def main():
    """Main setup function"""
    print("Setting up Sentry 9.1.2...")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("docker-compose.sentry.yml"):
        print("ERROR: docker-compose.sentry.yml not found!")
        print("Please run this script from the sentry directory.")
        return False
    
    # Check Docker
    if not check_docker():
        return False
    
    # Generate secret key
    secret_key = generate_secret_key()
    
    # Update docker-compose file
    if not update_docker_compose(secret_key):
        return False
    
    # Start services
    if not start_sentry_services():
        return False
    
    # Wait for services
    if not wait_for_services():
        return False
    
    # Run migrations
    if not run_sentry_migrations():
        return False
    
    # Create superuser
    if not create_superuser():
        return False
    
    print("")
    print("=" * 50)
    print("IMPORTANT: Please change the default superuser password after first login!")
    print("")
    print("Sentry is now running at: http://localhost:9000")
    print(f"Secret key: {secret_key}")
    print("")
    print("To stop Sentry: docker-compose -f docker-compose.sentry.yml down")
    print("To view logs: docker-compose -f docker-compose.sentry.yml logs -f")
    print("")
    print("Setup completed successfully! ✓")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\nSetup interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)
