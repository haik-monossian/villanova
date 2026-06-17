const _dpUrlParams = new URLSearchParams(window.location.search);
const _dpInitialDateStr = _dpUrlParams.get('date');
let _dpInitialDate = null;
if (_dpInitialDateStr) {
    const parts = _dpInitialDateStr.split('-');
    if (parts.length === 3) _dpInitialDate = new Date(parts[0], parts[1] - 1, parts[2]);
}
window.currentFilterState = window.currentFilterState || {
    category: _dpUrlParams.get('category') || 'all',
    search: _dpUrlParams.get('search') || '',
    date: _dpInitialDate
};

const DatePicker = {
    viewDate: new Date(),
    eventsByDay: {},

    init() {
        this.prevBtn = document.getElementById('prev-day');
        this.nextBtn = document.getElementById('next-day');
        this.displayDate = document.getElementById('display-date');
        this.dateContainer = document.getElementById('current-date-display');
        this.popup = document.getElementById('calendar-popup');
        this.resetBtn = document.getElementById('reset-date');

        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.changeDaySmart(-1));
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.changeDaySmart(1));
        if (this.dateContainer) {
            this.dateContainer.addEventListener('click', () => this.toggleCalendar());
            this.dateContainer.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleCalendar();
                }
            });
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                window.currentFilterState.date = null;
                this.updateDisplay();
                if (window.applyAllFilters) window.applyAllFilters();
            });
        }

        const calPrev = document.getElementById('cal-prev-month');
        const calNext = document.getElementById('cal-next-month');

        if (calPrev) calPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeMonth(-1);
        });
        if (calNext) calNext.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeMonth(1);
        });

        document.addEventListener('click', (e) => {
            if (this.popup && !this.popup.contains(e.target) && !this.dateContainer.contains(e.target)) {
                this.popup.classList.remove('active');
                if (this.dateContainer) {
                    this.dateContainer.setAttribute('aria-expanded', 'false');
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.popup && this.popup.classList.contains('active')) {
                this.popup.classList.remove('active');
                if (this.dateContainer) {
                    this.dateContainer.setAttribute('aria-expanded', 'false');
                    this.dateContainer.focus();
                }
            }
        });

        this.updateDisplay();
    },

    setEvents(events) {
        this.eventsByDay = {};
        events.forEach(event => {
            if (event.timings) {
                event.timings.forEach(timing => {
                    const d = new Date(timing.begin || timing.start);
                    const dateStr = this.formatDate(d);
                    if (!this.eventsByDay[dateStr]) this.eventsByDay[dateStr] = [];
                    this.eventsByDay[dateStr].push(event);
                });
            }
        });
        this.renderCalendar();
    },

    changeDaySmart(delta) {
        const activeDates = Object.keys(this.eventsByDay).sort();
        if (activeDates.length === 0) return;

        if (!window.currentFilterState.date) {
            window.currentFilterState.date = new Date();
        }

        const currentDateStr = this.formatDate(window.currentFilterState.date);

        let nextDateStr;
        if (delta > 0) {
            nextDateStr = activeDates.find(d => d > currentDateStr);
        } else {
            nextDateStr = [...activeDates].reverse().find(d => d < currentDateStr);
        }

        if (nextDateStr) {
            const parts = nextDateStr.split('-');
            window.currentFilterState.date = new Date(parts[0], parts[1] - 1, parts[2]);
            this.updateDisplay();
            if (window.applyAllFilters) window.applyAllFilters();
        }
    },

    changeDay(delta) {
        if (!window.currentFilterState.date) window.currentFilterState.date = new Date();
        window.currentFilterState.date.setDate(window.currentFilterState.date.getDate() + delta);
        this.updateDisplay();
        if (window.applyAllFilters) window.applyAllFilters();
    },

    changeMonth(delta) {
        this.viewDate.setDate(1);
        this.viewDate.setMonth(this.viewDate.getMonth() + delta);
        this.renderCalendar();
    },

    updateDisplay() {
        const today = new Date();
        const currentDate = window.currentFilterState.date;

        if (this.displayDate) {
            if (!currentDate) {
                this.displayDate.textContent = "Prochainement";
            } else if (currentDate.toDateString() === today.toDateString()) {
                this.displayDate.textContent = "Aujourd'hui";
            } else {
                this.displayDate.textContent = currentDate.toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
            }
        }

        if (this.resetBtn) {
            if (currentDate) {
                this.resetBtn.classList.add('visible');
            } else {
                this.resetBtn.classList.remove('visible');
            }
        }
    },

    toggleCalendar() {
        if (!this.popup) return;
        const isActive = this.popup.classList.toggle('active');
        if (this.dateContainer) {
            this.dateContainer.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        }
        if (isActive) {
            this.viewDate = new Date(window.currentFilterState.date || new Date());
            this.renderCalendar();
        }
    },

    renderCalendar() {
        const monthYear = document.getElementById('cal-month-year');
        const daysGrid = document.getElementById('calendar-days');
        if (!monthYear || !daysGrid) return;

        monthYear.textContent = this.viewDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        const year = this.viewDate.getFullYear();
        const month = this.viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
        daysGrid.innerHTML = '';

        for (let i = 0; i < startingDay; i++) {
            const div = document.createElement('div');
            daysGrid.appendChild(div);
        }

        const todayStr = this.formatDate(new Date());
        const selectedStr = window.currentFilterState.date ? this.formatDate(window.currentFilterState.date) : null;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.textContent = day;

            const hasEvents = this.eventsByDay[dateStr];
            if (hasEvents) {
                div.classList.add('has-events');
            } else {
                div.classList.add('disabled');
            }

            if (todayStr === dateStr) div.classList.add('today');
            if (selectedStr === dateStr) div.classList.add('selected');

            if (hasEvents) {
                div.setAttribute('tabindex', '0');
                div.setAttribute('role', 'button');
                
                const selectDate = () => {
                    if (selectedStr === dateStr) {
                        window.currentFilterState.date = null;
                    } else {
                        window.currentFilterState.date = new Date(year, month, day);
                    }
                    this.updateDisplay();
                    if (window.applyAllFilters) window.applyAllFilters();
                    this.popup.classList.remove('active');
                    if (this.dateContainer) {
                        this.dateContainer.setAttribute('aria-expanded', 'false');
                        this.dateContainer.focus();
                    }
                };

                div.addEventListener('click', selectDate);
                div.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectDate();
                    }
                });
            }

            daysGrid.appendChild(div);
        }
    },

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
};

DatePicker.init();
window.DatePicker = DatePicker;
