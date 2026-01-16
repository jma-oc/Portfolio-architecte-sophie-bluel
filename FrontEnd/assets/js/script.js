const loginCheck = () => {
    const isLoggedIn = !!localStorage.getItem("authToken"); // Valeur booléenne

    if (!isLoggedIn) return; // Si aucun token, on sort de la fonction

    const filterBar = document.querySelector('.filterbar');
    const editionBar = document.querySelector('.edition-bar');
    const header = document.querySelector('.header');
    const loginLink = document.querySelector('.login-link');

    filterBar.classList.remove('display-none');
    editionBar.classList.add('display-flex');
    header.classList.add('margin-top109');

    // Modifie le lien de connexion en déconnexion
    loginLink.innerHTML = '<a href="#">logout</a>';
    loginLink.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem("authToken");
        location.reload();
    }, { once: true }); // Supprime l'écouteur après clic - Sécurité/performance/propreté
};

loginCheck();

// Affiche la galerie
let works = [];

const fetchGallery = async () => {
    const reponse = await fetch('http://localhost:5678/api/works');
    works = await reponse.json();
    displayGallery(works);
};

// Récupère les catégories
const fetchCategories = async () => {
    const reponse = await fetch('http://localhost:5678/api/categories');
    return await reponse.json();
};

// Affiche les boutons de filtre
const displayFilters = (categories) => {
    const filterBar = document.querySelector('.filterbar');
    
    filterBar.innerHTML = `<button class="filterbar__button" data-category-id="all">Tous</button>`;
    filterBar.innerHTML += categories.map(category => `
            <button class="filterbar__button" data-category-id="${category.id}">${category.name}</button>
        `).join('');

    const buttons = document.querySelectorAll('.filterbar__button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const categoryId = button.getAttribute('data-category-id');
            filterGallery(categoryId);
        });
    });
};

// Filtre la galerie
const filterGallery = (categoryId) => {
    const filteredWorks = categoryId === "all" 
        ? works 
        : works.filter(work => work.categoryId == categoryId);
    
    displayGallery(filteredWorks);
};

// Affiche les œuvres dans la galerie
const displayGallery = (works) => {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = works.map(work => `
        <figure>
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        </figure>
    `).join('');
};

// Initialisation de l'application
const initializeApp = async () => {
    const categories = await fetchCategories();
    displayFilters(categories);
    await fetchGallery();
};

initializeApp();