const BASE_URL = "http://localhost:3000/api";

// Load all polls
async function loadPolls() {
  const res = await fetch(`${BASE_URL}/polls`);
  const data = await res.json();

  if (data.error || data.length === 0) {
    document.getElementById("pollDisplay").innerHTML =
      "<p>No active polls yet</p>";
    return;
  }

  document.getElementById("pollDisplay").innerHTML = data.map(poll => `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
      <h3>${poll.question}</h3>
      ${poll.options.map((opt, i) => `
        <button onclick="vote('${poll._id}', ${i})">${opt.text}</button>
      `).join("")}
    </div>
  `).join("");
}

// Vote
async function vote(pollId, optionIndex) {
  const res = await fetch(`${BASE_URL}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pollId,
      optionIndex
    })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
  } else {
    alert("✅ Vote recorded!");
    loadPolls(); // Refresh UI after vote
  }
}

window.onload = () => {
  loadPolls();
  setInterval(loadPolls, 5000); // Fetch data every 5 seconds for real-time updates
};