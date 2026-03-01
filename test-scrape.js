const cheerio = require('cheerio');

async function scrape() {
  const res = await fetch('https://docs.agora.io/en/real-time-stt/get-started/quickstart');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Try to find the cURL or REST API examples from the article body.
  const articleText = $('article').text() || $('main').text() || $('body').text();
  
  // Extract chunks that look like API requests to Agora
  console.log(articleText.substring(0, 3000));
}

scrape();
