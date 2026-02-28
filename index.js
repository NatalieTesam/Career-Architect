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

function branchTemplate(users) {
  users.forEach(user => {
    user.skills.forEach(skill => {
      console.log(`${user.name} wants to learn ${skill}`);
    });
  });
}

function init(){
    generalSkills();
    branchTemplate;

}

init();
