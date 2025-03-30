Clone this repo
`git clone https://github.com/fedoxyz/ECommerce.git`

Change directory
`cd ECommerce`

Dev:
`docker-compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up` `--build` 

Prod:
`docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up` `--build` 

For setting up Kibana, first change password of `kibana_system` user in elasticsearch container when it is running:
`docker exec -it <elastic container id> bash`
`./bin/elasticsearch-reset-password --username kibana_system -i`

Set this password to `KIBANA_PASSWORD` variable in `.env`

For redis run this on local machine:
`sudo sysctl -w vm.overcommit_memory=1`

For API docs with Swagger:
`http://localhost:3000/api/docs`

Bull board with tasks:
`http://localhost:3000/admin/queues`
