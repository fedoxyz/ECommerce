Dev:
`docker-compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up --build`

Prod:
`docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up --build`

