# Slika samo zapakira artefakt joba build (koda + produkcijske odvisnosti).
# node:slim (glibc), ker je bcrypt nameščen na Ubuntu runnerju.
FROM node:24-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node app/ ./
USER node
EXPOSE 10000
CMD ["node", "server.js"]
