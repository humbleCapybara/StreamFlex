const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const User = require('./models/User');
const Comment = require('./models/Comment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movieapp';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes

// 1. POST API to store user details
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required: username, email, password' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email or username already exists' });
    }

    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully', userId: newUser._id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. GET API to fetch user details in JSON format
app.get('/api/users', async (req, res) => {
  try {
    // Exclude password from the fetched details for security
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST API to handle TMDB Login
app.post('/api/users/tmdb', async (req, res) => {
  try {
    const { username, tmdb_id } = req.body;
    
    if (!username || !tmdb_id) {
      return res.status(400).json({ error: 'Username and tmdb_id are required' });
    }

    let user = await User.findOne({ tmdb_id: tmdb_id.toString() });
    
    if (!user) {
      // Check if username is taken, append random numbers if so
      let finalUsername = username;
      let userWithSameName = await User.findOne({ username });
      if (userWithSameName) {
        finalUsername = `${username}_${Math.floor(Math.random() * 10000)}`;
      }

      user = new User({ username: finalUsername, tmdb_id: tmdb_id.toString() });
      await user.save();
    }

    res.status(200).json({ message: 'TMDB user logged in successfully', userId: user._id, username: user.username });
  } catch (error) {
    console.error('Error handling TMDB login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. GET Comments for a movie
app.get('/api/comments/:movieId', async (req, res) => {
  try {
    const comments = await Comment.find({ movieId: req.params.movieId }).sort({ createdAt: -1 });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. POST Comment
app.post('/api/comments', async (req, res) => {
  try {
    const { movieId, username, avatar, text, tmdb_id } = req.body;
    
    if (!movieId || !username || !text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newComment = new Comment({
      movieId,
      username,
      avatar,
      text,
      tmdb_id
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. DELETE Comment
app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const { tmdb_id } = req.body;
    
    if (!tmdb_id) {
      return res.status(400).json({ error: 'Unauthorized: missing tmdb_id' });
    }

    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.tmdb_id !== tmdb_id) {
      return res.status(403).json({ error: 'Unauthorized: you can only delete your own comments' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
