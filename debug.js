const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1266, height: 696 });
  await page.goto('http://localhost:8000/reels.html');
  await page.waitForTimeout(2000);
  
  const data = await page.evaluate(() => {
    function getInfo(selector) {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        selector,
        w: rect.width,
        h: rect.height,
        l: rect.left,
        t: rect.top,
        display: style.display,
        position: style.position,
        maxWidth: style.maxWidth,
        minWidth: style.minWidth
      };
    }
    
    return {
      mainContent: getInfo('.main-content'),
      outerWrapper: getInfo('.reels-outer-wrapper'),
      reelsContainer: getInfo('.reels-container'),
      reelWrapper: getInfo('.reel-wrapper'),
      videoContainer: getInfo('.reel-video-container'),
      video: getInfo('.reel-video'),
      allImages: Array.from(document.querySelectorAll('img')).map(i => ({ src: i.src, w: i.getBoundingClientRect().width }))
    };
  });
  
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
