FROM oven/bun:slim AS build

WORKDIR /home/bun/app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

FROM oven/bun:slim AS packaging

WORKDIR /home/bun/app

COPY package.json bun.lockb ./

RUN bun install --production

COPY .env .env

COPY --from=build /home/bun/app/server server
COPY --from=build /home/bun/app/dist dist

EXPOSE 3000 443

CMD ["bun", "run", "start"]
