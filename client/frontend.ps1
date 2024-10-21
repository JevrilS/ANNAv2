# Build the Docker image for React frontend
docker build -t gcr.io/annadialogflow/react-frontend .

# Push the Docker image to Google Container Registry
docker push gcr.io/annadialogflow/react-frontend

# Deploy the React frontend to Google Cloud Run
gcloud run deploy react-frontend `
  --image gcr.io/annadialogflow/react-frontend `
  --platform managed `
  --region asia-northeast1 `
  --allow-unauthenticated
