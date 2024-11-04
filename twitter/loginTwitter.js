const { loginTwitter } = require("./twitterAction")



async function main() {
  // for (let i = 41; i <= 50; i++) {
  //   await loginTwitter(i)
  // }
  let list = [13, 14, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 34, 36, 37, 39, 40, 41, 43, 45, 47, 48, 49]
  for (let i of list) {
    await loginTwitter(i)
  }
}


main()