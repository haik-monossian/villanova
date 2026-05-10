const Filters = {
    init() {
        const filterButtons = document.querySelectorAll('.filter');
        const prevBtn = document.getElementById('filter-prev');
        const nextBtn = document.getElementById('filter-next');
        const section = document.getElementById('filter-section');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.applyFilter(button.textContent.trim());
            });
        });

        if (prevBtn && section) {
            prevBtn.addEventListener('click', () => {
                section.scrollBy({ left: -250, behavior: 'smooth' });
            });
        }

        if (nextBtn && section) {
            nextBtn.addEventListener('click', () => {
                section.scrollBy({ left: 250, behavior: 'smooth' });
            });
        }

        this.updateFilterButtons();
    },

    applyFilter(category) {
        let cleanCategory = category.toLowerCase().replace(/s$/, '');
        
        if (window.currentFilterState.category === cleanCategory) {
            window.currentFilterState.category = 'all';
        } else {
            window.currentFilterState.category = cleanCategory;
        }

        this.updateFilterButtons();
        
        if (window.applyAllFilters) {
            window.applyAllFilters();
        }
    },

    updateFilterButtons() {
        const buttons = document.querySelectorAll('.filter');
        const activeCat = window.currentFilterState.category;

        buttons.forEach(btn => {
            const btnText = btn.textContent.trim();
            const btnTextClean = btnText.toLowerCase().replace(/s$/, '');
            
            if (activeCat === btnTextClean && activeCat !== 'all') {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
};

window.Filters = Filters;
