const BASE_URL = "https://pollstack-backend.onrender.com";

let ADMIN_PASSWORD = "";
let currentPollId = null;

// Login
function login() {
  const pass = document.getElementById("adminPass").value;

  if (!pass) return alert("Enter password");

  ADMIN_PASSWORD = pass;

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("adminPanel").style.display = "block";

  loadLatestPoll();
}

// Load latest poll
async function loadLatestPoll() {
  const res = await fetch(`${BASE_URL}/results/latest`);
  const data = await res.json();

  currentPollId = data._id;
}

// Create Poll
async function createPoll() {
  const question = document.getElementById("question").value;
  const option1 = document.getElementById("option1").value;
  const option2 = document.getElementById("option2").value;

  const res = await fetch(`${BASE_URL}/poll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question,
      options: [option1, option2],
      adminPassword: ADMIN_PASSWORD
    })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
  } else {
    alert("✅ Poll Created");
    currentPollId = data._id;
  }
}

// Load Results
async function loadResults() {
  const res = await fetch(`${BASE_URL}/results/all?adminPassword=${ADMIN_PASSWORD}`);
  const data = await res.json();

  if (data.error) {
    return alert(data.error);
  }

  if (data.length === 0) {
    document.getElementById("results").innerHTML = "<p>No polls available</p>";
    return;
  }

  document.getElementById("results").innerHTML = data.map(poll => `
    <div style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px;">
      <h3>${poll.question}</h3>
      ${poll.options.map(opt => `
        <div style="margin-bottom: 10px;">
          <p style="margin: 0 0 5px 0;">${opt.text} - ${opt.votes} votes (${opt.percentage})</p>
          <div style="width: 100%; background-color: #f3f3f3; border-radius: 5px; overflow: hidden; height: 10px;">
            <div style="width: ${opt.percentage}; height: 100%; background-color: #2196F3;"></div>
          </div>
        </div>
      `).join("")}
      <button style="background: red; color: white; margin-top: 10px;" onclick="deletePoll('${poll._id}')">Delete Poll</button>
    </div>
  `).join("");
}

// Delete Poll
async function deletePoll(pollId) {
  if (!confirm("Are you sure you want to delete this poll?")) return;

  const res = await fetch(`${BASE_URL}/poll/${pollId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ adminPassword: ADMIN_PASSWORD })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
  } else {
    alert(data.message);
    loadResults(); // refresh results list
  }
}

// Fetch results periodically for real-time updates
setInterval(() => {
  if (ADMIN_PASSWORD) {
    loadResults();
  }
}, 5000);
