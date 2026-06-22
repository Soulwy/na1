console.log("UI LOADED");

function renderBooks(books) {
    const container = document.getElementById('booksList');
    if (!container) return;
    
    if (books.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Нет книг. Добавьте первую!</div>';
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card ${book.isFavorite ? 'favorite' : ''}" data-id="${book.id}">
            <div class="book-cover">${book.isFavorite ? '⭐' : '📚'}</div>
            <div class="book-info">
                <div class="book-title">
                    <span>${escapeHtml(book.title)}</span>
                </div>
                <div class="book-author">${escapeHtml(book.author) || 'Автор не указан'}</div>
                
                <!-- ТРИ КНОПКИ СТАТУСА В РЯД -->
                <div class="status-buttons-group">
                    <button class="status-btn ${book.status === 'reading' ? 'active' : ''}" 
                            data-status="reading" data-id="${book.id}">
                        📖 Читаю
                    </button>
                    <button class="status-btn ${book.status === 'completed' ? 'active' : ''}" 
                            data-status="completed" data-id="${book.id}">
                        ✅ Прочитано
                    </button>
                    <button class="status-btn ${book.status === 'postponed' ? 'active' : ''}" 
                            data-status="postponed" data-id="${book.id}">
                        ⏸ Отложено
                    </button>
                </div>
                
                <div class="progress-bar-container">
                    <div class="progress-fill" style="width: ${book.progressPercent}%"></div>
                </div>
                <div class="book-stats">
                    <span>📄 ${book.readPages}/${book.totalPages} стр.</span>
                    <span>📊 ${book.progressPercent}%</span>
                </div>
                ${book.dailyGoal ? `<div class="book-stats"><span>🎯 ${book.dailyGoal} стр./день</span></div>` : ''}
                
                <!-- МЕНЮ ⋮ -->
                <div class="book-actions-menu">
                    <button class="menu-dots-btn" data-menu-id="${book.id}">⋮</button>
                    <div class="dropdown-actions" id="dropdown-${book.id}">
                        <button class="edit-book" data-id="${book.id}">✏️ Редактировать</button>
                        <button class="delete-book" data-id="${book.id}">🗑 Удалить</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    attachStatusButtons();
    attachMenuButtons();
    attachEditDeleteButtons();
}

function attachStatusButtons() {
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.removeEventListener('click', handleStatusClick);
        btn.addEventListener('click', handleStatusClick);
    });
}

function handleStatusClick(e) {
    e.stopPropagation();

    const bookId = Number(e.currentTarget.dataset.id);
    const newStatus = e.currentTarget.dataset.status;

    const book = getBookById(bookId);

    if (!book) return;

    if (newStatus === 'completed') {
        updateBook(bookId, {
            status: 'completed',
            readPages: book.totalPages
        });
    } else {
        updateBook(bookId, {
            status: newStatus
        });
    }

    applyFiltersAndRender();
    updateStats();
}

function attachMenuButtons() {
    document.querySelectorAll('.menu-dots-btn').forEach(btn => {
        btn.removeEventListener('click', handleMenuClick);
        btn.addEventListener('click', handleMenuClick);
    });
}

function handleMenuClick(e) {
    e.stopPropagation();
    const bookId = e.currentTarget.dataset.menuId;
    
    document.querySelectorAll('.dropdown-actions').forEach(menu => {
        if (menu.id !== `dropdown-${bookId}`) {
            menu.classList.remove('show');
        }
    });
    
    const menu = document.getElementById(`dropdown-${bookId}`);
    menu.classList.toggle('show');
}

document.addEventListener('click', function closeAllMenus(e) {
    if (!e.target.closest('.book-actions-menu')) {
        document.querySelectorAll('.dropdown-actions').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

function attachEditDeleteButtons() {
    document.querySelectorAll('.edit-book').forEach(btn => {
        btn.removeEventListener('click', handleEditClick);
        btn.addEventListener('click', handleEditClick);
    });
    
    document.querySelectorAll('.delete-book').forEach(btn => {
        btn.removeEventListener('click', handleDeleteClick);
        btn.addEventListener('click', handleDeleteClick);
    });
}

function handleEditClick(e) {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    openEditModal(id);
    document.getElementById(`dropdown-${id}`)?.classList.remove('show');
}

function handleDeleteClick(e) {
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    if (confirm('Удалить книгу?')) {
        deleteBook(id);
        applyFiltersAndRender();
        updateStats();
    }
    document.getElementById(`dropdown-${id}`)?.classList.remove('show');
}

function updateStats() {
    const books = getAllBooks();
    const total = books.length;
    const completed = books.filter(b => b.status === 'completed' || b.readPages >= b.totalPages).length;
    const avgProgress = total === 0 ? 0 : Math.round(books.reduce((sum, b) => sum + b.progressPercent, 0) / total);
    
    const readingBooks = books.filter(b => b.status === 'reading' && b.startDate);
    let avgSpeed = '—';
    if (readingBooks.length) {
        const today = new Date();
        let totalSpeed = 0;
        let count = 0;
        readingBooks.forEach(book => {
            if (book.startDate && book.readPages > 0) {
                const start = new Date(book.startDate);
                const days = Math.max(1, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
                const speed = book.readPages / days;
                totalSpeed += speed;
                count++;
            }
        });
        if (count > 0) avgSpeed = Math.round(totalSpeed / count) + ' стр/день';
    }

    const totalEl = document.getElementById('totalBooks');
    const completedEl = document.getElementById('completedBooks');
    const progressEl = document.getElementById('progressPercent');
    const speedEl = document.getElementById('avgSpeed');
    
    if (totalEl) totalEl.innerText = total;
    if (completedEl) completedEl.innerText = completed;
    if (progressEl) progressEl.innerText = avgProgress + '%';
    if (speedEl) speedEl.innerText = avgSpeed;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

let currentEditId = null;

function openEditModal(bookId = null) {
    const modal = document.getElementById('bookModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (bookId) {
        const book = getBookById(bookId);
        if (book) {
            currentEditId = bookId;
            modalTitle.innerText = 'Редактировать книгу';
            document.getElementById('bookId').value = book.id;
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author || '';
            document.getElementById('totalPages').value = book.totalPages;
            document.getElementById('readPages').value = book.readPages;
            document.getElementById('status').value = book.status;
            document.getElementById('startDate').value = book.startDate || '';
            document.getElementById('dailyGoal').value = book.dailyGoal || '';
            document.getElementById('isFavorite').checked = book.isFavorite;
        }
    } else {
        currentEditId = null;
        modalTitle.innerText = 'Добавить книгу';
        document.getElementById('bookForm').reset();
        document.getElementById('bookId').value = '';
        document.getElementById('status').value = 'reading';
        document.getElementById('startDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('readPages').value = 0;
        document.getElementById('isFavorite').checked = false;
    }
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('bookModal').style.display = 'none';
    currentEditId = null;
}

function saveBookFromForm() {
    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        totalPages: parseInt(document.getElementById('totalPages').value),
        readPages: parseInt(document.getElementById('readPages').value) || 0,
        status: document.getElementById('status').value,
        startDate: document.getElementById('startDate').value,
        dailyGoal: document.getElementById('dailyGoal').value ? parseInt(document.getElementById('dailyGoal').value) : null,
        isFavorite: document.getElementById('isFavorite').checked
    };
    
    if (!bookData.title || !bookData.totalPages) {
        alert('Заполните название и количество страниц');
        return false;
    }
    
    if (currentEditId) {
        updateBook(currentEditId, bookData);
    } else {
        addBook(bookData);
    }
    closeModal();
    applyFiltersAndRender();
    updateStats();
    return true;
}

function applyFiltersAndRender() {

    const filter =
        document.getElementById('filterStatus').value;

    const search =
        document.getElementById('searchBook')
        ?.value
        .toLowerCase() || '';

    let books = getAllBooks();

    if (filter !== 'all') {
        books = books.filter(
            b => b.status === filter
        );
    }

    if (search) {
        books = books.filter(book =>
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search)
        );
    }

    renderBooks(books);
}