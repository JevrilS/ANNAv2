# Build the Docker image for Django backend
docker build -t gcr.io/capstoneanna/django-backend .

# Push the Docker image to Google Container Registry
docker push gcr.io/capstoneanna/django-backend

# Deploy the Django backend to Google Cloud Run
gcloud run deploy django-backend `
  --image gcr.io/capstoneanna/django-backend `
  --platform managed `
  --region asia-northeast1 `
  --allow-unauthenticated `
  --add-cloudsql-instances annadialogflow:asia-northeast1:anna `
  --set-env-vars DB_HOST=/cloudsql/annadialogflow:asia-northeast1:anna
  