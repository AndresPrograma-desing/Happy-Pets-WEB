const http = require('http'); 
const req = http.get('http://localhost:5168/api/Calendar/get-calendar?year=2026&month=7', (res) => { 
  let data = ''; 
  res.on('data', (chunk) => { data += chunk; }); 
  res.on('end', () => { console.log(data); }); 
}); 
req.on('error', (e) => { console.error(e); });
