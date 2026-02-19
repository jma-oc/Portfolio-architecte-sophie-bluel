const setupModal = () => {
  const modal = document.getElementById("modal1");
  const editionBar = document.querySelector(".edition-bar");
  const closeButton = document.querySelector(".modal__close");

  if (!modal || !editionBar || !closeButton) return;

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    modal.setAttribute("aria-modal", "true");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
  };

  editionBar.addEventListener("click", (event) => {
    event.preventDefault();
    openModal();
  });

  closeButton.addEventListener("click", (event) => {
    event.preventDefault();
    closeModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.key === "Esc") {
      closeModal();
    }
  });
};

setupModal();

const showGalleryView = () => {
  const deleteView = document.querySelector(".modal__delete-photo");
  const addView = document.querySelector(".modal__add-photo");
  const previousButton = document.querySelector(".modal__previous");

  deleteView.classList.remove("hidden");
  addView.classList.add("hidden");
  previousButton.classList.add("hidden");

  // ARIA : On remet le focus sur le titre de la galerie
  const title = deleteView.querySelector("h3");
  title.setAttribute("tabindex", "-1");
  title.focus();
};

const showAddPhotoView = () => {
  const deleteView = document.querySelector(".modal__delete-photo");
  const addView = document.querySelector(".modal__add-photo");
  const previousButton = document.querySelector(".modal__previous");

  deleteView.classList.add("hidden");
  addView.classList.remove("hidden");
  previousButton.classList.remove("hidden");

  // ARIA : On déplace le focus vers le nouveau titre pour confirmer le changement de vue
  const title = addView.querySelector("h3");
  title.setAttribute("tabindex", "-1");
  title.focus();
};

const modalGallery = async () => {
  const modalGalleryContainer = document.querySelector(".modal__gallery");
  const addPhotoButton = document.getElementById("modal__add-photo-button");
  const previousButton = document.querySelector(".modal__previous");

  if (!modalGalleryContainer) return;

  try {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();
    modalGalleryContainer.innerHTML = "";

    works.forEach((work) => {
      const figure = document.createElement("figure");
      figure.classList.add("modal__item");

      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;
      img.id = work.id;

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("modal__delete-button");
      deleteButton.setAttribute(
        "aria-label",
        `Supprimer l'image ${work.title}`,
      );
      deleteButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("authToken");

        // Vérification avant l'envoi
        if (!token) {
          console.error(
            "Action impossible : aucun token trouvé dans le localStorage.",
          );
          return;
        }

        try {
          const response = await fetch(
            `http://localhost:5678/api/works/${work.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.ok) {
            figure.remove();
            console.log("Suppression réussie !");
          } else {
            console.error(`Erreur ${response.status} : ${response.statusText}`);
          }
        } catch (error) {
          console.error("Erreur réseau ou serveur :", error);
        }
      });
      deleteButton.innerHTML =
        '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';

      figure.appendChild(img);
      figure.appendChild(deleteButton);
      modalGalleryContainer.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur dans displayModalGallery : ", error);
  }

  // 4. Attribution des écouteurs de clics (une seule fois ici)
  addPhotoButton.addEventListener("click", (e) => {
    e.preventDefault();
    showAddPhotoView();
  });

  previousButton.addEventListener("click", (e) => {
    e.preventDefault();
    showGalleryView();
  });
};

modalGallery();