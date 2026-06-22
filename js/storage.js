console.log("STORAGE LOADED");

const STORAGE_KEY = 'book_tracker_app';
const DEMO_DATA_KEY = 'book_tracker_app_demo_seeded';

let booksCache = [];

function normalizeBooksArray(data) {
    if (!Array.isArray(data)) return [];
    return data.map(b => new Book(b));
}

function loadBooks() {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
        try {
            const data = JSON.parse(stored);
            booksCache = normalizeBooksArray(data);
        } catch (e) {
            booksCache = [];
        }
    }

    if (booksCache.length === 0 && !localStorage.getItem(DEMO_DATA_KEY)) {
        booksCache = [
            new Book({ title: 'Мастер и Маргарита', author: 'Булгаков', totalPages: 480, readPages: 120, status: 'reading', isFavorite: true }),
            new Book({ title: 'JavaScript для детей', author: 'Ник Морган', totalPages: 320, readPages: 320, status: 'completed' }),
            new Book({ title: 'Чистый код', author: 'Роберт Мартин', totalPages: 464, readPages: 0, status: 'postponed' })
        ];
        saveBooks();
        localStorage.setItem(DEMO_DATA_KEY, '1');
    }

    return booksCache;
}

function saveBooks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(booksCache.map(b => b.toJSON())));
}

function addBook(bookData) {
    const newBook = new Book(bookData);
    booksCache.push(newBook);
    saveBooks();
    return newBook;
}

function updateBook(id, updatedData) {
    const index = booksCache.findIndex(b => b.id == id);
    if (index === -1) return null;

    const oldBook = booksCache[index];
    const merged = new Book({ ...oldBook.toJSON(), ...updatedData, id: oldBook.id });

    if (merged.isCompleted) {
        merged.readPages = merged.totalPages;
        merged.status = 'completed';
    } else if (!['reading', 'completed', 'postponed'].includes(merged.status)) {
        merged.status = oldBook.status || 'reading';
    }

    booksCache[index] = merged;
    saveBooks();
    return merged;
}

function deleteBook(id) {
    const before = booksCache.length;
    booksCache = booksCache.filter(b => b.id != id);
    const deleted = booksCache.length < before;
    if (deleted) saveBooks();
    return deleted;
}

function getBookById(id) {
    return booksCache.find(b => b.id == id) || null;
}

function getAllBooks() {
    return [...booksCache];
}