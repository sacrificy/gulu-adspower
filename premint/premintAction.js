const { getBrowserWithWallet } = require('../metamask/metamaskAction');
const { getBrowser } = require('../adspower/adspowerAction');
const { like, retweet, follow } = require('../twitter/twitterAction');
const { shuffle } = require('../util');

async function signupPremint(i) {
  const [browser, page, metamask] = await getBrowserWithWallet(i)
  try {
    await page.goto('https://www.premint.xyz/login/')

    while (true) {
      await page.waitForTimeout(6000)
      const frame = page.frames().find(frame => frame.url().includes('cloudflare'));
      if (!frame) break
      const frameButton = await frame.waitForSelector('input[type="checkbox"]', { visible: true })
      await frameButton.click()
    }

    const loginButton = await page.waitForSelector('button[title = "Login\ with\ MetaMask"]', { visible: true })
    await page.waitForTimeout(2000)
    await loginButton.click()
    try {
      await metamask.approve()
      console.log("链接成功")
      await metamask.page.waitForTimeout(2000)
      await metamask.sign()
      await metamask.page.waitForTimeout(2000)
      console.log("签名成功")
    } catch (error) {
      console.log(error)
    }
    await page.bringToFront();
    await page.goto('https://www.premint.xyz/profile/')
    const discordButton = await page.waitForSelector('a.strong.c-purple', { visible: true })
    await Promise.all([
      page.waitForNavigation(),
      discordButton.click(),
    ]);
    const authorizeDisButton = await page.waitForXPath(`//div[contains(text(), 'Authorize')]`);
    await Promise.all([
      page.waitForNavigation(),
      authorizeDisButton.click(),
    ]);

    try {
      const twitterButton = await page.waitForSelector('a.strong.c-teal-blue', { visible: true })
      await Promise.all([
        page.waitForNavigation(),
        twitterButton.click(),
      ]);
      const authorizeButton = await page.waitForSelector('input#allow', { visible: true });
      await Promise.all([
        page.waitForNavigation(),
        authorizeButton.click(),
      ]);
    } catch (error) {
      await page.goto('https://premint.xyz/disconnect/')
      const twitterDisconnectButton = await page.waitForSelector('a.btn-teal-blue', { visible: true })
      await Promise.all([
        page.waitForNavigation(),
        twitterDisconnectButton.click(),
      ]);
      await page.goto('https://www.premint.xyz/login/')
      const loginButton = await page.waitForSelector('button[title = "Login\ with\ MetaMask"]', { visible: true })
      await page.waitForTimeout(2000)
      await loginButton.click()
      await metamask.page.waitForTimeout(2000)
      await metamask.sign()
      console.log("签名成功")
      await page.goto('https://www.premint.xyz/profile/')
      const twitterButton = await page.waitForSelector('a.strong.c-teal-blue', { visible: true })
      await Promise.all([
        page.waitForNavigation(),
        twitterButton.click(),
      ]);
    }

    await page.waitForTimeout(3000)
    console.log(i, 'success')

    await browser.close()
  } catch (error) {
    console.log(i, 'fail')
    console.log(error)
  }
};

async function premintStart(i) {
  const [browser, page] = await getBrowser(i)
  try {
    await page.waitForTimeout(3000)
    await page.goto('https://www.premint.xyz/CopilotHub/')
    while (true) {
      await page.waitForTimeout(6000)
      const frame = page.frames().find(frame => frame.url().includes('cloudflare'));
      if (!frame) break
      const frameButton = await frame.waitForSelector('input[type="checkbox"]', { visible: true })
      await frameButton.click()
    }


    await page.waitForSelector('.card-body', { visible: true })
    const twitterLinks = await page.$$eval('div#step-twitter a.text-underline', nodeList => {
      return nodeList.map(node => node.href);
    });
    const discordLink = await page.$$eval('div#step-discord a.text-underline', nodeList => {
      return nodeList.map(node => node.href);
    });
    // console.log(twitterLinks)
    // console.log(discordLink)
    shuffle(twitterLinks)
    shuffle(discordLink)
    const newPage = await browser.newPage();
    for (let i = 0; i < twitterLinks.length; i++) {
      if (twitterLinks[i].includes("status")) {
        // 点赞转推
        await newPage.goto(twitterLinks[i])
        await like(newPage)
        await retweet(newPage)
      } else {
        // 关注
        await newPage.goto(twitterLinks[i])
        await follow(newPage)
      }
    }
    await page.bringToFront()
    await page.waitForSelector('button#register-submit', { visible: true })
    await page.click('button#register-submit')

    console.log(i, 'success')
  } catch (error) {
    console.log(i, 'fail')
    console.log(error)
  }

}

async function loginPremint(i) {
  const [browser, page, metamask] = await getBrowserWithWallet(i)
  try {
    await page.goto('https://www.premint.xyz/login/')

    while (true) {
      await page.waitForTimeout(6000)
      const frame = page.frames().find(frame => frame.url().includes('cloudflare'));
      if (!frame) break
      const frameButton = await frame.waitForSelector('input[type="checkbox"]', { visible: true })
      await frameButton.click()
    }

    const loginButton = await page.waitForSelector('button[title = "Login\ with\ MetaMask"]', { visible: true })
    await page.waitForTimeout(2000)
    await loginButton.click()
    try {
      await metamask.sign()
      await metamask.page.waitForTimeout(2000)
      console.log("签名成功")
    } catch (error) {
      console.log(error)
    }
    await page.bringToFront();
    await page.waitForTimeout(3000)
    console.log(i, 'success')

    await browser.close()
  } catch (error) {
    console.log(i, 'fail')
    console.log(error)
  }
};







module.exports = {
  signupPremint: signupPremint,
  loginPremint: loginPremint,
  premintStart: premintStart
}

