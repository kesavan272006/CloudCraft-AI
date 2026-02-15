# Use a lightweight official Python image
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy your requirements.txt first to use Docker caching
COPY requirements.txt .

# Install your project dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your backend code
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Command to start your FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]