const BASE_URL = "http://localhost:3000/api";
const localVotedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');

// Load all polls
async function loadPolls() {
  const res = await fetch(`${BASE_URL}/polls`);
  const data = await res.json();

  if (data.error || data.length === 0) {
    document.getElementById("pollDisplay").innerHTML =
      "<p>No active polls yet</p>";
    return;
  }

  document.getElementById("pollDisplay").innerHTML = data.map(poll => {
    const showResults = poll.hasVoted || localVotedPolls.includes(poll._id);
    return `
      <div style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
        <h3>${poll.question}</h3>
        ${showResults 
          ? poll.options.map(opt => `
              <div style="margin-bottom: 10px;">
                <p style="margin: 0 0 5px 0;">${opt.text} - ${opt.votes} votes (${opt.percentage})</p>
                <div style="width: 100%; background-color: #f3f3f3; border-radius: 5px; overflow: hidden; height: 10px;">
                  <div style="width: ${opt.percentage}; height: 100%; background-color: #4CAF50;"></div>
                </div>
              </div>`).join("") 
          : poll.options.map((opt, i) => `<button onclick="vote('${poll._id}', ${i})" style="margin: 5px;">${opt.text}</button>`).join("")}
      </div>
    `;
  }).join("");
}

// Vote
async function vote(pollId, optionIndex) {
  const res = await fetch(`${BASE_URL}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pollId, optionIndex })
  });

  const data = await res.json();

  if (data.error) {
    if (data.error === "You have already voted!") {
      if (!localVotedPolls.includes(pollId)) {
        localVotedPolls.push(pollId);
        localStorage.setItem('votedPolls', JSON.stringify(localVotedPolls));
      }
    }
    alert(data.error);
    loadPolls();
  } else {
    alert("✅ Vote recorded!");
    if (!localVotedPolls.includes(pollId)) {
      localVotedPolls.push(pollId);
      localStorage.setItem('votedPolls', JSON.stringify(localVotedPolls));
    }
    loadPolls(); // Refresh UI after vote
  }
}

window.onload = () => {
  loadPolls();
  setInterval(loadPolls, 5000); // Fetch data every 5 seconds for real-time updates
};