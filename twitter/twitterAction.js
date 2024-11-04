const fs = require('fs');
const { getBrowser } = require('../adspower/adspowerAction');

const twitterData = fs.readFileSync('../config/twitter/twitterAccound.txt');
const twitterList = twitterData.toString().split('\r\n');

const commentData = fs.readFileSync('../config/twitter/comment.txt');
const commentList = commentData.toString().split('\r\n');

const walletData = fs.readFileSync('../config/wallet.txt');
const walletList = walletData.toString().split('\r\n');

function getContent(num, value) {
  const commentIndex = parseInt(Math.random() * (commentList.length), 10)
  const walletIndex = parseInt(Math.random() * (walletList.length), 10)

  let str = '';
  // if (!value) {
  //   str = str + commentList[commentIndex] + ' '
  // }
  if (value === 'wallet') {
    str = str + walletList[walletIndex].split(':')[0] + ' '
  }
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

async function tweet(page, value) {
  const content = getContent(3, value)
  await page.waitForSelector('div[data-testid="tweetTextarea_0"]', { visible: true })
  await page.type('div[data-testid="tweetTextarea_0"]', content + ' ')
  await page.waitForTimeout(2000)
  await page.click('div[data-testid="tweetButtonInline"]')
  await page.waitForTimeout(3000)
}

async function follow(page, id) {
  // await page.goto(`https://twitter.com/${id}`)
  await page.waitForSelector('div[data-testid*="follow"]', { visible: true })
  await page.keyboard.press('Escape') // special case
  await page.click('div[data-testid*="follow"]')
  await page.waitForTimeout(2000)
}

async function goto(page, link) {
  await page.goto(link, { waitUntil: 'networkidle2' })
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
    await page.goto(link, { waitUntil: 'networkidle2' })
  }
  await page.reload() //special case
  await page.waitForTimeout(2000)
}

async function loginTwitter(i) {
  const accountItem = twitterList[i - 1]
  // 格式化账密信息
  let [
    username,
    password,
  ] = accountItem.split('--');
  console.log(i, username, 'start')
  const [browser, page] = await getBrowser(i)
  try {
    await page.goto('https://twitter.com/i/flow/login')
    await page.waitForSelector('input[autocomplete="username"]', { visible: true })
    await page.type('input[autocomplete="username"]', username)
    await page.keyboard.press('Enter')
    await page.waitForSelector('input[autocomplete="current-password"]', { visible: true })
    await page.type('input[autocomplete="current-password"]', password)
    // await page.keyboard.press('Enter')
    // await page.waitForSelector('input[autocomplete="email"]', { visible: true })
    // await page.type('input[autocomplete="email"]', phone)
    await Promise.all([
      page.keyboard.press('Enter'),
      page.waitForNavigation(),
    ]);
    await page.waitForTimeout(1000)

    await page.goto('https://twitter.com/settings/password')
    await page.waitForSelector('input[name="current_password"]', { visible: true })
    await page.type('input[name="current_password"]', password)
    await page.waitForSelector('input[name="new_password"]', { visible: true })
    await page.type('input[name="new_password"]', password + ".")
    await page.waitForSelector('input[name="password_confirmation"]', { visible: true })
    await page.type('input[name="password_confirmation"]', password + ".")


    // data-testid="settingsDetailSave"

    console.log(i, username, 'success')
  } catch (error) {
    console.log(i, username, 'fail')
    console.log(error)
  }
};

async function twitter(browser, page, curAcrionList) {
  for (let i = 0; i < curAcrionList.length; i++) {
    const actionItem = curAcrionList[i]
    const { action, value = '' } = actionItem
    switch (action) {
      case 'like':
        await like(page)
        break;
      case 'retweet':
        await retweet(page)
        break;
      case 'tweet':
        await tweet(page, value)
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
  loginTwitter,
  tweet,
  like,
  retweet,
  follow,
  twitter
};