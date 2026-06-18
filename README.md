# 📅 Massalive — Agenda d'Événements Dynamique

**Massalive** est une application web moderne et responsive qui permet d'explorer et de filtrer les événements culturels locaux en temps réel. L'application récupère ses données dynamiquement depuis l'API **OpenAgenda** (avec un système de repli sur données fictives en cas de problème réseau ou de clé API invalide).

---

## ✨ Fonctionnalités

- 🌗 **Thème Dynamique (Clair/Sombre) :** Basculement intuitif en cliquant sur le logo principal, avec persistance du choix utilisateur via `localStorage` et détection des préférences système.
- 📆 **Sélecteur de Date (Datepicker) Sur-Mesure :** Un calendrier interactif fluide permettant de naviguer jour par jour ou de sélectionner une date spécifique dans le mois pour filtrer les événements.
- 🏷️ **Filtres Thématiques :** Barre de catégories horizontale défilante (Concerts, Expositions, Spectacles, Cinéma, etc.) pour affiner rapidement la recherche.
- 📱 **Modal de Détails :** Fiche descriptive complète pour chaque événement (image haute résolution, description détaillée, date et lieu) animée avec des transitions fluides.
- 📍 **Intégration Cartographique :** Liens directs vers Google Maps pour situer les événements en un clic.
- 🚀 **Défilement Infini (Infinite Scroll) :** Chargement progressif et performant des événements au scroll grâce à l'API `IntersectionObserver`.
- 🔗 **Synchronisation URL :** L'état des filtres (catégorie, recherche, date) est directement reflété dans l'URL pour permettre le partage de liens vers des sélections spécifiques.
- ♿ **Accessibilité et SEO :** Utilisation de balises HTML5 sémantiques, gestion du focus clavier pour les éléments interactifs et attributs ARIA.

---

## 📂 Structure du Projet

Le projet est structuré de manière propre et modulaire :

```text
├── index.html          # Structure HTML principale de l'application
├── global.scss         # Point d'entrée principal pour la compilation SCSS
├── global.css          # Feuille de style compilée
├── global.css.map      # Fichier source map pour le débogage CSS
├── fonts/              # Polices locales du projet
├── scss/               # Modules de styles Sass
│   ├── _variables.scss # Palette de couleurs, typographie et breakpoints
│   ├── _mixins.scss    # Utilitaires Sass (scrollbars, flexbox, etc.)
│   ├── _base.scss      # Styles globaux, réinitialisations CSS et dark mode
│   ├── _layout.scss    # Layouts principaux (header, main, footer)
│   └── _components.scss# Styles des boutons, cartes, calendrier et modal
└── scripts/            # Logique JavaScript modulaire
    ├── theme.js        # Gestion du mode sombre / clair
    ├── filters.js      # Logique de navigation et d'application des filtres
    ├── datepicker.js   # Logique du calendrier personnalisé et sélecteur de date
    ├── modal.js        # Gestion de l'affichage dynamique et des animations de la modal
    └── events.js       # Récupération API, rendu des cartes, URL params et défilement infini
```

---

## 🛠️ Technologies Utilisées

- **HTML5** : Sémantique, SEO et accessibilité.
- **Sass (SCSS)** : Organisation modulaire des styles avec variables et mixins.
- **Vanilla JavaScript (ES6+)** : Manipulation du DOM, API Fetch, Intersection Observer, animations natives.
- **API OpenAgenda (v2)** : Source de données en temps réel pour l'agenda.

---

## 🚀 Installation et Démarrage

### 1. Cloner le projet
```bash
git clone <url-du-depot>
cd Villanova
```

### 2. Lancer l'application
Puisqu'il s'agit d'une application entièrement statique au niveau du client, vous pouvez simplement :
- Ouvrir le fichier `index.html` directement dans votre navigateur web.
- Ou utiliser une extension d'éditeur de code comme **Live Server** (VS Code) pour un rechargement automatique.
- Ou utiliser un serveur local léger via Node.js :
  ```bash
  npx serve .
  ```

### 3. Compilation des styles Sass (Facultatif)
Si vous souhaitez modifier les fichiers `.scss` dans le dossier `scss/`, vous devez recompiler le fichier `global.scss` vers `global.css`.
Assurez-vous d'avoir installé Sass globalement ou localement, puis lancez la commande suivante pour surveiller les changements :
```bash
sass --watch global.scss:global.css
```

---

## 🔑 Configuration de l'API OpenAgenda

Les paramètres de l'API sont configurés dans le fichier [events.js](file:///c:/Users/Hykoo/Documents/Laplateforme/Villanova/scripts/events.js) :

```javascript
const API_CONFIG = {
    AGENDA_UID: 'VOTRE_AGENDA_UID',
    BASE_URL: 'https://api.openagenda.com/v2/agendas/',
    API_KEY: 'VOTRE_CLE_API'
};
```
Si vous souhaitez connecter l'application à un autre agenda public, vous pouvez modifier l'identifiant de l'agenda (`AGENDA_UID`) et fournir votre propre clé API (`API_KEY`).
