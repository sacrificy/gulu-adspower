const fs = require('fs');
const { getBrowser } = require('../adspower/adspowerAction');

const gmailData = fs.readFileSync('../config/gmail/gmailAccound.txt');
const gmailList = gmailData.toString().split('\r\n');

async function loginGmail(i) {
  const accountItem = gmailList[i - 1]
  // 格式化账密信息
  let [
    username,
    password,
    recovery
  ] = accountItem.split('----');
  console.log(i, username, 'start')
  const [browser, page] = await getBrowser(i)
  try {
    await page.goto('https://accounts.google.com/')
    await page.waitForTimeout(1000)
    await page.waitForSelector('input[type="email"]')
    await page.type('input[type="email"]', username)
    await Promise.all([
      page.waitForNavigation(),
      page.keyboard.press('Enter')
    ]);
    await page.waitForSelector('input[type="password"]', { visible: true })
    await page.type('input[type="password"]', password)
    await Promise.all([
      page.waitForNavigation(),
      page.keyboard.press('Enter')
    ]);
    // 恢复邮箱
    await page.waitForSelector('div[data-challengetype="12"]', { visible: true })
    await page.click('div[data-challengetype="12"]')
    await page.waitForSelector('input[type="email"]', { visible: true })
    await page.type('input[type="email"]', recovery)
    await Promise.all([
      page.waitForNavigation(),
      page.keyboard.press('Enter')
    ]);




    console.log(i, username, 'success')
  } catch (error) {
    console.log(i, username, 'fail')
    console.log(error)
  }
};

module.exports = {
  loginGmail: loginGmail
};