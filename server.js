// server.js
const express = require("express");
const app = express();
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const session = require("express-session");
require("./config/db"); // Auto-connects when imported
const Post = require("./models/Post");
const User = require("./models/User");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');
const { cloudinary } = require('./config/cloudinary');

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required in environment variables');
  process.exit(1);
}

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(express.json());

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "aditya2003",
    resave: false,
    saveUninitialized: false,
  })
);

// Utility functions
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function createUniqueSlug(title) {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;
  
  while (await Post.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

function isAuthenticated(req, res, next) {
  if (req.session.user) next();
  else res.redirect("/login");
}

function getRandomPosts(posts, count) {
  const shuffled = posts.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Setup multer for memory storage (Cloudinary will handle file storage)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Cloudinary upload function
const uploadToCloudinary = (fileBuffer, fileName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "blog_images",
        public_id: fileName,
        transformation: [
          { width: 1000, height: 600, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};

// Routes

// Signup routes
app.get("/signup", (req, res) => {
  res.render("sign-up");
});

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.send("Username already taken. Try another one.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    res.redirect("/login");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Something went wrong!");
  }
});

// Login routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in MongoDB
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).send("Invalid credentials");
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).send("Invalid credentials");
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true });
    req.session.user = { _id: user._id, username: user.username };
    res.redirect("/");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Something went wrong!");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.clearCookie('token');
  res.redirect("/");
});

// Home route
app.get("/", async (req, res) => {
  try {
    const user = req.session.user || null;
    const allPosts = await Post.find({ status: "published" }).sort({ createdAt: -1 });
    const suggestedPosts = getRandomPosts(allPosts, 5);

    res.render("index", {
      user,
      posts: suggestedPosts,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// All posts route
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" }).sort({ createdAt: -1 });
    res.render("all-posts", { post: posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Filter posts by author
app.get("/posts/author/:author", async (req, res) => {
  try {
    const author = req.params.author;
    const filteredPosts = await Post.find({ 
      author: author, 
      status: "published" 
    }).sort({ createdAt: -1 });
    
    res.render("all-posts", { post: filteredPosts, author: author });
  } catch (error) {
    console.error("Error fetching posts by author:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get all authors
app.get("/authors", async (req, res) => {
  try {
    const authors = await Post.distinct("author");
    res.json(authors);
  } catch (error) {
    console.error("Error fetching authors:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get posts by current user
app.get("/my-posts", async (req, res) => {
  const currentUser = req.session.user;
  if (!currentUser) {
    return res.redirect("/login");
  }

  try {
    const userPosts = await Post.find({ 
      author: currentUser.username 
    }).sort({ createdAt: -1 });
    
    res.render("all-posts", { post: userPosts, author: currentUser.username });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Dashboard route
app.get("/dashboard", isAuthenticated, async (req, res) => {
  const user = req.session.user || null;

  if (!user) {
    return res.render("dashboard", { posts: [], totalViews: 0 });
  }

  try {
    const userPosts = await Post.find({ author: user.username });
    const totalViews = userPosts.reduce((sum, post) => sum + post.views, 0);

    res.render("dashboard", { posts: userPosts, totalViews });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.render("dashboard", { posts: [], totalViews: 0 });
  }
});

// Create post route
app.get("/admin/create", isAuthenticated, (req, res) => {
  res.render("create-post");
});

// Route to handle post creation with Cloudinary upload
app.post("/create-post", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const imageFile = req.file;

    // Get the current logged-in user
    const currentUser = req.session.user;
    const author = currentUser ? currentUser.username : "Anonymous";

    let imageUrl = "/images/bg.jpg"; // Default image

    // Upload image to Cloudinary if provided
    if (imageFile) {
      try {
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const uploadResult = await uploadToCloudinary(imageFile.buffer, fileName);
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Continue with default image if upload fails
      }
    }

    // Create new post
    const newPost = new Post({
      title,
      content,
      slug: await createUniqueSlug(title),
      imageUrl: imageUrl,
      author,
      views: 0,
      status: "published"
    });

    await newPost.save();
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).send("Error creating post");
  }
});

// Single post route
app.get("/post/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const post = await Post.findOne({ slug: slug });

    if (!post) {
      return res.status(404).render("error404");
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.render("single-post", { post });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Internal Server Error");
  }
});

// 404 error handler
app.use((req, res) => {
  res.status(404).render("error404");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});