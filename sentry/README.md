# Sentry 9.1.2 Setup

This directory contains all the necessary files to run Sentry version 9.1.2 using Docker and Docker Compose.

## Files Overview

- `Dockerfile.sentry` - Dockerfile for Sentry 9.1.2
- `docker-compose.sentry.yml` - Docker Compose configuration with PostgreSQL and Redis
- `setup-sentry.sh` - Automated setup script for Unix/Linux/macOS
- `setup-sentry.py` - Python setup script (cross-platform)

## Quick Start

### For Unix/Linux/macOS:

```bash
cd sentry
chmod +x setup-sentry.sh
./setup-sentry.sh
```

### For Windows:

#### Python Script 
```cmd
cd sentry
python setup-sentry.py
```


This script will:
- Generate a secure secret key
- Start PostgreSQL and Redis services
- Run Sentry migrations (**This can take 30-60 minutes**)
- Create a superuser account
- Start all Sentry services

### 2. Access Sentry

Once setup is complete, Sentry will be available at:
- **URL**: http://localhost:9000
- **Email**: admin@localhost
- **Password**: admin123

**Important**: Change the default password after first login!

## Manual Setup

If you prefer to run the setup manually:

### 1. Start Services

```bash
docker-compose -f docker-compose.sentry.yml up -d
```

### 2. Run Migrations

```bash
docker-compose -f docker-compose.sentry.yml exec sentry-web sentry upgrade --noinput
```

### 3. Create Superuser

```bash
docker-compose -f docker-compose.sentry.yml exec sentry-web sentry createuser --email admin@localhost --password admin123 --superuser --no-input
```

## Services

The setup includes the following services:

- **sentry-web**: Main Sentry web interface (port 9000)
- **sentry-worker**: Background task processor
- **sentry-cron**: Scheduled task runner
- **postgres**: PostgreSQL database
- **redis**: Redis cache

## Configuration

### Environment Variables

Key environment variables in `docker-compose.sentry.yml`:

- `SENTRY_SECRET_KEY`: Cryptographic key for Sentry
- `SENTRY_POSTGRES_HOST`: PostgreSQL host
- `SENTRY_REDIS_HOST`: Redis host
- `SENTRY_SINGLE_ORGANIZATION`: Enable single organization mode

### Database

- **Database**: sentry
- **Username**: sentry
- **Password**: sentry
- **Host**: postgres (internal Docker network)

## Troubleshooting

### Migration Issues

Sentry 9.1.2 has 700+ database migrations that can take a long time:

```bash
# Monitor migration progress
docker-compose -f docker-compose.sentry.yml logs -f sentry-web

# Check if migrations are still running
docker-compose -f docker-compose.sentry.yml exec sentry-web sentry upgrade --noinput
```

### Common Issues

1. **Platform compatibility**: The setup uses `platform: linux/amd64` for Apple Silicon compatibility
2. **Memory requirements**: Ensure you have at least 2GB RAM available for Docker
3. **Port conflicts**: Make sure port 9000 is not in use

### Windows-Specific Issues


1. **Python not found**: Make sure Python is installed and in your PATH:
   ```cmd
   python --version
   ```
   
2. **Docker Desktop not running**: Ensure Docker Desktop is installed and running before running the setup scripts.

3. **File path issues**: If you encounter path-related errors, try running the scripts from the exact directory where the `docker-compose.sentry.yml` file is located.

### Reset Everything

To start fresh:

```bash
# Stop and remove all containers
docker-compose -f docker-compose.sentry.yml down -v

# Remove volumes (this will delete all data)
docker volume rm sentry_postgres_data sentry_redis_data sentry_sentry_data

# Run setup again
./setup-sentry.sh
```

## Management Commands

### View Logs

```bash
# All services
docker-compose -f docker-compose.sentry.yml logs -f

# Specific service
docker-compose -f docker-compose.sentry.yml logs -f sentry-web
```

### Stop Services

```bash
docker-compose -f docker-compose.sentry.yml down
```

### Restart Services

```bash
docker-compose -f docker-compose.sentry.yml restart
```

### Access Sentry Shell

```bash
docker-compose -f docker-compose.sentry.yml exec sentry-web sentry shell
```

## Security Notes

- The default superuser password should be changed immediately
- The secret key is auto-generated but should be backed up
- Consider using environment files for production deployments
- Database credentials are hardcoded for development - change for production

## Version Information

- **Sentry Version**: 9.1.2
- **PostgreSQL Version**: 13
- **Redis Version**: 6-alpine
- **Platform**: linux/amd64 (for Apple Silicon compatibility)

## Support

For issues with this setup, check:
1. Docker and Docker Compose are installed and running
2. Port 9000 is available
3. Sufficient system resources (RAM, disk space)
4. Migration logs for any database errors
