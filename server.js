const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;  // ✅ ঠিক করা
const DB_FILE = path.join(__dirname, 'users.json');

app.use(express.json());
app.use(express.static(__dirname));

function readUsers() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8').trim();
        if (!data) {
            fs.writeFileSync(DB_FILE, '[]');
            return [];
        }
        return JSON.parse(data);
    } catch (err) {
        console.log('users.json corrupt, resetting...');
        fs.writeFileSync(DB_FILE, '[]');
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Sob field fill koro!' });
    }
    const users = readUsers();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Email already exists!' });
    }
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    writeUsers(users);
    res.status(201).json({
        message: 'Signup successful!',
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });
});

app.get('/api/users', (req, res) => {
    const users = readUsers();
    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt
    }));
    res.json(safeUsers);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
