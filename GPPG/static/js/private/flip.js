const flipCard = document.querySelector(".flip-card");
const flipToSignup = document.getElementById("flipToSignup");
const flipToSignin = document.getElementById("flipToSignin");

flipToSignup.addEventListener("click", (e) => {
  e.preventDefault();
  flipCard.classList.add("flipped");
});

flipToSignin.addEventListener("click", (e) => {
  e.preventDefault();
  flipCard.classList.remove("flipped");
});
