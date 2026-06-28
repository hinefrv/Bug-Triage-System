const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:8080/api/auth/login', {
      email: 'hien@hust.edu.vn',
      password: '123456'
    }, { headers: { Origin: 'http://localhost:5173' } });
    console.log('Token:', res.data.token);
    
    const res2 = await axios.get('http://localhost:8080/api/v1/bugs', {
      headers: { 
        Authorization: 'Bearer ' + res.data.token,
        Origin: 'http://localhost:5173'
      }
    });
    console.log('Bugs length:', res2.data.length);
  } catch (e) {
    if (e.response) {
      console.error('Error status:', e.response.status);
      console.error('Error data:', e.response.data);
    } else {
      console.error('Error:', e.message);
    }
  }
}
test();