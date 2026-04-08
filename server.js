const ADMIN_PASSWORD = "admin123";
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Poll = require('./models/Poll');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect('mongodb://trushaparmar28_db_user:KWMNdcbnEGHQfNN4@ac-uv8pynu-shard-00-00.onrf0hf.mongodb.net:27017,ac-uv8pynu-shard-00-01.onrf0hf.mongodb.net:27017,ac-uv8pynu-shard-00-02.onrf0hf.mongodb.net:27017/pollstack?ssl=true&replicaSet=atlas-zwz7cy-shard-0&authSource=admin&retryWrites=true&w=majority')
  .then(() => console.log("✅ Database connected"))
  .catch(err => console.log(err));

// ✅ Test Route
app.get('/', (req, res) => {
  res.send("PollStack Backend Running 🚀");
});

// ✅ Create Poll API
app.post('/api/poll', async (req, res) => {
  const { question, options, adminPassword } = req.body;

  if (adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const poll = new Poll({
    question,
    options: options.map(opt => ({ text: opt, votes: 0 }))
  });

  await poll.save();
  res.json(poll);
});

app.get('/api/polls', async (req, res) => {
  try {
    const userIp = req.ip;
    const polls = await Poll.find().sort({ _id: -1 });

    const formattedPolls = polls.map(poll => {
      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
      return {
        _id: poll._id,
        question: poll.question,
        hasVoted: poll.votedUsers.includes(userIp),
        options: poll.options.map(opt => ({
          text: opt.text,
          votes: opt.votes,
          percentage: totalVotes === 0 ? "0%" : ((opt.votes / totalVotes) * 100).toFixed(0) + "%"
        }))
      };
    });

    res.json(formattedPolls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/results/latest', async (req, res) => {
  try {
    const poll = await Poll.findOne().sort({ _id: -1 });

    if (!poll) {
      return res.status(404).json({ error: "No polls found" });
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    const options = poll.options.map(opt => ({
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes === 0
        ? "0%"
        : ((opt.votes / totalVotes) * 100).toFixed(0) + "%"
    }));

    res.json({
      _id: poll._id,
      question: poll.question,
      options
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Vote API (One vote per IP)
app.post('/api/vote', async (req, res) => {
  try {
    const { pollId, optionIndex } = req.body;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    // Check valid option
    if (!poll.options[optionIndex]) {
      return res.status(400).json({ error: "Invalid option" });
    }

    const userIp = req.ip;

    // Prevent duplicate vote
    if (poll.votedUsers.includes(userIp)) {
      return res.status(400).json({ error: "You have already voted!" });
    }

    // Add vote
    poll.options[optionIndex].votes += 1;
    poll.votedUsers.push(userIp);

    await poll.save();

    res.json({ message: "✅ Vote recorded!" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get All Results API
app.get('/api/results/all', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ _id: -1 });

    const results = polls.map(poll => {
      const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
      const options = poll.options.map(opt => ({
        text: opt.text,
        votes: opt.votes,
        percentage: totalVotes === 0 ? "0%" : ((opt.votes / totalVotes) * 100).toFixed(0) + "%"
      }));

      return {
        _id: poll._id,
        question: poll.question,
        options
      };
    });

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get Results API
app.get('/api/results/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    const options = poll.options.map(opt => ({
      text: opt.text,
      votes: opt.votes,
      percentage: totalVotes === 0
        ? "0%"
        : ((opt.votes / totalVotes) * 100).toFixed(0) + "%"
    }));

    // ✅ IMPORTANT: return 'options' (frontend needs this)
    res.json({
      _id: poll._id,
      question: poll.question,
      options: options
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Delete Poll API
app.delete('/api/poll/:id', async (req, res) => {
  try {
    const { adminPassword } = req.body;

    if (adminPassword !== ADMIN_PASSWORD) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }

    res.json({ message: "✅ Poll deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start Server
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});