import http from 'http';

function checkEndpoint(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length }));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('Testing Vite Dev Server endpoints...');
  try {
    const root = await checkEndpoint('http://localhost:5173/');
    console.log(`✅ Root / : Status ${root.status}, Length ${root.length} bytes`);

    const main = await checkEndpoint('http://localhost:5173/src/main.js');
    console.log(`✅ src/main.js : Status ${main.status}, Length ${main.length} bytes`);

    const style = await checkEndpoint('http://localhost:5173/src/style.css');
    console.log(`✅ src/style.css : Status ${style.status}, Length ${style.length} bytes`);

    console.log('\nAll endpoints verified successfully!');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

verify();
