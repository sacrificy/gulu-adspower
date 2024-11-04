const puppeteer = require('puppeteer-core');
const axios = require('axios');
const { adsApi } = require('../util');

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
    const { data = {} } = await axios.get(adsApi.start, { params: { serial_number: i, open_tabs: 1, enable_password_saving: 1, launch_args: ["--start-fullscreen"] } });
    const puppeteerWs = data?.data?.ws?.puppeteer;
    browser = await puppeteer.connect({
      browserWSEndpoint: puppeteerWs,
      defaultViewport: null
    });
    page = await browser.newPage();
    console.log(`浏览器${i}:启动成功`);
  } catch (error) {
    console.log(error)
    console.log(`浏览器${i}:启动失败`);
    await sleep(5000);
  }
  return [browser, page];
}

module.exports = {
  getAdsIsActive: getAdsIsActive,
  getBrowser: getBrowser
};

