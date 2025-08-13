const express = require('express');
const router = express.Router();
const posts = require('../data/posts.json');

router.get('/', (req, res) => res.render('index', { posts }));

router.get('/post/:slug', (req, res) => {
  const post = posts.find(p => p.slug === req.params.slug);
  post ? res.render('post', { post }) : res.status(404).send('Post not found');
});

module.exports = router;
