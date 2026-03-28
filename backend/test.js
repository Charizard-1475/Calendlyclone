async function test() {
  try {
    const res = await fetch('https://calendlyclone-hq1g.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "TestUser",
        email: "test10@domain.com",
        username: "testusername10",
        password: "password123"
      })
    });
    console.log("STATUS:", res.status);
    console.log("DATA:", await res.json());
  } catch (err) {
    console.error("FAILED:", err);
  }
}
test();
