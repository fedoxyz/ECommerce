Add --build when executing first time

Dev:
`docker-compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up`

Prod:
`docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up`

