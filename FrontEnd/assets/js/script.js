(() => {
  const worksStore = new Map();
  let focusElementBeforeModal = null;

  // APPELS API

  const initWorksStore = async () => {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      const works = await response.json();
      worksStore.clear();
      works.forEach((work) => worksStore.set(work.id, work));
      renderAllGalleries();
    } catch (error) {
      console.error("Erreur de récupération des projets : ", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5678/api/categories");
      return await response.json();
    } catch (error) {
      console.error("Erreur catégories : ", error);
      return [];
    }
  };

  // AFFICHAGE DES GALLERIES (PRINCIPALE + MODALE)

  const renderAllGalleries = (filteredWorks = null) => {
    // Si aucune prop, on affiche tout
    const worksToShow = filteredWorks || Array.from(worksStore.values()); // Si filterdWorks null, on affiche tout, sinon on affiche le filtré

    // Galerie principale

    const gallery = document.querySelector(".gallery");
    if (gallery) {
      gallery.innerHTML = "";
      worksToShow.forEach((work) => {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
      });
    }

    // GALERIE DE LA MODALE

    const modalGallery = document.querySelector(".modal__gallery");
    if (modalGallery) {
      modalGallery.innerHTML = "";
      worksStore.forEach((work) => {
        const figure = document.createElement("figure");
        figure.classList.add("modal__item");

        const img = document.createElement("img");
        img.src = work.imageUrl;
        img.alt = work.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("modal__delete-button");
        deleteBtn.setAttribute("aria-label", `Supprimer ${work.title}`);

        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can");

        deleteBtn.addEventListener("click", () => deleteWork(work.id));

        deleteBtn.appendChild(icon);
        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        modalGallery.appendChild(figure);
      });
    }
  };

  // GESTION DES FILTRES

  const setupFilters = (categories) => {
    const filterBar = document.querySelector(".filterbar");
    if (!filterBar) return;

    const createBtn = (id, name, active = false) => {
      const btn = document.createElement("button");
      btn.className = "filterbar__button";
      btn.textContent = name;
      btn.setAttribute("aria-pressed", active);
      btn.addEventListener("click", () => {
        const filterButtons = document.querySelectorAll(".filterbar__button");
        filterButtons.forEach((button) =>
          button.setAttribute("aria-pressed", "false"),
        );
        btn.setAttribute("aria-pressed", "true");
        const allWorks = Array.from(worksStore.values());
        const filtered =
          id === "all"
            ? allWorks
            : allWorks.filter((work) => work.categoryId === id);
        renderAllGalleries(filtered);
      });
      return btn;
    };

    filterBar.innerHTML = "";
    filterBar.appendChild(createBtn("all", "Tous", true));
    categories.forEach((cat) =>
      filterBar.appendChild(createBtn(cat.id, cat.name)),
    );
  };

  // MODALE

  const setupModalLogic = () => {
    const modal = document.getElementById("modal1");
    const editionBar = document.querySelector(".edition-bar");
    const closeBtn = document.querySelector(".modal__close");
    const addBtn = document.getElementById("modal__add-photo-button");
    const prevBtn = document.querySelector(".modal__previous");
    const form = document.querySelector(".modal__form");
    const fileInput = document.getElementById("image");
    const titleInput = document.getElementById("addPhoto_title");
    const categoryInput = document.getElementById("addPhoto_category");
    const submitBtn = document.querySelector(".modal__submit");

    // OUVERTURE ET FERMETURE

    const openModale = () => {
      focusElementBeforeModal = document.activeElement;
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      modal.setAttribute("aria-modal", "true");
      displayGalleryView();
    };

    const closeModale = () => {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      modal.removeAttribute("aria-modal");
      resetAddPhotoForm();
      if (focusElementBeforeModal) focusElementBeforeModal.focus();
    };

    if (editionBar)
      editionBar.addEventListener("click", (e) => {
        e.preventDefault();
        openModale();
      });
    if (closeBtn) closeBtn.addEventListener("click", closeModale);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModale();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModale();
    });

    // NAVIGATION ENTRE LES VUES

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        document.querySelector(".modal__delete-photo").classList.add("hidden");
        document.querySelector(".modal__add-photo").classList.remove("hidden");
        prevBtn.classList.remove("hidden");
      });
    }

    if (prevBtn) prevBtn.addEventListener("click", displayGalleryView);

    // VALIDATION DE L'UPLOAD

    if (fileInput) {
      fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        const errorMsg = document.getElementById("file-error-msg");
        const previewImg = document.querySelector(".modal__form-imgpreview");
        const label = document.querySelector(".modal__form-photolabel");
        const specs = document.querySelector(".modal__form-photospecs");

        // Reset des erreurs

        if (errorMsg) {
          errorMsg.textContent = "";
          errorMsg.classList.add("hidden");
        }

        if (file) {
          const isValidType = ["image/jpeg", "image/jpg", "image/png"].includes(
            file.type,
          );
          const isValidSize = file.size <= 4 * 1024 * 1024;

          if (!isValidType || !isValidSize) {
            if (errorMsg) {
              errorMsg.textContent = !isValidType
                ? "Format non supporté (JPG ou PNG uniquement)."
                : "Fichier trop lourd (4 Mo maximum).";
              errorMsg.classList.remove("hidden");
            }
            resetFileInput();
            return;
          }

          // Si valide : Affichage de la preview
          const reader = new FileReader();
          reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewImg.classList.add("preview-active");
            if (label) label.style.display = "none";
            if (specs) specs.style.display = "none";
          };
          reader.readAsDataURL(file);
        }
        checkFormValidity();
      });
    }

    // VALIDATION DU BOUTON "ENVOYER"
    const checkFormValidity = () => {
      const isTitleOk = titleInput.value.trim() !== "";
      const isCategoryOk = categoryInput.value !== "";
      const isFileOk = fileInput.files.length > 0;

      const isValid = isTitleOk && isCategoryOk && isFileOk;
      submitBtn.disabled = !isValid;
    };

    if (form) {
      form.addEventListener("input", checkFormValidity);
      form.addEventListener("change", checkFormValidity);
      form.addEventListener("submit", handleFormSubmit);
    }
  };

  // UTILITAIRE POUR VIDER LE CONTENU DE L'INPUT FILE + RESET DE LA PREVIEW
  const resetFileInput = () => {
    const fileInput = document.getElementById("image");
    const previewImg = document.querySelector(".modal__form-imgpreview");
    const label = document.querySelector(".modal__form-photolabel");
    const specs = document.querySelector(".modal__form-photospecs");

    if (fileInput) fileInput.value = "";
    if (previewImg) {
      previewImg.src = "./assets/icons/vector.png";
      previewImg.classList.remove("preview-active");
    }
    if (label) label.style.display = "block";
    if (specs) specs.style.display = "block";
  };

  // AFFICHER LA GALLERIE DE LA MODALE
  const displayGalleryView = () => {
    const deleteView = document.querySelector(".modal__delete-photo");
    const addPhotoView = document.querySelector(".modal__add-photo");
    const prevBtn = document.querySelector(".modal__previous");
    deleteView.classList.remove("hidden");
    addPhotoView.classList.add("hidden");
    prevBtn.classList.add("hidden");
  };

  // RÉINIITIALISATION DU FORMULAIRE D'AJOUT DE PROJET
  const resetAddPhotoForm = () => {
    const form = document.querySelector(".modal__form");
    if (form) form.reset();
    const preview = document.querySelector(".modal__form-imgpreview");
    preview.src = "./assets/icons/vector.png";
    preview.classList.remove("preview-active");
    document.querySelector(".modal__form-photolabel").style.display = "block";
    document.querySelector(".modal__form-photospecs").style.display = "block";
    document.querySelector(".modal__submit").disabled = true;
    const errorMsg = document.getElementById("file-error-msg");
    if (errorMsg) {
      errorMsg.textContent = "";
      errorMsg.classList.add("hidden");
    }
  };

  // SUPPRESSION DE PROJET
  const deleteWork = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!confirm("Voulez-vous vraiment supprimer ce projet ?")) return;

    try {
      const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        worksStore.delete(id);
        renderAllGalleries();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // AJOUT DE PROJET
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const newWork = await response.json();
        worksStore.set(newWork.id, newWork);
        renderAllGalleries();
        displayGalleryView();
        resetAddPhotoForm();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // INITIALISATION
  const init = async () => {
    // Check Login
    const token = localStorage.getItem("authToken");
    if (token) {
      document.querySelector(".edition-bar").classList.remove("hidden");
      document.querySelector(".filterbar").classList.add("hidden");
      document.querySelector(".header").style.marginTop = "100px";
      const loginLink = document.querySelector(".login-link");
      loginLink.innerHTML = '<a href="#">logout</a>';
      loginLink.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        location.reload();
      });
    }

    const categories = await fetchCategories();
    setupFilters(categories);

    // Remplissage des catégories
    const select = document.getElementById("addPhoto_category");
    if (select) {
      select.innerHTML = '<option value=""></option>';
      categories.forEach((categorie) => {
        const opt = document.createElement("option");
        opt.value = categorie.id;
        opt.textContent = categorie.name;
        select.appendChild(opt);
      });
    }

    setupModalLogic();
    await initWorksStore();
  };

  init();
})();
