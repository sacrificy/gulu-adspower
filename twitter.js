const fs = require('fs');

const twitterData = fs.readFileSync('./twitter.txt');
const twitterList = twitterData.toString().split('\r\n');

const commentData = fs.readFileSync('./comment.txt');
const commentList = commentData.toString().split('\r\n');

function getFrends(num) {
  const commentIndex = parseInt(Math.random() * (commentList.length), 10)
  let str = commentList[commentIndex] + ' '
  for (let i = 0; i < num; i++) {
    const twitterIndex = parseInt(Math.random() * (twitterList.length), 10)
    const name = twitterList[twitterIndex]
    str = str + ` ${name}`
  }
  return str
}

async function like(page) {
  await page.waitForSelector('div[data-testid="like"]', { visible: true })
  await page.click('div[data-testid="like"]')
  await page.waitForTimeout(2000)
}

async function retweet(page) {
  await page.waitForSelector('div[data-testid="retweet"]', { visible: true })
  await page.click('div[data-testid="retweet"]')
  await page.waitForTimeout(2000)
  await page.waitForSelector('div[data-testid="retweetConfirm"]', { visible: true })
  await page.click('div[data-testid="retweetConfirm"]')
  await page.waitForTimeout(2000)
}

async function tweet(page) {
  const content = getFrends(3)
  await page.waitForSelector('div[data-testid="tweetTextarea_0"]', { visible: true })
  await page.type('div[data-testid="tweetTextarea_0"]', content + ' ')
  await page.waitForTimeout(2000)
  await page.click('div[data-testid="tweetButtonInline"]')
  await page.waitForTimeout(3000)
}

async function follow(page, id) {
  await page.goto(`https://twitter.com/${id}`)
  await page.waitForSelector('div[data-testid*="follow"]', { visible: true })
  await page.keyboard.press('Escape') // special case
  await page.click('div[data-testid*="follow"]')
  await page.waitForTimeout(2000)
}

async function goto(page, link) {
  await page.goto(link)
  await page.waitForTimeout(2000)
  const url = page.url()
  if (url === 'https://twitter.com/account/access') {
    console.log('账号异常处理')
    await page.waitForSelector('input[type="submit"]', { visible: true })
    await Promise.all([
      page.waitForNavigation(),
      page.click('input[type="submit"]'),
    ]);
    await page.waitForTimeout(2000)
    await page.goto(link)
  }
  await page.reload() //special case
  await page.waitForTimeout(2000)
}

async function twitter(browser, page, curAcrionList) {
  for (let i = 0; i < curAcrionList.length; i++) {
    const actionItem = curAcrionList[i]
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