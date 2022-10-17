const fs = require('fs');
const { actionList } = require('./twitter.json');

const twitterData = fs.readFileSync('./twitter.txt');
const twitterList = twitterData.toString().split('\r\n');

function getFrends(num) {
  let str = ''
  for (let i = 0; i < num; i++) {
    const index = parseInt(Math.random() * (twitterList.length), 10)
    const name = twitterList[index]
    str = str + ` ${name}`
  }
  return str
}

async function like(page) {
  await page.waitForSelector('div[data-testid="like"]', { visible: true })
  await page.click('div[data-testid="like"]')
  await page.waitForTimeout(1000)
}

async function retweet(page) {
  await page.waitForSelector('div[data-testid="retweet"]', { visible: true })
  await page.click('div[data-testid="retweet"]')
  await page.waitForSelector('div[data-testid="retweetConfirm"]', { visible: true })
  await page.click('div[data-testid="retweetConfirm"]')
  await page.waitForTimeout(1000)
}

async function tweet(page) {
  const content = getFrends(5)
  await page.waitForSelector('div[data-testid="tweetTextarea_0"]', { visible: true })
  await page.type('div[data-testid="tweetTextarea_0"]', content + ' ')
  await page.waitForTimeout(1000)
  await page.click('div[data-testid="tweetButtonInline"]')
  await page.waitForTimeout(3000)
}

async function follow(page, id) {
  await page.goto(`https://twitter.com/${id}`)
  await page.waitForSelector('div[data-testid*="follow"]', { visible: true })
  await page.keyboard.press('Escape') // special case
  await page.click('div[data-testid*="follow"]')
  await page.waitForTimeout(1000)
}

async function goto(page, link) {
  await page.goto(link)
}

async function twitter(browser, page) {
  for (let i = 0; i < actionList.length; i++) {
    const actionItem = actionList[i]
    const { action, value } = actionItem
    switch (action) {
      case 'like':
        await like(page)
        break;
      case 'retweet':
        await retweet(page)
        break;
      case 'tweet':
        await tweet(page)
        break;
      case 'follow':
        await follow(page, value)
        break;
      case 'goto':
        await goto(page, value)
        break;
      default:
        break;
    }
  }
}

module.exports = {
  twitter: twitter
};