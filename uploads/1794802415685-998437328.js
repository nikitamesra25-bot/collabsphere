// ============================================
// BACKEND SERVER - server.js
// Yeh file "Backend" hai - user ko nahi dikhti
// Isme sara logic, data handling, aur HTTP methods hain
// ============================================

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware - JSON data ko parse karne ke liye (request body padhna)
app.use(express.json());

// Frontend files serve karne ke liye (public folder)
app.use(express.static('public'));

// ============================================
// FAKE DATABASE (Real project mein MongoDB/MySQL use hoga)
// ============================================
let users = [
  { id: 1, name: "Rahul", age: 22 },
  { id: 2, name: "Priya", age: 25 }
];

// ============================================
// GET - Data FETCH karna (Read)
// ============================================
app.get('/api/users', (req, res) => {
  console.log("GET request aayi - saare users bhej rahe hain");
  res.status(200).json({
    message: "200 OK - Users successfully mile",
    data: users
  });
});

// Ek specific user GET karna (id ke through)
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    // 404 - Not Found
    return res.status(404).json({ error: "404 - User nahi mila" });
  }
  res.status(200).json({ message: "200 OK", data: user });
});

// ============================================
// POST - Naya data CREATE karna
// ============================================
app.post('/api/users', (req, res) => {
  const { name, age } = req.body;

  // 400 - Bad Request (agar validation fail ho)
  if (!name || !age) {
    return res.status(400).json({ error: "400 - Bad Request: Name aur age dono chahiye" });
  }

  const newUser = { id: users.length + 1, name, age };
  users.push(newUser);

  // 201 - Created
  res.status(201).json({
    message: "201 Created - Naya user ban gaya",
    data: newUser
  });
});

// ============================================
// PUT - Poora data UPDATE/REPLACE karna
// ============================================
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, age } = req.body;
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "404 - User nahi mila" });
  }
  if (!name || !age) {
    return res.status(400).json({ error: "400 - Name aur age dono chahiye poore update ke liye" });
  }

  users[userIndex] = { id, name, age };
  res.status(200).json({
    message: "200 OK - User poori tarah update ho gaya",
    data: users[userIndex]
  });
});

// ============================================
// PATCH - Sirf KUCH fields update karna
// ============================================
app.patch('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "404 - User nahi mila" });
  }

  users[userIndex] = { ...users[userIndex], ...req.body };
  res.status(200).json({
    message: "200 OK - User ka kuch data update hua",
    data: users[userIndex]
  });
});

// ============================================
// DELETE - Data remove karna
// ============================================
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ error: "404 - User nahi mila" });
  }

  users.splice(userIndex, 1);
  res.status(200).json({ message: `200 OK - User ${id} delete ho gaya` });
});

// ============================================
// 401 UNAUTHORIZED example - Login check
// ============================================
app.get('/api/private-data', (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "401 - Unauthorized: Pehle login karo (token bhejo)" });
  }
  res.status(200).json({ message: "200 OK - Private data mil gaya", secret: "Yeh secret data hai" });
});

// ============================================
// 403 FORBIDDEN example - Permission check
// ============================================
app.delete('/api/admin/reset', (req, res) => {
  const isAdmin = req.headers['x-role'] === 'admin';

  if (!isAdmin) {
    return res.status(403).json({ error: "403 - Forbidden: Sirf admin ye kaam kar sakta hai" });
  }
  res.status(200).json({ message: "200 OK - Sab data reset ho gaya" });
});

// ============================================
// 500 INTERNAL SERVER ERROR example
// ============================================
app.get('/api/crash-test', (req, res) => {
  try {
    throw new Error("Kuch unexpected galat ho gaya!");
  } catch (err) {
    res.status(500).json({ error: "500 - Internal Server Error: " + err.message });
  }
});

// ============================================
// SERVER START - yahan se server "sunna" shuru karta hai
// ============================================
app.listen(PORT, () => {
  console.log(`✅ Server chal raha hai: http://localhost:${PORT}`);
  console.log(`👉 Browser mein http://localhost:${PORT} kholo (Frontend)`);
});
