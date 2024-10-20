# Use the official Python runtime with Python 3.12.4
FROM python:3.12.4

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies (optional if needed)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    build-essential

# Copy the requirements file and install dependencies
COPY requirements.txt . 
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the Django application code
COPY . .

# Expose the port Google Cloud Run will listen on
EXPOSE 8080

# Run the Django server (using Gunicorn for production) and bind to port 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "backend.wsgi:application", "--timeout", "120"]
