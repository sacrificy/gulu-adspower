const { loginPremint, premintStart } = require("./premintAction")

const sleep = (time = 1000) => new Promise((resolve, reject) => { setTimeout(resolve, time) });

async function main() {
  for (let i = 28; i <= 50; i++) {
    // await loginPremint(i)
    await premintStart(i)
    await sleep(1500)
  }
}

main()