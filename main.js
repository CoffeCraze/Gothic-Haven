// utils.js - Funções utilitárias
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

const safeQuerySelector = (selector, parent = document) => {
    try {
        return parent.querySelector(selector);
    } catch (error) {
        console.warn(`Erro ao selecionar ${selector}:`, error);
        return null;
    }
};

const safeQuerySelectorAll = (selector, parent = document) => {
    try {
        return Array.from(parent.querySelectorAll(selector));
    } catch (error) {
        console.warn(`Erro ao selecionar ${selector}:`, error);
        return [];
    }
};

// data.js - Dados da aplicação
const monumentsData = {
    "notre-dame": {
        name: "Catedral de Notre-Dame",
        location: "Paris, França",
        description: "A Catedral de Notre-Dame é um dos mais famosos exemplos da arquitetura gótica. Iniciada em 1163 e concluída em 1245, é conhecida por seus vitrais impressionantes e gárgulas icônicas.",
        funFact: "A catedral sobreviveu a um grande incêndio em 2019 e está atualmente em processo de restauração."
    },
    milan: {
        name: "Catedral de Mil\xe3o",
        location: "Mil\xe3o, It\xe1lia",
        description: "A Catedral de Mil\xe3o, ou Duomo di Milano, \xe9 a maior igreja da It\xe1lia e levou quase seis s\xe9culos para ser conclu\xedda. Sua fachada elaborada \xe9 adornada com 135 agulhas e 3.400 est\xe1tuas.",
        funFact: "O telhado da catedral \xe9 acess\xedvel aos visitantes, oferecendo uma vista panor\xe2mica de Mil\xe3o."
    },
    cologne: {
        name: "Catedral de Col\xf4nia",
        location: "Col\xf4nia, Alemanha",
        description: "A Catedral de Col\xf4nia \xe9 um impressionante exemplo do g\xf3tico alem\xe3o. Sua constru\xe7\xe3o come\xe7ou em 1248 e s\xf3 foi conclu\xedda em 1880, seguindo os planos originais do s\xe9culo XIII.",
        funFact: "As torres g\xeameas da catedral t\xeam 157 metros de altura, fazendo dela a igreja mais alta do mundo at\xe9 1884."
    },
    westminster: {
        name: "Abadia de Westminster",
        location: "Londres, Inglaterra",
        description: "A Abadia de Westminster \xe9 um grande exemplo do g\xf3tico ingl\xeas. Al\xe9m de sua import\xe2ncia arquitet\xf4nica, \xe9 o local tradicional de coroa\xe7\xe3o e sepultamento dos monarcas ingleses e brit\xe2nicos.",
        funFact: "A abadia abriga o t\xfamulo do Soldado Desconhecido, homenageando os mortos na Primeira Guerra Mundial."
    }
};

// features/lazyLoading.js
class LazyLoader {
    constructor() {
        this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            root: null,
            rootMargin: "50px",
            threshold: 0.1
        });
    }

    init() {
        const lazyImages = safeQuerySelectorAll("img[data-src]");
        lazyImages.forEach(img => this.observer.observe(img));
    }

    handleIntersection(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                img.classList.remove("lazy-load");
                observer.unobserve(img);
            }
        });
    }
}

// features/monuments.js
class MonumentManager {
    constructor() {
        this.cards = safeQuerySelectorAll(".monument-card");
        this.detailsContainer = safeQuerySelector("#monument-details");
    }

    init() {
        if (!this.detailsContainer) return;

        this.cards.forEach(card => {
            card.addEventListener("click", () => this.handleCardClick(card));
        });
    }

    handleCardClick(card) {
        const monumentId = card.dataset.monument;
        const data = monumentsData[monumentId];

        if (!data) {
            console.warn(`Dados não encontrados para o monumento: ${monumentId}`);
            return;
        }

        this.updateUI(data, card);
    }

    updateUI(data, activeCard) {
        this.detailsContainer.innerHTML = `
            <h3>${data.name}</h3>
            <p><strong>Localização:</strong> ${data.location}</p>
            <p>${data.description}</p>
            <p><strong>Curiosidade:</strong> ${data.funFact}</p>
        `;

        this.cards.forEach(card => card.classList.remove("active"));
        activeCard.classList.add("active");
        this.detailsContainer.style.display = "block";
    }
}

// features/animations.js
class AnimationManager {
    constructor() {
        this.fadeElements = safeQuerySelectorAll(".fade-in");
        this.floatElements = safeQuerySelectorAll(".float");
        this.observer = new IntersectionObserver(this.handleFadeIntersection.bind(this), {
            threshold: 0.1
        });
    }

    init() {
        this.initFadeAnimations();
        this.initFloatAnimations();
    }

    initFadeAnimations() {
        this.fadeElements.forEach(element => this.observer.observe(element));
    }

    initFloatAnimations() {
        this.floatElements.forEach(element => {
            const duration = 3 + Math.random() * 2;
            element.style.animation = `float ${duration}s ease-in-out infinite`;
        });
    }

    handleFadeIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            }
        });
    }
}

// features/modal.js
class ModalManager {
    constructor() {
        this.modals = safeQuerySelectorAll(".modal");
        this.triggers = safeQuerySelectorAll(".modal-trigger");
        this.closeButtons = safeQuerySelectorAll(".modal-close");
    }

    init() {
        this.initTriggers();
        this.initCloseButtons();
        this.initEscapeKey();
        this.initOutsideClick();
    }

    initTriggers() {
        this.triggers.forEach(trigger => {
            trigger.addEventListener("click", (e) => {
                e.preventDefault();
                const modal = safeQuerySelector(trigger.dataset.modal);
                if (modal) this.openModal(modal);
            });
        });
    }

    initCloseButtons() {
        this.closeButtons.forEach(button => {
            button.addEventListener("click", () => {
                const modal = button.closest(".modal");
                if (modal) this.closeModal(modal);
            });
        });
    }

    initEscapeKey() {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                const openModal = safeQuerySelector(".modal.show");
                if (openModal) this.closeModal(openModal);
            }
        });
    }

    initOutsideClick() {
        this.modals.forEach(modal => {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) this.closeModal(modal);
            });
        });
    }

    openModal(modal) {
        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        const closeButton = modal.querySelector(".modal-close");
        if (closeButton) closeButton.focus();
    }

    closeModal(modal) {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

// features/navigation.js
class NavigationManager {
    constructor() {
        this.header = safeQuerySelector("header");
        this.menuToggle = safeQuerySelector(".menu-toggle");
        this.navMenu = safeQuerySelector("nav ul");
        this.navLinks = safeQuerySelectorAll("nav ul li a");
    }

    init() {
        this.initMobileMenu();
        this.initScrollHeader();
        this.initSmoothScroll();
    }

    initMobileMenu() {
        if (this.menuToggle && this.navMenu) {
            this.menuToggle.addEventListener("click", () => this.toggleMenu());
            this.navLinks.forEach(link => {
                link.addEventListener("click", () => this.handleLinkClick());
            });
        }
    }

    initScrollHeader() {
        if (this.header) {
            window.addEventListener("scroll", debounce(() => {
                requestAnimationFrame(() => {
                    this.header.classList.toggle("scrolled", window.scrollY > 100);
                });
            }, 100));
        }
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener("click", (e) => this.handleSmoothScroll(e, link));
        });
    }

    toggleMenu() {
        const isExpanded = this.menuToggle.getAttribute("aria-expanded") === "true";
        this.menuToggle.setAttribute("aria-expanded", !isExpanded);
        this.navMenu.classList.toggle("show");
    }

    handleLinkClick() {
        if (window.innerWidth <= 768) {
            this.navMenu.classList.remove("show");
            this.menuToggle.setAttribute("aria-expanded", "false");
        }
    }

    handleSmoothScroll(e, link) {
        e.preventDefault();
        const targetId = link.getAttribute("href").slice(1);
        const target = document.getElementById(targetId);

        if (target) {
            target.scrollIntoView({
                behavior: "smooth"
            });
        }
    }
}

// features/theme.js
class ThemeManager {
    constructor() {
        this.themeToggle = safeQuerySelector("#theme-toggle");
        this.currentTheme = localStorage.getItem("theme") || "dark";
    }

    init() {
        if (!this.themeToggle) return;

        this.applyTheme();
        this.themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    applyTheme() {
        if (this.currentTheme === "light") {
            document.body.classList.add("light-theme");
            this.themeToggle.textContent = "🌙";
        } else {
            this.themeToggle.textContent = "☀️";
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
        document.body.classList.toggle("light-theme");
        localStorage.setItem("theme", this.currentTheme);
        this.themeToggle.textContent = this.currentTheme === "light" ? "🌙" : "☀️";
    }
}

// app.js - Inicialização da aplicação
document.addEventListener("DOMContentLoaded", () => {
    try {
        // Inicializa todos os gerenciadores
        const lazyLoader = new LazyLoader();
        const monumentManager = new MonumentManager();
        const animationManager = new AnimationManager();
        const modalManager = new ModalManager();
        const navigationManager = new NavigationManager();
        const themeManager = new ThemeManager();

        // Inicia todos os módulos
        lazyLoader.init();
        monumentManager.init();
        animationManager.init();
        modalManager.init();
        navigationManager.init();
        themeManager.init();

        // Ajuste de altura para mobile
        const updateVhVariable = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };

        updateVhVariable();
        window.addEventListener("resize", debounce(updateVhVariable, 100));

    } catch (error) {
        console.error("Erro na inicialização da aplicação:", error);
    }
});