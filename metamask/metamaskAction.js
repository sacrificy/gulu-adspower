const fs = require('fs');
const { getBrowser } = require('../adspower/adspowerAction');
const dappeteer = require('@chainsafe/dappeteer');
const { DPuppeteerBrowser } = require('@chainsafe/dappeteer/dist/puppeteer');

const walletData = fs.readFileSync('../config/wallet.txt');
const walletList = walletData.toString().split('\r\n');


async function setWallet(i) {
  const accountItem = walletList[i - 1]
  // 格式化账密信息
  let [
    address,
    seed,
    privateKey
  ] = accountItem.split(':');
  console.log(i, address, 'start')
  const [browser, page] = await getBrowser(i)
  try {
    await page.goto('chrome-extension://cbgddmllnaoogmcbmmbbmpdmfjmlapcp/home.html')
    const dappeteerBrowser = new DPuppeteerBrowser(browser, '', false)
    const metamask = await dappeteer.setupMetaMask(dappeteerBrowser, { seed: seed, password: '88888888', showTestNets: true });
    console.log(`浏览器${i}:钱包设置成功`);
  } catch (error) {
    console.log(error)
    console.log(`浏览器${i}:钱包设置失败`);
  }
  await browser.close()
};

async function getBrowserWithWallet(i) {
  const accountItem = walletList[i - 1]
  // 格式化账密信息
  let [
    address
  ] = accountItem.split(':');
  console.log(i, address, 'start')
  const [browser, page] = await getBrowser(i)
  try {
    await page.goto('chrome-extension://cbgddmllnaoogmcbmmbbmpdmfjmlapcp/home.html')
    const dappeteerBrowser = new DPuppeteerBrowser(browser, '', false)
    const metamask = await dappeteer.getMetaMaskWindow(dappeteerBrowser);
    await metamask.page.evaluate((s) => {
      window.signedIn = s;
    }, false);
    await metamask.page.waitForTimeout(1000)
    await metamask.unlock("88888888");
    await metamask.page.reload();
    await metamask.page.waitForTimeout(1000)
    const newPage = await browser.newPage();
    await newPage.bringToFront();
    console.log(`浏览器${i}:启动成功`);
    return [browser, newPage, metamask];
  } catch (error) {
    console.log(error)
    console.log(`浏览器${i}:启动失败`);
  }
};

module.exports = {
  setWallet: setWallet,
  getBrowserWithWallet: getBrowserWithWallet
}