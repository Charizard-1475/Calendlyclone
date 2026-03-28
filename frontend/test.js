const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('https://calendlyclone-hq1g.onrender.com/api/auth/register', {
      name: "TestUser",
      email: "test@domain.com",
      username: "testusername",
      password: "password123"
    });
    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.error("FAILED:", err.message);
    console.error("RESPONSE STATUS:", err.response?.status);
    console.error("RESPONSE DATA:", err.response?.data);
  }
}

test();
