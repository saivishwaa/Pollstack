const mongoose = require('mongoose');

const PollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [
    {
      text: String,
      votes: {
        type: Number,
        default: 0
      }
    }
  ]
  votedUsers: {
  type: [String],
  default: []
}
});

module.exports = mongoose.model('Poll', PollSchema);