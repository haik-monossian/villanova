const API_CONFIG = {
    AGENDA_UID: '4674458',
    BASE_URL: 'https://api.openagenda.com/v2/agendas/',
    API_KEY: '02fd6da5b4064a98a2e02769d0862703'
};

const PAGE_SIZE = 18;
let currentItemsDisplayed = 0;
let filteredEvents = [];

async function fetchEvents() {
    try {
        const url = new URL(`${API_CONFIG.BASE_URL}${API_CONFIG.AGENDA_UID}/events`);
        url.searchParams.append('key', API_CONFIG.API_KEY);
        url.searchParams.append('relative[0]', 'current');
        url.searchParams.append('relative[1]', 'upcoming');
        url.searchParams.append('detailed', '1');
        url.searchParams.append('size', '300');

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error("Failed to fetch events:", error);
        return getMockEvents();
    }
}

function createEventCard(event) {
    const article = document.createElement('article');
    article.className = 'event';
    article.setAttribute('role', 'listitem');

    const timing = event.selectedTiming || event.firstTiming || (event.timings && event.timings[0]);
    const startDate = timing
        ? new Date(timing.begin || timing.start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Date à venir';

    const location = event.location ? (event.location.name || event.location.city || 'Marseille') : 'Lieu non spécifié';
    const title = event.title?.fr || event.title || 'Sans titre';
    const description = event.longDescription?.fr || event.description?.fr || event.description || 'Pas de description disponible.';

    const mapUrl = event.location
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.name + ' ' + event.location.address)}`
        : '#';

    let imageHtml = '';
    const placeholder = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80';

    if (event.image) {
        const base = event.image.base || '';
        const full = event.image.variants?.find(v => v.type === 'full')?.filename || event.image.filename;
        const thumb = event.image.variants?.find(v => v.type === 'thumbnail')?.filename || full;

        imageHtml = `
            <picture>
                <source media="(max-width: 600px)" srcset="${base}${thumb}">
                <img src="${base}${full}" alt="${title}" loading="lazy" class="event-image">
            </picture>
        `;
    } else {
        imageHtml = `<img src="${placeholder}" alt="${title}" loading="lazy" class="event-image">`;
    }

    const keywords = event.keywords?.fr || [];
    const keywordPills = keywords.slice(0, 2).map(k => `<p>${k}</p>`).join('');

    article.innerHTML = `
        ${imageHtml}
        <div class="event-data">
            <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="event-map-link">
                <p>${location}</p>
            </a>
            <p>${startDate}</p>
            ${keywordPills}
        </div>
        <div class="event-text">
            <h3>${title}</h3>
            <p>${description}</p>
        </div>
    `;

    article.addEventListener('click', (e) => {
        if (e.target.closest('.event-map-link')) return;
        if (window.EventModal) window.EventModal.open(event);
    });

    return article;
}

window.renderEvents = function(events, append = false) {
    const container = document.getElementById('events-section');
    if (!container) return;

    if (!append) {
        container.innerHTML = '';
        currentItemsDisplayed = 0;
        filteredEvents = events;
    }

    if (filteredEvents.length === 0) {
        if (!append) container.innerHTML = '<p class="no-events">Aucun événement trouvé pour cette sélection.</p>';
        return;
    }

    const nextBatch = filteredEvents.slice(currentItemsDisplayed, currentItemsDisplayed + PAGE_SIZE);
    
    nextBatch.forEach(event => {
        const card = createEventCard(event);
        container.appendChild(card);
    });

    currentItemsDisplayed += nextBatch.length;
}

function setupInfiniteScroll() {
    const sentinel = document.getElementById('scroll-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            if (currentItemsDisplayed < filteredEvents.length) {
                window.renderEvents(filteredEvents, true);
            }
        }
    }, {
        rootMargin: '200px'
    });

    observer.observe(sentinel);
}

const urlParams = new URLSearchParams(window.location.search);
const initialDateStr = urlParams.get('date');
let initialDate = null;
if (initialDateStr) {
    const parts = initialDateStr.split('-');
    if (parts.length === 3) initialDate = new Date(parts[0], parts[1] - 1, parts[2]);
}

window.currentFilterState = {
    category: urlParams.get('category') || 'all',
    search: urlParams.get('search') || '',
    date: initialDate
};

window.updateURL = function() {
    const params = new URLSearchParams(window.location.search);
    if (window.currentFilterState.category === 'all') params.delete('category');
    else params.set('category', window.currentFilterState.category);
    
    if (window.currentFilterState.date) params.set('date', formatDate(window.currentFilterState.date));
    else params.delete('date');
    
    if (window.currentFilterState.search) params.set('search', window.currentFilterState.search);
    else params.delete('search');
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
};

window.applyAllFilters = function() {
    if (typeof window.updateURL === 'function') window.updateURL();
    if (!window.allFetchedEvents || window.allFetchedEvents.length === 0) return;

    const { category, search, date } = window.currentFilterState;
    const selectedDateStr = date ? formatDate(date) : null;

    const filtered = window.allFetchedEvents.filter(event => {
        if (selectedDateStr) {
            const matchingTiming = (event.timings || []).find(t => {
                const d = new Date(t.begin || t.start);
                return formatDate(d) === selectedDateStr;
            });
            if (!matchingTiming) return false;
            event.selectedTiming = matchingTiming;
        } else {
            event.selectedTiming = (event.timings && event.timings.length > 0) ? event.timings[0] : null;
        }

        if (category && category !== 'all') {
            const cleanCat = category.toLowerCase().replace(/s$/, '');
            const title = (event.title?.fr || event.title || '').toLowerCase();
            const desc = (event.description?.fr || '').toLowerCase();
            const longDesc = (event.longDescription?.fr || '').toLowerCase();
            if (!(title.includes(cleanCat) || desc.includes(cleanCat) || longDesc.includes(cleanCat))) return false;
        }

        if (search) {
            const s = search.toLowerCase();
            const title = (event.title?.fr || event.title || '').toLowerCase();
            const desc = (event.description?.fr || '').toLowerCase();
            if (!(title.includes(s) || desc.includes(s))) return false;
        }

        return true;
    });

    window.renderEvents(filtered);
};

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

async function init() {
    const events = await fetchEvents();
    window.allFetchedEvents = events;
    
    if (window.DatePicker) {
        window.DatePicker.setEvents(events);
        window.DatePicker.updateDisplay();
    }
    
    if (window.Filters) {
        window.Filters.init(events);
    }

    setupInfiniteScroll();
    window.applyAllFilters();
}

function getMockEvents() {
    return [
        {
            title: { fr: "Concert de Jazz au Pharo" },
            description: { fr: "Une soirée exceptionnelle face à la mer avec les plus grands noms du jazz contemporain. Venez découvrir des mélodies envoûtantes dans un cadre idyllique." },
            location: { city: "13007 Marseille" },
            timings: [{ start: "2027-06-15T20:00:00Z" }],
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: { fr: "Exposition Art Moderne" },
            description: { fr: "Découvrez les oeuvres de jeunes artistes marseillais qui réinventent les codes de l'art urbain et numérique." },
            location: { city: "13002 Marseille" },
            timings: [{ start: "2027-06-20T10:00:00Z" }],
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: { fr: "Atelier Éco-conception" },
            description: { fr: "Apprenez les bases de l'éco-conception pour vos projets web et réduisez votre empreinte carbone numérique." },
            location: { city: "13005 Marseille" },
            timings: [{ start: "2027-06-22T14:00:00Z" }],
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80"
        }
    ];
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
