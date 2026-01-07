let works = [];

const fetchGallery = async () => {
    const reponse = await fetch('http://localhost:5678/api/works');
    works = await reponse.json(); // On stocke les données ici
    displayGallery(works); // On affiche tout au début
};

const fetchCategories = async () => {
    const reponse = await fetch('http://localhost:5678/api/categories');
    return await reponse.json();
};

const filterGallery = (categoryId) => {
    const filteredWorks = categoryId === "all" 
        ? works 
        : works.filter(work => work.categoryId == categoryId);
    
    displayGallery(filteredWorks);
};

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

const displayGallery = (works) => {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = works.map(work => `
        <figure>
            <img src="${work.imageUrl}" alt="${work.title}">
            <figcaption>${work.title}</figcaption>
        </figure>
    `).join('');
};

fetchCategories().then(categories => displayFilters(categories));
fetchGallery();