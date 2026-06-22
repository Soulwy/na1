console.log("BOOKMODEL LOADED");

class Book {
    constructor({ id, title, author, totalPages, readPages = 0, status = 'reading', startDate = null, dailyGoal = null, isFavorite = false }) {
        this.id = id ?? Date.now();
        this.title = (title || '').trim();
        if (!this.title) {
    throw new Error('Название книги обязательно');
}
        this.author = author?.trim() || '';
        this.totalPages = Number(totalPages);
        this.readPages = Number(readPages);
        this.status = ['reading', 'completed', 'postponed'].includes(status) ? status : 'reading';
        this.startDate = startDate || new Date().toISOString().split('T')[0];
        this.dailyGoal = dailyGoal !== null && dailyGoal !== undefined && dailyGoal !== '' ? Number(dailyGoal) : null;
        this.isFavorite = Boolean(isFavorite);

        if (this.isCompleted) {
            this.readPages = this.totalPages;
            this.status = 'completed';
        } else {
            this.readPages = Math.min(Math.max(0, this.readPages), this.totalPages || 0);
        }
    }

    get progressPercent() {
        if (!this.totalPages || this.totalPages <= 0) return 0;
        return Math.min(100, Math.round((this.readPages / this.totalPages) * 100));
    }

    get isCompleted() {
        return this.totalPages > 0 && this.readPages >= this.totalPages;
    }

    updateReadPages(pages) {
        let newPages = Number(pages);
        if (Number.isNaN(newPages)) return false;

        if (!Number.isFinite(newPages)) return false;

        this.readPages = Math.min(Math.max(0, newPages), this.totalPages || 0);

        if (this.isCompleted) {
            this.status = 'completed';
            this.readPages = this.totalPages;
        } else if (this.status === 'completed') {
            this.status = 'reading';
        }

        return true;
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            totalPages: this.totalPages,
            readPages: this.readPages,
            status: this.status,
            startDate: this.startDate,
            dailyGoal: this.dailyGoal,
            isFavorite: this.isFavorite
        };
    }
}