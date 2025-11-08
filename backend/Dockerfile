# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY src/ ./src/

# Install dev dependencies for build
RUN npm ci && npm run build

# Production stage
FROM public.ecr.aws/lambda/nodejs:18
COPY --from=builder /app/dist/ ${LAMBDA_TASK_ROOT}/
COPY --from=builder /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules
COPY --from=builder /app/package*.json ${LAMBDA_TASK_ROOT}/

ENV NODE_ENV=production

CMD ["handlers/test.handler"]
