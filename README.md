# ✨ Inkspire

![License](https://img.shields.io/badge/License-MIT-green.svg)

A simple yet powerful **blogging website** built with **Node.js, Express, MongoDB, EJS, and Cloudinary**.  
Inkspire lets you create, edit, and share blogs seamlessly with a clean and minimal interface.

🌐 **Live Demo**: [Inkspire on Render](https://inkspire-gt6m.onrender.com/)

---

## 📌 Features

- 📝 Create, edit, and delete blog posts
- 👤 User-friendly UI with EJS templating
- ☁️ Image uploads powered by Cloudinary
- 📂 MongoDB for data storage
- 📱 Responsive design

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, CSS, JavaScript
- **Database**: MongoDB
- **Media Storage**: Cloudinary

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/adityapaul26/inkspire.git
cd inkspire
```

### 2. Install dependencies

```
npm install
```

### 3. Set up environment variables

Create a .env file in the root directory and add the following:

```
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
```

### 4. Run the server

```
npm start
```

Now open http://localhost:5000/ in your browser.
