const Poll = require('./models/Poll');
const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.use(express.json());

// MongoDB connection (ONLY ONE)
mongoose.connect('mongodb+srv://shaunakbtmtcs1232841_db_user:nnWueSMIyAwVZ61B@cluster0.5mgae9t.mongodb.net/pollstack')
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

// Test route
app.get('/', (req, res) => {
  res.send("PollStack Backend Running");
});

// Create Poll API
app.post('/api/poll', async (req, res) => {
  try {
    const poll = new Poll(req.body);
    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//vote api
app.post('/api/vote', async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Get user IP
    const userIp = req.ip;

    // Check if already voted
    if (poll.votedUsers.includes(userIp)) {
      return res.status(400).json({ error: "You have already voted!" });
    }

    // Add vote
    poll.options[optionIndex].votes += 1;

    // Save user IP
    poll.votedUsers.push(userIp);

    await poll.save();

    res.json(poll);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Results API
app.get('/api/results/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Calculate total votes
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    // Prepare results with percentage
    const results = poll.options.map(opt => ({
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes === 0 ? "0%" : ((opt.votes / totalVotes) * 100).toFixed(0) + "%"
    }));

    res.json({
      question: poll.question,
      results: results
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});