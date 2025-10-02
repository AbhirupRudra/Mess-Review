# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application's code to the working directory
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable for the admin password
# This should be set during container run, e.g., docker run -e ADMIN_PASSWORD=your_secret_password
ENV ADMIN_PASSWORD=""

# Run backend.py when the container launches
# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend:app"]