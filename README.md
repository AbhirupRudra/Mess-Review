# Mess-Review

## Deployment

This application is designed to be deployed using Docker.

### Prerequisites

- Docker installed on your machine.
- A Firebase project with Firestore enabled.
- A Firebase project with Firestore enabled. You will need to obtain a `serviceAccountKey.json` file from your Firebase project settings. A `serviceAccountKey.json.example` file is provided to show the required structure.

### Building the Docker Image

To build the Docker image, run the following command in the root directory of the project:

```bash
docker build -t mess-review .
```

### Running the Docker Container

To run the Docker container, you need to provide the `ADMIN_PASSWORD` as an environment variable and mount your `serviceAccountKey.json` file into the container.

First, rename or copy the `serviceAccountKey.json.example` to `serviceAccountKey.json` and fill it with your actual Firebase credentials.

Then, run the following command, replacing `your_secret_password` with your desired admin password and ensuring your `serviceAccountKey.json` is in the root of the project directory.

```bash
docker run -d -p 8000:8000 \
  -e ADMIN_PASSWORD=your_secret_password \
  -v $(pwd)/serviceAccountKey.json:/app/serviceAccountKey.json \
  --name mess-review-container \
  mess-review
```

The application will be accessible at `http://localhost:8000`.