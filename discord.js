const puppeteer = require('puppeteer-core');
const axios = require('axios');
const { adsApi } = require('./utils');
const { TOTP } = require('./util.js');
const fs = require('fs');
const { faker } = require('@faker-js/faker');

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

const sleep = (time = 1000) => new Promise((resolve, reject) => { setTimeout(resolve, time) });

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
    await page.setViewport({ width: 1920, height: 930 });
    console.log(`浏览器${i}:启动成功`);
  } catch (error) {
    console.log(error)
    console.log(`浏览器${i}:启动失败`);
    await sleep(5000);
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
    await page.waitForTimeout(5000);
    // await page.solveRecaptchas();
    // const frames = page.frames();
    const frames = page.frames().filter(frame => frame.url().includes('hcaptcha'));
    // console.log(frame.url())
    // frames.map(item=>{console.log(item.url())})
    // const captcha = await page.waitForSelector('div#checkbox', { visible: true });
    // await captcha.click();
    await frames[frames.length - 1].click('div#checkbox')
    await page.waitForSelector(
      'input[placeholder^="6"]',
      { timeout: 0, visible: true }
    );
    await page.type(
      'input[placeholder^="6"]',
      totpGenerator.getToken()
    );
    await Promise.all([
      page.keyboard.press('Enter'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);
    // }
    // const setting = await page.waitForSelector('button[aria-label="User Settings"],button[aria-label="用户设置"]');
    await page.waitForTimeout(1000)
    // await page.keyboard.press('Escape')
    // await page.waitForTimeout(1000)
    // await page.keyboard.press('Escape')
    // await page.waitForTimeout(1000)
    // await setting.click();
    // const response = await page.waitForResponse((response) => {
    //   return response.url().includes("profile")
    // });
    // const profile = await response.json()
    // fs.appendFileSync('discordProfile.txt', `${i}----${profile.user.username + '#' + profile.user.discriminator}----${profile.user.id}` + '\r\n')
    console.log(i, username, 'success')
    await browser.close()
  } catch (error) {
    console.log(i, username, 'fail')
    console.log(error)
    // fs.appendFileSync('failLogin.txt', accountItem + '\r\n')
  }
};


async function invite(i, inviteLink) {
  console.log(i, 'start')
  const [browser, page] = await getBrowser(i)
  try {
    await page.goto(inviteLink);
    await page.waitForTimeout(1000)
    await page.waitForSelector('section button', { visible: true })
    await page.click('section button')
    const response = await page.waitForResponse((response) => {
      return response.url().startsWith("https://discord.com/api/v9/invites")
    });
    if (response.status() === 200) {
      await page.waitForTimeout(2000)
      // await browser.close()
      // await page.solveRecaptchas();
    }
    console.log(i, "end")
  } catch (error) {
    console.log(error)
  }
}

const changeName = async (i) => {
  console.log(i, 'start')
  const accountItem = discordList[i - 1]
  // 格式化账密信息
  let [
    username,
    mailPassword,
    password,
    googleSecret,
    discordToken,
  ] = accountItem.split('----');
  const [browser, page] = await getBrowser(i)
  try {
    await page.goto('https://discord.com/channels/@me')
    await page.waitForSelector('button[aria-label="User Settings"],button[aria-label="用户设置"]');
    await page.waitForTimeout(1000)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1000)
    const setting = await page.waitForSelector('button[aria-label="User Settings"],button[aria-label="用户设置"]');
    await setting.click();

    await page.waitForTimeout(1000)
    const editName = await page.waitForSelector('button[aria-label="Edit username"],button[aria-label="编辑用户名"]', { visible: true });
    await editName.click();
    const inputName = await page.waitForSelector('input[name="username"]');
    await inputName.click();
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(1000);
    await inputName.type(faker.name.firstName());
    const inputPassword = await page.waitForSelector('input[type="password"]');
    await inputPassword.type(password);
    await page.waitForTimeout(1000)
    // await page.keyboard.press('Enter')

    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes("users")),
      page.keyboard.press('Enter'),
    ]);

    // const response = await page.waitForResponse((response) => {
    //   return response.url().includes("users")
    // });
    const users = await response.json()
    console.log(users)
    fs.appendFileSync('discordProfile.txt', `${i}----${users.username + '#' + users.discriminator}----${users.phone}----${users.id}----${users.token}` + '\r\n')
    console.log(i, 'success')
    await browser.close()
  } catch (error) {
    console.log(i, 'fail')
    console.log(error)
  }
};

async function main() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;

  // 启动浏览器
  for (let i = 27; i <= 32; i++) {
    await loginDiscord(i)
  }
}

// 进频道
async function invite1() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;

  // 启动浏览器
  for (let i = 18; i <= 35; i++) {
    await invite(i, "https://discord.gg/mKQGwXXu")
  }
}

async function changeName1() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;

  // 启动浏览器
  // for (let i = 31; i <= 50; i++) {
  //   await changeName(i)
  // }

  for (let i of [42, 43, 47]) {
    await changeName(i)
  }
}


invite1()
// main()
// changeName1()

