import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',timeout:60000,retries:0,workers:1,
 reporter:[['list'],['html',{outputFolder:'playwright-report',open:'never'}]],
 use:{...devices['iPhone 13'],viewport:{width:320,height:568},browserName:'webkit',baseURL:'http://127.0.0.1:4173/fungo-italia/',screenshot:'only-on-failure',trace:'retain-on-failure'},
 webServer:{command:'node serve.mjs',url:'http://127.0.0.1:4173/fungo-italia/',reuseExistingServer:false,timeout:15000}
});
