const { getBrowser } = require('./adspowerAction');
const fs = require('fs');

const tweetData = fs.readFileSync('./tweet.txt');
const tweetList = tweetData.toString().split('\r\n');

// 养号 gmail discord twitter

async function main() {
  for (let i = 11; i <= 50; i++) {
    console.log(i, '养号开始')
    const [browser, page] = await getBrowser(i)
    try {
      await page.goto('https://mail.google.com/mail/u/0/#inbox')
      await page.waitForTimeout(2000)

      await page.goto('https://discord.com/channels/@me')
      await page.waitForTimeout(2000)

      await page.goto('https://twitter.com/home')
      await page.waitForTimeout(2000)
      await page.goto('https://twitter.com/home')
      await page.waitForSelector('div[data-testid="tweetTextarea_0"]', { visible: true })
      await page.type('div[data-testid="tweetTextarea_0"]', tweetList[i - 1] + '  ')
      await page.waitForTimeout(2000)
      await page.click('div[data-testid="tweetButtonInline"]')
      await page.waitForTimeout(3000)

    } catch (error) {
      console.log(error)
      console.log(i, '养号失败')
    }
    browser.close()
  }
}

main()