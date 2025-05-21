const Hapi = require("@hapi/hapi");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Inert = require("@hapi/inert"); // Mengimpor plugin Inert untuk file statis
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes"); // Import user routes
const ticketRoutes = require("./routes/ticketRoutes"); // Import ticket routes

dotenv.config(); // Mengambil variabel lingkungan dari file .env

// Koneksi ke MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MongoDB URI is not defined in .env file");
    }
    await mongoose.connect(uri); // Koneksi tanpa opsi deprecated
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("MongoDB Connection Error: ", err.message);
    process.exit(1); // Keluar jika koneksi gagal
  }
};

// Menyambungkan ke MongoDB
connectDB();

const server = Hapi.server({
  port: process.env.PORT || 5000,  // Gunakan process.env.PORT dari Vercel
  host: "0.0.0.0",  // Ganti localhost dengan 0.0.0.0
});

// Fungsi async untuk menginisialisasi server
const init = async () => {
  // Register plugin Inert untuk menyajikan file statis
  await server.register(Inert);

  // Menyajikan file statis dari folder "public"
  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return 'Server is running!'; // Testing root route
    }
  });

  // Menggunakan routes yang sudah didefinisikan
  server.route(wishlistRoutes); // Rute wishlist
  server.route(reviewRoutes); // Rute review
  server.route(destinationRoutes); // Rute destinasi
  server.route(adminRoutes); // Rute admin
  server.route(userRoutes); // Rute user
  server.route(ticketRoutes); // Rute tiket

  // Menjalankan server
  await server.start();
  console.log("Server running on %s", server.info.uri);
};

// Panggil fungsi init untuk memulai server
init();
