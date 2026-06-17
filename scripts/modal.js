const Modal = {
    el: null,
    body: null,
    closeBtn: null,
    backdrop: null,
    previousActiveElement: null,

    init() {
        this.el = document.getElementById('event-modal');
        this.body = document.getElementById('modal-body');
        this.handle = this.el.querySelector('.modal-handle');
        this.backdrop = this.el.querySelector('.modal-backdrop');

        this.handle.addEventListener('click', () => this.close());
        this.handle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.close();
            }
        });
        this.backdrop.addEventListener('click', () => this.close());

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.el.classList.contains('active')) {
                this.close();
            }
        });
    },

    open(event) {
        this.previousActiveElement = document.activeElement;
        const locationName = event.location?.name || event.location?.city || 'Marseille';
        const address = event.location?.address || '';
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName + ' ' + address)}`;

        const relevantTiming = event.selectedTiming || (event.timings ? event.timings[0] : null);
        
        const date = relevantTiming
            ? new Date(relevantTiming.begin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Date à venir';

        const base = event.image?.base || '';
        const full = event.image?.variants?.find(v => v.type === 'full')?.filename || event.image?.filename;
        const placeholder = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';
        const imageUrl = full ? (base + full) : placeholder;

        const title = event.title?.fr || event.title || 'Sans titre';
        const description = event.longDescription?.fr || event.description?.fr || 'Pas de description disponible.';

        const img = new Image();
        img.onload = () => {
            this.body.innerHTML = `
                <img src="${imageUrl}" alt="${title}" class="modal-image">
                <h2>${title}</h2>
                <div class="modal-info">
                    <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="modal-map-link">
                        <span>${locationName}</span>
                    </a>
                    <span>${date}</span>
                </div>
                <div class="modal-description">${description}</div>
            `;

            this.el.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on handle for keyboard usability
            if (this.handle) {
                this.handle.focus();
            }

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const content = this.el.querySelector('.modal-content');
                    const backdrop = this.backdrop;

                    content.animate([
                        { transform: 'translateY(100%) translateZ(0)' },
                        { transform: 'translateY(0) translateZ(0)' }
                    ], {
                        duration: 350,
                        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                        fill: 'forwards'
                    });

                    backdrop.animate([
                        { opacity: 0 },
                        { opacity: 1 }
                    ], {
                        duration: 250,
                        fill: 'forwards'
                    });
                });
            });
        };

        img.onerror = () => img.onload();
        img.src = imageUrl;
    },

    close() {
        const content = this.el.querySelector('.modal-content');
        const backdrop = this.backdrop;

        const contentAnim = content.animate([
            { transform: 'translateY(0)' },
            { transform: 'translateY(100%)' }
        ], {
            duration: 300,
            easing: 'ease-in',
            fill: 'forwards'
        });

        backdrop.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], {
            duration: 250,
            fill: 'forwards'
        });

        contentAnim.onfinish = () => {
            this.el.classList.remove('active');
            document.body.style.overflow = '';
            if (this.previousActiveElement) {
                this.previousActiveElement.focus();
            }
        };
    }
};

document.addEventListener('DOMContentLoaded', () => Modal.init());
window.EventModal = Modal;
