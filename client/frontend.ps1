# Build the Docker image for React frontend
docker build -t gcr.io/capstoneanna/react-frontend .

# Push the Docker image to Google Container Registry
docker push gcr.io/capstoneanna/react-frontend

# Deploy the React frontend to Google Cloud Run
gcloud run deploy react-frontend `
  --image gcr.io/capstoneanna/react-frontend `
  --platform managed `
  --region asia-northeast1 `
  --allow-unauthenticated
