const puppeteer = require('puppeteer-core');
const axios = require('axios');
const { adsApi } = require('./utils');
const { TOTP } = require('./util.js');

const discotdData = fs.readFileSync('./discord.txt');
const discordList = discotdData.toString().split('\r\n');

async function getAdsIsActive() {
  let isActive = false;
  try {
    const { data = {} } = await axios.get(adsApi.status);
    if (data.code === 0) {
      isActive = true;
      console.log('AdsPower已启动')
    } else {
      console.log('AdsPower未启动')
    }
  } catch (error) {
    console.log('AdsPower未启动')
  }
  return isActive;
}


// 启动浏览器
async function getBrowser(i) {
  let browser = null;
  let page = null;
  try {
    const { data = {} } = await axios.get(adsApi.start, { params: { serial_number: i, open_tabs: 1 } });
    const puppeteerWs = data?.data?.ws?.puppeteer;
    browser = await puppeteer.connect({
      browserWSEndpoint: puppeteerWs
    });
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    console.log(`浏览器${i}:启动成功`);
  } catch (error) {
    console.log(error)
    console.log(`浏览器${i}:启动失败`);
  }
  return [browser, page];
}


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
    // window.t = discordToken;
    // window.localStorage = document.body.appendChild(
    //   document.createElement`iframe`
    // ).contentWindow.localStorage;
    // window.setInterval(() => (window.localStorage.token = `"${window.t}"`));
    // window.location.reload();
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
    // await page.solveRecaptchas();
    await page.waitForSelector(
      'input[placeholder="6-digit authentication code/8-digit backup code"]',
      { timeout: 0 }
    );
    await page.type(
      'input[placeholder="6-digit authentication code/8-digit backup code"]',
      totpGenerator.getToken()
    );
    await Promise.all([
      await page.keyboard.press('Enter'),
      page.waitForNavigation(),
    ]);
    // }
    await page.waitForTimeout(1000)
    console.log(i, username, 'success')
  } catch (error) {
    console.log(i, username, 'fail')
    console.log(error)
    // fs.appendFileSync('failLogin.txt', accountItem + '\r\n')
  }
  // await browser.close()
};


async function main() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;

  // 启动浏览器
  for (let i = 1; i <= 2; i++) {
    await loginDiscord(i)
  }
}
main()


