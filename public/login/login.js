import { loadHeaderFooter } from "../scripts/utils.mjs";

loadHeaderFooter();

const message = document.getElementById("auth-message");

document.getElementById("register-btn").addEventListener("click", async () => {
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  const res = await fetch("/api/register", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  message.innerText = JSON.stringify(data);
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    message.innerText = "Logged in!";
    window.location.href = "../skills/skills.html";
  } else {
    message.innerText = "Login failed";
  }
});