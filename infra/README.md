# RideFare Infrastructure (Alibaba Cloud ECS)

This folder contains the deployment configuration for the RideFare FastAPI backend on Alibaba Cloud.

## Deployment Target

The backend orchestration service is deployed on an **Alibaba Cloud ECS (Elastic Compute Service)** instance running Ubuntu.
This deployment fulfills the Track 3 requirement for Alibaba Cloud infrastructure usage.

## Setup Instructions

1. **Launch an ECS Instance:**
   - In the Alibaba Cloud Console, launch an ECS instance (e.g., ecs.t6-c1m1.large).
   - Use an Ubuntu 22.04 LTS image.
   - Assign an Elastic IP.
   - Configure a Security Group to open port `8000` (FastAPI) and port `22` (SSH).

2. **Run the Deployment Script:**
   SSH into the instance and run the `deploy.sh` script to install dependencies and run the server.

```bash
# Upload code to the instance
scp -i ~/.ssh/ali-key.pem -r ../backend root@<ECS_IP>:/opt/ridefare/backend
scp -i ~/.ssh/ali-key.pem deploy.sh root@<ECS_IP>:/opt/ridefare/
scp -i ~/.ssh/ali-key.pem ../.env root@<ECS_IP>:/opt/ridefare/

# SSH in and run
ssh -i ~/.ssh/ali-key.pem root@<ECS_IP>
cd /opt/ridefare
chmod +x deploy.sh
./deploy.sh
```

The FastAPI application will be served at `http://<ECS_IP>:8000`.
