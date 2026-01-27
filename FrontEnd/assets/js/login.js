// Redirige l'utilisateur vers la page principale s'il est déjà connecté
const loginPageCheck = () => {
  const isLoggedIn = !!localStorage.getItem("authToken"); // Valeur booléenne
  if (!isLoggedIn) return; // Si aucun token, on sort de la fonction
  window.location.href = "index.html";
};
loginPageCheck();

const submitListener = () => {
  console.log("Script chargé !");
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Reset du message d'erreur à chaque tentative
    if (errorMessage) {
      errorMessage.textContent = "";
      errorMessage.classList.remove("login-form__error--border");
    }

    const formData = new FormData(loginForm);
    const payload = Object.fromEntries(formData);

    try {
      const response = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Erreur d'authentification.");
      }

      const data = await response.json();
      
      localStorage.setItem("authToken", data.token);
      
      window.location.href = "index.html";

    } catch (error) {
      console.error("Échec de la connexion :", error.message);
      if (errorMessage) {
        errorMessage.textContent = "Erreur d'authentification.";
        errorMessage.classList.add("login-form__error--border");
      }
    }
  });
};
submitListener();