const { loginDiscord } = require("./discordAction")

async function main() {
  for (let i = 15; i <= 50; i++) {
    await loginDiscord(i)
  }
}


main()