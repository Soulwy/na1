console.log("APP LOADED");

document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    applyFiltersAndRender();
    updateStats();

    initTheme();
    initEvents();
});

function initTheme() {
    
    document
    .getElementById('searchBook')
    ?.addEventListener('input', applyFiltersAndRender);
    const themeToggle = document.getElementById('themeToggle');

    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        const isDark = document.body.classList.contains('dark-mode');

        themeToggle.textContent = isDark ? '☀️' : '🌙';

        localStorage.setItem(
            'theme',
            isDark ? 'dark' : 'light'
        );
    });
}

function initEvents() {

    document
        .getElementById('addBookBtn')
        .addEventListener('click', () => openEditModal());

    document
        .getElementById('fabBtn')
        .addEventListener('click', () => openEditModal());

    document
        .querySelector('.close')
        .addEventListener('click', closeModal);

    document
        .getElementById('cancelBtn')
        .addEventListener('click', closeModal);

    document
        .getElementById('bookForm')
        .addEventListener('submit', (e) => {
            e.preventDefault();
            saveBookFromForm();
        });

    document
        .getElementById('filterStatus')
        .addEventListener('change', applyFiltersAndRender);

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('bookModal');

        if (e.target === modal) {
            closeModal();
        }
    });
}