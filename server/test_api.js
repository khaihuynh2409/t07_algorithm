

async function test() {
  console.log("Logging in as admin...");
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin', password: 'admin' })
  });
  
  if (!loginRes.ok) {
    console.error("Admin login failed", await loginRes.text());
    return;
  }
  
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log("Admin Token:", token);

  console.log("Registering test user...");
  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId: 'test1', email: 'test1@test.com', password: 'password', fullName: 'Test Name', className: 'A1' })
  });
  console.log("Reg result:", await regRes.text());

  console.log("Approving test user...");
  const appRes = await fetch('http://localhost:5000/api/users/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ studentId: 'test1' })
  });
  console.log("Approve result:", await appRes.text());

  console.log("Fetching users...");
  const usersRes = await fetch('http://localhost:5000/api/users', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log("Users:", await usersRes.json());
}

test();
