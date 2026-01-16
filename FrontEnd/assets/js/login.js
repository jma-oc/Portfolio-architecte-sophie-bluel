const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(loginForm); // Récupère les données du formulaire
    const payload = Object.fromEntries(formData); // Convertit en objet JS

    try {
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload), // Envoie les données au format JSON
        });

        if (!response.ok) {
            throw new Error(response.status === 401 || response.status === 404 // 401 Unauthorized ou 404 Not Found
                ? "Identifiants incorrects" 
                : "Erreur serveur");
        }

        const { token } = await response.json();
        
        localStorage.setItem("authToken", token);
        window.location.href = "index.html";

    } catch (error) {
        console.error("Échec de la connexion :", error.message);
        alert(error.message || "Une erreur est survenue.");
    }
});