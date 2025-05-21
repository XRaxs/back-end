const Hapi = require("@hapi/hapi");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Inert = require("@hapi/inert"); // Mengimpor plugin Inert untuk file statis
const wishlistRoutes = require("./routes/wishlistRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const userRoutes = require("./routes/userRoutes"); // Import user routes
const ticketRoutes = require("./routes/ticketRoutes"); // Import ticket routes

dotenv.config(); // Mengambil variabel lingkungan dari file .env

const server = Hapi.server({
  port: process.env.PORT || 5000,
  host: "localhost",
});

// Fungsi async untuk menginisialisasi server
const init = async () => {
  // Register plugin Inert untuk menyajikan file statis
  await server.register(Inert);

  // Menyajikan file statis dari folder "public"
  server.route({
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: "public", // Folder tempat file HTML dan CSS berada
        index: ["adminDashboard.html"], // Menyajikan file adminDashboard.html sebagai index
      },
    },
  });

  // Koneksi ke MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }

  // Menggunakan routes yang sudah didefinisikan
  server.route(wishlistRoutes); // Rute wishlist
  server.route(reviewRoutes); // Rute review
  server.route(destinationRoutes); // Rute destinasi
  server.route(adminRoutes); // Rute admin
  server.route(userRoutes); // Rute user
  server.route(ticketRoutes); // Rute tiket (tambah di sini)

  // Menjalankan server
  await server.start();
  console.log("Server running on %s", server.info.uri);
};

// Panggil fungsi init untuk memulai server
init();
