const fs = require('fs');

async function inspectMore() {
  try {
    const resTryOn = await fetch('https://anywear.live/try-on');
    console.log('try-on status:', resTryOn.status);
    const tryOnHeaders = Object.fromEntries(resTryOn.headers.entries());
    console.log('try-on headers:', tryOnHeaders);

    const resPricing = await fetch('https://anywear.live/pricing');
    console.log('pricing status:', resPricing.status);

    // Let's inspect script tags in widget.html
    const resHtml = await fetch('https://anywear.decart.ai/widget/latest/widget.html');
    const htmlText = await resHtml.text();
    const scripts = htmlText.match(/<script[\s\S]*?<\/script>/gi) || [];
    console.log('\n--- widget.html Scripts ---');
    scripts.forEach((s, idx) => {
      console.log(`Script #${idx}: length ${s.length}, snippet: ${s.slice(0, 150).replace(/\n/g, ' ')}...`);
    });

    // Check if there are fetch or postMessage calls in widget.html
    const fetchMatches = htmlText.match(/fetch\([^)]+\)/g) || [];
    console.log('\nfetch calls in widget.html:', fetchMatches.slice(0, 10));

    const postMsgMatches = htmlText.match(/postMessage\([^)]+\)/g) || [];
    console.log('postMessage calls in widget.html:', postMsgMatches.slice(0, 10));

  } catch (e) {
    console.error('Error:', e);
  }
}

inspectMore();
