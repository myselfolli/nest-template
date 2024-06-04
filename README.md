# About

This project is a base template to quickly start a new Nest.js project. It has the following features set up in advance:

- Microservices architecture
  - API Gateway
  - Auth Service
  - RabbitMQ as message broker
- Database
  - PostgreSQL (TimeScaleDB)
  - TypeORM
  - Migrations
  - First "User" Entity and Repository
- Docker
  - Dockerfile for each service
  - Docker Compose
  - npm script to start a development environment

## Getting Started

1. Clone the repository
2. Set up the environment variables by copying the `.env.example` file to `.env` and filling in the values
3. Run the following command to start the development environment:

```bash
npm run dev
```

4. Generate a new migration for the User entity:

```bash
npm run migration:pg:generate
```

And execute the migration

```bash
npm run migration:pg:up
```

5. Access the API Gateway at `http://localhost:5050`

## Dependencies

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
