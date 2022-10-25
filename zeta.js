const puppeteer = require('puppeteer-core');
const axios = require('axios');
const { adsApi } = require('./utils');
const dappeteer = require('@chainsafe/dappeteer');
const fs = require('fs');

const walletData = fs.readFileSync('./wallet.txt');
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

    metamask.switchNetwork("goerli");

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
  for (let i = 8; i <= 8; i++) {
    const [browser, page] = await setWallet(i);
    // browser.close();
  }
}

async function zeta() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;

  // 设置钱包
  for (let i = 7; i <= 7; i++) {
    const [browser, page, metamask] = await getBrowser(i);
    page.goto('https://labs.zetachain.com/leaderboard?code=IrKtdblh7CRMiefIWAyXl');

    //验证推特
    const close1 = await page.waitForSelector('img[src="/img/icons/close.svg"]');
    await close1.click();
    const verifyTwitterButton = await page.waitForXPath(`//button[contains(text(), 'Verify with Twitter')]`);
    await Promise.all([
      page.waitForNavigation(),
      await verifyTwitterButton.click(),
    ]);

    const authorizeButton = await page.waitForXPath(`//span[contains(text(), 'Authorize app')]`);
    await Promise.all([
      page.waitForNavigation(),
      await authorizeButton.click(),
    ]);

    // const close = await page.waitForSelector('img[src="/img/icons/close.svg"]');
    // await close.click();

    // 连接钱包
    await page.waitForTimeout(10000)
    const coonnectWalletButton = await page.waitForXPath(`//button[contains(text(), 'Connect Wallet')]`);
    await coonnectWalletButton.click();
    await page.waitForTimeout(5000)
    const metamaskButton = await page.waitForXPath(`//div[contains(text(), 'MetaMask')]`);
    await metamaskButton.click();

    browser.on('targetcreated', async (target) => {
      if (target.url().match('chrome-extension://[a-z]+/notification.html')) {
        try {
          const page = await target.page();
          const nextButton = await page.waitForXPath(`//button[contains(text(), 'Next')]`);
          await nextButton.click();
          const connectButton = await page.waitForXPath(`//button[contains(text(), 'Connect')]`);
          await connectButton.click();
        } catch (e) {
          reject(e);
        }
      }
    });

    // browser.close();
  }
}



// wallet()
zeta()


