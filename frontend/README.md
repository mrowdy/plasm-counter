# Frontend - Plasm Counter

React + TypeScript + Vite frontend.

## Development

```bash
npm install
cp .env.example .env
# Edit .env with your API Gateway URL
npm run dev
```

## Deployment

### Automatic (CI/CD)
Push to `main` branch - GitHub Actions deploys automatically.

### Manual
```bash
npm run build
aws s3 sync dist/ s3://<bucket-name> --delete
aws cloudfront create-invalidation --distribution-id <dist-id> --paths "/*"
```

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run lint` - ESLint
