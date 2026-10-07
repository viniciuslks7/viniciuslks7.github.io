import { chromium, devices } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const label = process.argv[2] || 'after';
const root = `test-results/v6-${label}`;
await mkdir(root, {recursive:true});
const browser = await chromium.launch({headless:true, executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE});
const evidence={label,browser:browser.version(),errors:[],consoleErrors:[],frames:[]};
try {
  for(const [size,options] of [['desktop',{viewport:{width:1440,height:1000}}],['mobile',devices['iPhone 13']]]) {
    const context=await browser.newContext({...options,reducedMotion:'no-preference'});
    const page=await context.newPage();
    page.on('pageerror',e=>evidence.errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')evidence.consoleErrors.push(m.text());});
    await page.goto(pathToFileURL(resolve('../vinicius-portfolio-interactive-preview.html')).href);
    await page.evaluate(()=>document.fonts.ready);
    await page.locator('#dragon-stage').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('.dragon-scene').dataset.dragonState==='walking');
    await page.locator('#dragon-toggle').click();
    for(const progress of [15,35,55,64,72,92]) {
      await page.locator('#dragon-scrub').evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},progress);
      await page.locator('.dragon-scene').screenshot({path:`${root}/${size}-flight-${progress}.png`});
      evidence.frames.push({size,progress,state:await page.locator('.dragon-scene').getAttribute('data-dragon-state')});
    }
    await page.locator('#dragon-inspect').click();
    for(const view of ['head','body','whole']) {
      await page.locator(`[data-dragon-view="${view}"]`).click();
      await page.locator('#dragon-inspect-dialog').screenshot({path:`${root}/${size}-${view}.png`});
    }
    await page.keyboard.press('Escape');
    await page.locator('#language').click();
    await page.locator('#dragon-inspect').click();
    await page.locator('#dragon-inspect-dialog').screenshot({path:`${root}/${size}-head-en.png`});
    await page.keyboard.press('Escape');
    await page.locator('#home').scrollIntoViewIfNeeded();
    await page.screenshot({path:`${root}/${size}-home-en.png`});
    await page.locator('#language').click();
    await page.screenshot({path:`${root}/${size}-home-pt.png`});
    await page.locator('[data-project="auxilium"]').screenshot({path:`${root}/${size}-auxilium.png`});
    await page.locator('#education-timeline').screenshot({path:`${root}/${size}-education.png`});
    await page.locator('#endpoint').selectOption('profile');
    await page.locator('#sandbox-mission').selectOption('piribull');
    await page.locator('#response-output').screenshot({path:`${root}/${size}-sandbox.png`});
    await context.close();
  }
} finally {
  await writeFile(`${root}/visual-evidence.json`,JSON.stringify(evidence,null,2));
  await browser.close();
}
if(evidence.errors.length||evidence.consoleErrors.length)throw new Error(JSON.stringify(evidence));
console.log(`Captured ${label} desktop/mobile, PT/EN, close-ups and six flight phases; no page/console errors.`);
