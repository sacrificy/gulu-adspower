const puppeteer = require('puppeteer-core');
const axios = require('axios');
const { adsApi } = require('../util');
const dappeteer = require('@chainsafe/dappeteer');
const fs = require('fs');

async function zeta() {

  // 设置钱包
  for (let i = 105; i <= 115; i++) {
    try {
      const [browser, page, metamask] = await getBrowser(i);
      page.goto('https://labs.zetachain.com/leaderboard?code=WKRMzDZFk6Mj2tBi0kT8S');

      //验证推特
      const close1 = await page.waitForSelector('img[src="/img/icons/close.svg"]');
      await close1.click();
      await page.waitForTimeout(5000)
      const verifyTwitterButton = await page.waitForXPath(`//button[contains(text(), 'Verify with Twitter')]`);
      await Promise.all([
        page.waitForNavigation(),
        verifyTwitterButton.click(),
      ]);

      const authorizeButton = await page.waitForXPath(`//span[contains(text(), 'Authorize app')]`);
      await Promise.all([
        page.waitForNavigation(),
        authorizeButton.click(),
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
            const notificationPage = await target.page();
            const nextButton = await notificationPage.waitForXPath(`//button[contains(text(), 'Next')]`);
            await nextButton.click();
            const connectButton = await notificationPage.waitForXPath(`//button[contains(text(), 'Connect')]`);
            await connectButton.click();
            await page.waitForTimeout(3000)
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
            await page.waitForTimeout(5000)
            console.log(`浏览器${i}:任务完成`)
            browser.close();
          } catch (e) {
            // console.log(e);
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}



// wallet()
zeta()


