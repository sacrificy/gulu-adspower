const fs = require('fs');
const { getBrowser } = require('../adspower/adspowerAction');

const discordData = fs.readFileSync('../config/discord/discordAccound.txt');
const discordList = discordData.toString().split('\r\n');
const { TOTP } = require('../util.js');

const loginDiscord = async (i) => {
  const accountItem = discordList[i - 1]
  // 格式化账密信息
  let [
    username,
    mailPassword,
    password,
    googleSecret,
    discordToken,
  ] = accountItem.split('----');
  discordToken = discordToken.replaceAll('"', '');
  console.log(i, username, 'start')
  const [browser, page] = await getBrowser(i)
  try {
    await page.goto('https://discord.com/login');
    await page.waitForTimeout(1000);
    // token登录
    // await page.evaluate((discordToken) => {
    //     window.t = discordToken;
    //     window.localStorage = document.body.appendChild(
    //         document.createElement`iframe`
    //     ).contentWindow.localStorage;
    //     window.setInterval(() => (window.localStorage.token = `"${window.t}"`));
    //     window.location.reload();
    // }, discordToken);
    // await page.waitForNavigation();
    // await page.waitForNavigation();
    // await page.waitForNavigation();
    // 账密登录
    // if (page.url() === 'https://discord.com/login') {
    const format = googleSecret.replace(/\s/g, '');
    const totpGenerator = new TOTP(format, 30);
    await page.waitForSelector('input[name="email"]', { visible: true })
    await page.type('input[name="email"]', username);
    await page.type('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.waitForSelector(
      'input[placeholder="6-digit authentication code/8-digit backup code"]',
      { timeout: 0 }
    );
    await page.type(
      'input[placeholder="6-digit authentication code/8-digit backup code"]',
      totpGenerator.getToken()
    );
    await Promise.all([
      page.keyboard.press('Enter'),
      page.waitForNavigation(),
    ]);

    await page.waitForTimeout(1000)
    console.log(i, username, 'success')
  } catch (error) {
    console.log(i, username, 'fail')
    console.log(error)
  }
  // await browser.close()
};


module.exports = {
  loginDiscord: loginDiscord
};