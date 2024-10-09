# SaveDeezNotes

## Installation

```sh
# Using Yarn
yarn install

# Using NPM
npm install
```

## Usage

### Setting environment variables

1. Edit `.env.example` or if you're hosting it in Vercel, add these variables:

   - `DISCORD_TOKEN` - Your Discord bot's token
   - `KEY` - Your encryption key, could be anything
   - `GUILD_ID` - Server your bot should create and store notes

2. Rename `.env.example` into `.env` (Ignore this if you're hosting it on Vercel)

### Starting the server

If you are hosting this on Vercel, you can skip this part.

First build the project

```sh
yarn build
```

And start it

```sh
yarn start
```

Your application will be accessible from `localhost:3000`
