async function test() {
  try {
    const res = await fetch('https://calendlyclone-hq1g.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Origin': 'https://calendlyclone-kh5n.vercel.app'
      },
      body: JSON.stringify({
        name: "user",
        email: "user@gmail.com",
        username: "uuu12345678",
        password: "password123"
      })
    });
    console.log("STATUS:", res.status);
    console.log("HEADERS:", res.headers);
    console.log("DATA:", await res.json());
  } catch (err) {
    console.error("FAILED:", err);
  }
}
test();
