const loginCheck = () => {
  const isLoggedIn = !!localStorage.getItem("authToken"); // Valeur booléenne

  if (!isLoggedIn) return; // Si aucun token, on sort de la fonction

  const filterBar = document.querySelector(".filterbar");
  const editionBar = document.querySelector(".edition-bar");
  const header = document.querySelector(".header");
  const loginLink = document.querySelector(".login-link");

  filterBar.classList.remove("display-none");
  editionBar.classList.remove("hidden");
  header.classList.add("margin-top109");

  // Modifie le lien de connexion en déconnexion
  loginLink.innerHTML = '<a href="#">logout</a>';
  loginLink.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      localStorage.removeItem("authToken");
      location.reload();
    },
    { once: true },
  ); // Supprime l'écouteur après clic - Sécurité/performance/propreté
};

loginCheck();

// Affiche la galerie
const fetchGallery = async () => {
  try {
    const reponse = await fetch("http://localhost:5678/api/works");
    if (!reponse.ok) {
      throw new Error("Erreur lors de la récupération des données");
    }
    return await reponse.json();
  } catch (error) {
    console.error("Erreur dans fetchGallery :", error);
    return [];
  }
};

// Récupère les catégories
const fetchCategories = async () => {
  try {
    const reponse = await fetch("http://localhost:5678/api/categories");
    if (!reponse.ok) {
      throw new Error("Erreur lors de la récupération des catégories");
    }
    return await reponse.json();
  } catch (error) {
    console.error("Erreur dans fetchCategories :", error);
    return [];
  }
};

// Affiche les boutons de filtre
const displayFilters = (categories) => {
  const filterBar = document.querySelector(".filterbar");
  filterBar.innerHTML = "";
  const btnAll = document.createElement("button");
  btnAll.classList.add("filterbar__button");
  btnAll.dataset.categoryId = "all";
  btnAll.textContent = "Tous";

  filterBar.appendChild(btnAll);
  btnAll.setAttribute("aria-pressed", "true"); // Aria, active le bouton "Tous" par défaut

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.classList.add("filterbar__button");
    btn.dataset.categoryId = category.id;
    btn.textContent = category.name;

    filterBar.appendChild(btn);
  });
};

// Ajoute les écouteurs de clic aux boutons de filtre
const addFilterListeners = (works) => {
  const buttons = document.querySelectorAll(".filterbar__button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const buttons = document.querySelectorAll(".filterbar__button");
      buttons.forEach((btn) => btn.setAttribute("aria-pressed", "false")); // Aria, réinitialise tous les boutons
      button.setAttribute("aria-pressed", "true"); // Aria, active le bouton cliqué
      const categoryId = button.getAttribute("data-category-id");
      filterGallery(categoryId, works);
    });
  });
};

// Filtre la galerie
const filterGallery = (categoryId, works) => {
  const filteredWorks =
    categoryId === "all"
      ? works
      : works.filter((work) => work.categoryId == categoryId);

  displayGallery(filteredWorks);
};

// Affiche les œuvres dans la galerie
const displayGallery = (works) => {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = "";
  works.forEach((work) => {
    const figure = document.createElement("figure");
    const img = document.createElement("img");
    const figcaption = document.createElement("figcaption");
    img.src = work.imageUrl;
    img.alt = work.title;
    figcaption.textContent = work.title;
    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
};

// Initialisation de l'application
const initializeApp = async () => {
  const categories = await fetchCategories();
  const works = await fetchGallery();
  displayGallery(works);
  displayFilters(categories, works);
  addFilterListeners(works);
};

initializeApp();
