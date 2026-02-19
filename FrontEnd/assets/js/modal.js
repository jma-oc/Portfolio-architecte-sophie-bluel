let focusElementBeforeModal = null;

const openModal = () => {
  focusElementBeforeModal = document.activeElement;
  const modal = document.getElementById("modal1");
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  modal.setAttribute("aria-modal", "true");
};

const closeModal = () => {
  const modal = document.getElementById("modal1");
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  modal.removeAttribute("aria-modal");

  if (typeof resetAddPhotoForm === "function") {
    resetAddPhotoForm();
  }

  if (focusElementBeforeModal) focusElementBeforeModal.focus();
  displayGalleryView();
};

const setupModal = () => {
  const modal = document.getElementById("modal1");
  const editionBar = document.querySelector(".edition-bar");
  const closeButton = document.querySelector(".modal__close");

  if (!modal || !editionBar || !closeButton) return;

  editionBar.addEventListener("click", (e) => {
    e.preventDefault();
    openModal();
  });

  closeButton.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
};

const displayGalleryView = () => {
  const deleteView = document.querySelector(".modal__delete-photo");
  const addView = document.querySelector(".modal__add-photo");
  const previousButton = document.querySelector(".modal__previous");

  deleteView.classList.remove("hidden");
  addView.classList.add("hidden");
  previousButton.classList.add("hidden");

  const title = deleteView.querySelector("h3");
  title.setAttribute("tabindex", "-1");
  title.focus();
};

const displayAddPhotoView = () => {
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

const setupImagePreview = () => {
  const input = document.getElementById("image");
  const previewImg = document.querySelector(".modal__form-imgpreview");
  const label = document.querySelector(".modal__form-photolabel");
  const specs = document.querySelector(".modal__form-photospecs");

  if (!input || !previewImg) return;

  input.addEventListener("change", () => {
    const file = input.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        previewImg.src = e.target.result;
        previewImg.classList.add("preview-active");

        label.style.display = "none";
        specs.style.display = "none";

        previewImg.alt = `Prévisualisation de : ${file.name}`;
      };

      reader.readAsDataURL(file);
    }
  });
};

const setupFormValidation = () => {
  const form = document.querySelector(".modal__form");
  const inputPhoto = document.getElementById("image");
  const inputTitle = document.getElementById("addPhoto_title");
  const inputCategory = document.getElementById("addPhoto_category");
  const submitBtn = document.querySelector(".modal__submit");

if (!form || !inputPhoto || !inputTitle || !inputCategory || !submitBtn) return;

  const checkForm = () => {
    const isPhotoSelected = inputPhoto.files.length > 0;
    const isTitleFilled = inputTitle.value.trim() !== "";
    const isCategorySelected = inputCategory.value !== "";

    if (isPhotoSelected && isTitleFilled && isCategorySelected) {
      submitBtn.disabled = false;
      submitBtn.setAttribute("aria-disabled", "false");
      submitBtn.style.cursor = "pointer";
    } else {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-disabled", "true");
      submitBtn.style.cursor = "not-allowed";
    }
  };

  inputPhoto.addEventListener("change", checkForm);
  inputTitle.addEventListener("input", checkForm);
  inputCategory.addEventListener("change", checkForm);
};

const fillModalCategories = async () => {
  const select = document.getElementById("addPhoto_category");
  if (!select) return;

  const categories = await fetchCategories();

  select.innerHTML = '<option value=""></option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    select.appendChild(option);
  });
};

const setupFormSubmit = () => {
  const form = document.querySelector(".modal__form");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("Photo ajoutée avec succès !");
        await refreshAllGalleries();
        resetAddPhotoForm();
        displayGalleryView();
      } else {
        alert("Erreur lors de l'envoi : " + response.statusText);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    }
  });
};

const resetAddPhotoForm = () => {
  const form = document.querySelector(".modal__form");
  const previewImg = document.querySelector(".modal__form-imgpreview");
  const label = document.querySelector(".modal__form-photolabel");
  const specs = document.querySelector(".modal__form-photospecs");
  const submitBtn = document.querySelector(".modal__submit");

  if (form) form.reset();

  previewImg.src = "./assets/icons/vector.png";
  previewImg.classList.remove("preview-active");
  label.style.display = "block";
  specs.style.display = "block";

  submitBtn.disabled = true;
  submitBtn.setAttribute("aria-disabled", "true");
  submitBtn.style.cursor = "not-allowed";
};

const modalGallery = async () => {
  const modalGalleryContainer = document.querySelector(".modal__gallery");
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

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("modal__delete-button");
      deleteButton.setAttribute(
        "aria-label",
        `Supprimer l'image ${work.title}`,
      );

      deleteButton.addEventListener("click", async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("authToken");
        try {
          const response = await fetch(
            `http://localhost:5678/api/works/${work.id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          if (response.ok) {
            alert("La photo a été supprimée avec succès.");
            await refreshAllGalleries();
          }
        } catch (error) {
          console.error("Erreur suppression : ", error);
        }
      });

      deleteButton.innerHTML =
        '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
      figure.appendChild(img);
      figure.appendChild(deleteButton);
      modalGalleryContainer.appendChild(figure);
    });
  } catch (error) {
    console.error("Erreur dans modalGallery : ", error);
  }
};

const refreshAllGalleries = async () => {
  try {
    const updatedWorks = await fetchGallery();

    displayGallery(updatedWorks);
    await modalGallery();
  } catch (error) {
    console.error("Échec de la mise à jour des galeries : ", error);
  }
};

// On initialise la modale et la galerie une seule fois
setupModal();
modalGallery();

// Lien pour afficher la vue d'ajout de photo
const addBtn = document.getElementById("modal__add-photo-button");
if (addBtn) {
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    displayAddPhotoView();
  });
}

// Lien pour revenir à la galerie depuis la vue d'ajout
const prevBtn = document.querySelector(".modal__previous");
if (prevBtn) {
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    displayGalleryView();
  });
}

// On prépare les mécanismes du formulaire une seule fois
setupImagePreview();
setupFormValidation();
fillModalCategories();
setupFormSubmit();
