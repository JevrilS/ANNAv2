# Build the Docker image for Node.js backend
docker build -t gcr.io/capstoneanna/node-backend .

# Push the Docker image to Google Container Registry
docker push gcr.io/capstoneanna/node-backend

# Deploy the Node.js backend to Google Cloud Run
gcloud run deploy node-backend `
  --image gcr.io/capstoneanna/node-backend `
  --platform managed `
  --region asia-northeast1 `
  --allow-unauthenticated
