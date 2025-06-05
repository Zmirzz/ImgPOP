ImgPOP: AI-Powered Image Editor

## Local Development

Build the Docker images and start the services using Docker Compose:

```bash
docker compose build
docker compose up
```

The backend will be available on `http://localhost:5001` and the frontend on `http://localhost:5173`. If your system has an NVIDIA GPU and the [nvidia-container toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) is installed, GPU resources will be exposed to the backend container.
