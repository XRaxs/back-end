const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const client = new OAuth2Client("81377167280-9c9kc1rsq17oue91lu9e9rjd6r4jngfu.apps.googleusercontent.com");

// Login dengan Google
exports.loginWithGoogle = async (request, h) => {
  try {
    const { token } = request.payload;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "81377167280-9c9kc1rsq17oue91lu9e9rjd6r4jngfu.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let user = await User.findOne({ email });

    if (!user) {
      // Buat user baru kalau belum ada
      user = new User({
        email,
        username: name, // pakai 'username' bukan 'name'
        phone: null,
        address: null,
        password: null, // karena login pakai Google, tidak punya password
        role: 'user',
      });
      await user.save();
    }

    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    return h.response({ token: jwtToken }).code(200);
  } catch (err) {
    console.error('Google Login Error:', err);
    return h.response({ message: 'Login dengan Google gagal' }).code(500);
  }
};

// Registrasi user manual (email + password)
exports.registerUser = async (req, h) => {
  try {
    const { email, password, username } = req.payload;

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return h.response({ message: 'Email sudah terdaftar' }).code(400);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      phone: null,
      address: null,
      role: 'user',
    });

    await newUser.save();

    return h.response({ message: 'Registrasi berhasil' }).code(201);
  } catch (error) {
    return h.response({ message: 'Error registrasi', error: error.message }).code(500);
  }
};

// Login user manual (email + password)
exports.loginUser = async (req, h) => {
  try {
    const { email, password } = req.payload;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return h.response({ message: 'Email atau password salah' }).code(401);
    }

    // Cek password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return h.response({ message: 'Email atau password salah' }).code(401);
    }

    // Buat JWT token
    const jwtToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    return h.response({ token: jwtToken }).code(200);
  } catch (error) {
    return h.response({ message: 'Error login', error: error.message }).code(500);
  }
};

// Fetch all users (admin only)
exports.getAllUsers = async (req, h) => {
  try {
    const users = await User.find();
    return h.response(users).code(200);
  } catch (error) {
    return h.response({ message: 'Error fetching users', error: error.message }).code(500);
  }
};

// Update user data atau status (termasuk phone & address)
exports.updateUser = async (req, h) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.payload, { new: true });
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    return h.response(user).code(200);
  } catch (error) {
    return h.response({ message: 'Error updating user', error: error.message }).code(500);
  }
};

// Delete user
exports.deleteUser = async (req, h) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return h.response({ message: 'User not found' }).code(404);
    }
    return h.response({ message: 'User deleted successfully' }).code(200);
  } catch (error) {
    return h.response({ message: 'Error deleting user', error: error.message }).code(500);
  }
};
