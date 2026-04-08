FROM node:20-alpine

WORKDIR /app

# Install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# App source will be bind-mounted in docker-compose for dev
COPY . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 4000

CMD ["npm", "run", "dev", "--", "-p", "4000", "-H", "0.0.0.0"]

