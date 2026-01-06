const reponse = await fetch('http://localhost:5678/api/works');
const works = await reponse.json();

const gallery = document.querySelector('.gallery');

gallery.innerHTML = works.map(work => `
    <figure>
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    </figure>
`).join('');