const https = require('https');
https.get('https://calendlyclone-kh5n.vercel.app/', (res) => {
  let html = '';
  res.on('data', d => html+=d);
  res.on('end', () => {
    const match = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if(match) {
      https.get('https://calendlyclone-kh5n.vercel.app' + match[1], (r2) => {
         let js = '';
         r2.on('data', d => js+=d);
         r2.on('end', () => {
           console.log("Vercel JS File check:");
           if (js.includes('https://calendlyclone-hq1g.onrender.com/api')) console.log("- Uses Render Live URL");
           else if (js.includes('http://localhost:5000')) console.log("- Uses localhost URL");
           else console.log("- Unknown URL");
         });
      });
    } else {
      console.log("Could not find script tag in HTML");
    }
  });
});
