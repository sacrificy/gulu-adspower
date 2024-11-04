const { setWallet } = require("./metamaskAction")

async function main() {
  for (let i = 18; i <= 18; i++) {
    await setWallet(i)
  }
}

main()