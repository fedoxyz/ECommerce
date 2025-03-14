Clone this repo
`git clone https://github.com/fedoxyz/ECommerce.git`

Change directory
`cd ECommerce`

Add `--build` if not builded yet:

Dev:
`docker-compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up`

Prod:
`docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up`

