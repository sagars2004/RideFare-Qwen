#!/bin/bash
set -e

echo "Deploying RideFare Backend on Alibaba Cloud ECS..."

# Update system
apt-get update
apt-get install -y python3-pip python3-venv nginx

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install requirements
pip install fastapi uvicorn pydantic requests

# Run server with uvicorn in the background (nohup for simple detached execution)
# Note: For production, setup a systemd service and use Gunicorn
nohup uvicorn backend.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &

echo "Backend deployed and running on port 8000."
