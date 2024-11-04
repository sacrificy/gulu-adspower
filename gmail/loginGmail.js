const { loginGmail } = require("./gmailAction")



async function main() {
  for (let i = 41; i <= 50; i++) {
    await loginGmail(i)
  }
}


main()