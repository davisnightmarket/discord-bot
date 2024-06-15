# Night Market Discord Bot is "crabapple"

## Build/Deploy from the repo root:
- aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin 947372742919.dkr.ecr.us-west-1.amazonaws.com
- docker build -t 947372742919.dkr.ecr.us-west-1.amazonaws.com/nm-crabapple:latest .
- docker push  947372742919.dkr.ecr.us-west-1.amazonaws.com/nm-crabapple:latest
- (Visit AWS and update the task there - not sure how to do it with the client)
- aws ecs update-service --cluster nm-crabapple --service (nm-crabapple | nm-crabapple-jr) --task-definition (nm-crabapple | nm-crabapple-jr)

## What does the bot do?

It's current main feature is to help people add to the food count, but it's always open to suggestions!

## How do I run crabapple for local dev?

-   You need node and npm installed and the code downloaded
-   You need a zip file with credentials for Google and Discord. Get from night-tech team.
-   from the repo root run:
    -   `npm install`
    -   `npm start`

### Step #2: Configure it

Get the config zip from someone and unzip in your repo root.

### Step #3: Run it!

The first time you run it, use `npm i` in the folder with the code to download the dependencies.

After that, just run `npm start` in the folder with the code to boot crabapple up.

## How does crabapple work?

I recomend reading https://discord.js.org/#/docs/discord.js/main/general/welcome to get started.

Okay, this will (mostly) assume that you know how javascript and the discord api works.
Hopefully even if you don't this will still be interesting and informative.
