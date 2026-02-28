const container = document.getElementById("container");

const users = [
  {
    id: 1,
    name: "John",
    skills: ["React", "Node.js", "TypeScript"]
  },
  {
    id: 2,
    name: "Sarah",
    skills: ["Python", "Django"]
  }
];

function generalSkills() {

}

// function branchTemplate(users) {
//   let html = "";

//   const userInfo = users.forEach(user => {
//     user.skills.forEach(skill => {
//       html += `${skill}\n`;
//     });
//   });

//   container.innerHTML = html;

// }

function branchTemplate(users) {
  const html = users
    .map(user =>
      user.skills.map(skill => `<p>${skill}</p>`).join("")
    )
    .join("");

  container.innerHTML = html;
}

function init(){
  generalSkills();
  branchTemplate(users);
  
}

init();
