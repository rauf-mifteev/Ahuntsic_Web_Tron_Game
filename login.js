// Credentials simulés (pas de base de données)
const VALID_EMAIL    = "joueur@tron.com";
const VALID_PASSWORD = "tron1234";

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault(); // Empêche le rechargement de la page

    const email    = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("error-msg");

    errorMsg.textContent = "";

    // Validation 1 : champs vides
    if (email === "" || password === "") {
        errorMsg.textContent = "Veuillez remplir tous les champs.";
        return;
    }

    // Validation 2 : format courriel (regex simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorMsg.textContent = "Le courriel n'est pas valide.";
        return;
    }

    // Vérification des credentials
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        window.location.href = "index.html"; // Redirection vers le jeu
    } else {
        errorMsg.textContent = "Courriel ou mot de passe incorrect.";
    }
});
