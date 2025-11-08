# Backend

Minimal Docker setup for AWS Lambda.

## Build

```bash
docker build -t counter-backend:latest .
```

## Test Locally

```bash
# Run container
docker run -p 9000:8080 counter-backend:latest

# Test (in another terminal)
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
```

Expected: Console output shows "Docker setup works!"
