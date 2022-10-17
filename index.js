const a = require('./config.json');
const puppeteer = require('puppeteer-core');
const axios = require('axios');
const { adsApi } = require('./utils');
const { twitter } = require('./twitter');
const { start, end, close } = require('./twitter.json');

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
    const { data = {} } = await axios.get(adsApi.start, { params: { serial_number: i } });
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

async function main() {
  // 检测AdsPower是否启动
  const isAdsActive = await getAdsIsActive();
  if (!isAdsActive) return;

  // 启动浏览器
  for (let i = start; i <= end; i++) {
    const [browser, page] = await getBrowser(i);
    try {
      await twitter(browser, page);
      console.log(`浏览器${i}:twitter操作成功`);
      if (close) {
        await browser.close();
      }
    } catch (error) {
      console.log(`浏览器${i}:twitter操作失败`);
    }
  }
}
main()


