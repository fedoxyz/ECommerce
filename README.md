Clone this repo
`git clone https://github.com/fedoxyz/ECommerce.git`

Change directory
`cd ECommerce`

Dev:
`docker-compose --env-file .env -f docker-compose.yml -f docker-compose.dev.yml up` `--build` 

Prod:
`docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up` `--build` 


For redis run this on local machine:
`sudo sysctl -w vm.overcommit_memory=1`
