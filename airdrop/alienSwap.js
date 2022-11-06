// 前置工作进DC + Twitter关注

// 链接钱包
// join + 签名
// dis + twitter 验证
// 记录邀请码

const puppeteer = require('puppeteer-core');
const axios = require('axios');
const { adsApi } = require('../util');
const dappeteer = require('@chainsafe/dappeteer');
const fs = require('fs');

const walletData = fs.readFileSync('../config/wallet.txt');
const walletList = walletData.toString().split('\r\n');

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

// 启动浏览器并解锁钱包
async function getBrowser(i) {
  let browser = null;
  let page = null;
  let metamask = null;
  try {
    const { data = {} } = await axios.get(adsApi.start, { params: { serial_number: i, open_tabs: 1, launch_args: ["--start-maximized"] } });
    const puppeteerWs = data?.data?.ws?.puppeteer;
    browser = await puppeteer.connect({
      browserWSEndpoint: puppeteerWs
    });

    let homePage = await browser.newPage();
    await homePage.goto('chrome-extension://opicoliobjbdlpjdipbiichlnpiielif/home.html#unlock');

    metamask = await dappeteer.getMetamaskWindow(browser, "v10.15.0");
    await metamask.page.evaluate((s) => {
      window.signedIn = s;
    }, false);
    await metamask.unlock("88888888");

    const gotIt = await metamask.page.waitForXPath(`//button[contains(text(), 'Got it')]`, { timeout: 3000 });
    if (gotIt) {
      await gotIt.click()
    }
    metamask.switchNetwork("ethereum");

    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    console.log(`浏览器${i}:启动成功`);
  } catch (error) {
    console.log(error)
    console.log(`浏览器${i}:启动失败`);
  }
  return [browser, page, metamask];
}


// 设置钱包
async function setWallet(i) {
  let browser = null;
  let page = null;
  try {
    const { data = {} } = await axios.get(adsApi.start, { params: { serial_number: i, open_tabs: 1, launch_args: ['--start-maximized'] } });
    const puppeteerWs = data?.data?.ws?.puppeteer;
    browser = await puppeteer.connect({
      browserWSEndpoint: puppeteerWs
    });
    const seed = walletList[i - 1].split(':')[1];
    const metamask = await dappeteer.setupMetamask(browser, { seed: seed, password: '88888888' });
    page = await browser.newPage();

    console.log(`浏览器${i}:钱包设置成功`);
  } catch (error) {
    console.log(error)
    console.log(`浏览器${i}:钱包设置失败`);
  }
  return [browser, page];
}


async function wallet() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;

  // 设置钱包
  for (let i = 34; i <= 49; i++) {
    const [browser, page] = await setWallet(i);
    await page.waitForTimeout(2000);
    browser.close();
  }
}

async function alienSwap() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;
  // https://www.alienswap.xyz/waitlist?invite_code=CoABmc

  // 设置钱包
  for (let i = 9; i <= 9; i++) {
    try {
      const [browser, page, metamask] = await getBrowser(i);
      await page.goto('https://www.alienswap.xyz/waitlist?invite_code=CoABmc');

      browser.on('targetcreated', async (target) => {
        if (target.url().includes('twitter')) {
          try {
            const twitterPage = await target.page();
            const tweet = await twitterPage.waitForSelector('div[data-testid="tweetButton"]', { visible: true });
            await tweet.click();
            await twitterPage.waitForTimeout(2000);
            await twitterPage.close();
          } catch (e) {
            // console.log(e);
          }
        }
      })
      browser.on('targetcreated', async (target) => {
        if (target.url().match('chrome-extension://[a-z]+/notification.html')) {
          try {
            const notificationPage = await target.page();
            const nextButton = await notificationPage.waitForXPath(`//button[contains(text(), 'Next')]`);
            await nextButton.click();
            const connectButton = await notificationPage.waitForXPath(`//button[contains(text(), 'Connect')]`);
            await connectButton.click();
            await notificationPage.waitForTimeout(3000)
            const confirmWalletButton = await page.waitForXPath(`//button[contains(text(), 'Confirm Wallet')]`);
            await confirmWalletButton.click();
          } catch (e) {
            // console.log(e);
          }
        }
      });

      browser.on('targetcreated', async (target) => {
        if (target.url().match('chrome-extension://[a-z]+/notification.html')) {
          try {
            const notificationPage = await target.page();
            const signButton = await notificationPage.waitForXPath(`//button[contains(text(), 'Sign')]`);
            await signButton.click();
          } catch (e) {
            // console.log(e);
          }
        }
      });

      // await page.waitForTimeout(5000)
      // 链接钱包
      const coonnectWalletButton = await page.waitForXPath(`//span[contains(text(), 'Connect Wallet')]`, { visible: true });
      await coonnectWalletButton.click();
      await page.waitForTimeout(2000)
      const metaMaskButton = await page.waitForXPath(`//div[contains(text(), 'MetaMask')]`, { visible: true });
      await metaMaskButton.click();
      // connect

      const joinButton = await page.waitForXPath(`//span[contains(text(), 'Join Now')]`, { visible: true });
      await joinButton.click();
      const nextButton = await page.waitForXPath(`//span[contains(text(), 'Next')]`, { visible: true });
      await nextButton.click();
      //sign

      // 
      await page.waitForTimeout(5000)
      const connectDisButton = await page.waitForXPath(`//span[contains(text(), 'Connect Discord')]`, { visible: true });
      await Promise.all([
        page.waitForNavigation(),
        connectDisButton.click(),
      ]);
      const authorizeDisButton = await page.waitForXPath(`//div[contains(text(), 'Authorize')]`);
      await Promise.all([
        page.waitForNavigation(),
        authorizeDisButton.click(),
      ]);

      const connectTwiButton = await page.waitForXPath(`//span[contains(text(), 'Connect Twitter')]`);
      await connectTwiButton.click();
      const authorizeButton = await page.waitForXPath(`//span[contains(text(), 'Authorize app')]`);
      await Promise.all([
        page.waitForNavigation(),
        authorizeButton.click(),
      ]);

      const VerifyButton = await page.waitForXPath(`//span[contains(text(), 'Verify')]`);
      await VerifyButton.click();
      await page.waitForTimeout(3000)
      const VerifyButton1 = await page.waitForXPath(`//span[contains(text(), 'Verify')]`);
      await VerifyButton1.click();


      const clainButton = await page.waitForXPath(`//span[contains(text(), 'Claim SBT')]`);
      await clainButton.click();


      const response = await page.waitForResponse((response) => {
        return response.url().includes("metadata")
      });
      const users = await response.json()
      console.log(users)
      fs.appendFileSync('alienSwap.txt', `${i}----${users.data.invite_code}` + '\r\n')
      console.log(i, 'success')

    } catch (error) {
      console.log(error);
    }
  }
}

// wallet()
alienSwap()
