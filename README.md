# Personal Portfolio – Frontend

This is the source code for my personal portfolio, a full-stack React application that showcases my work and serves as a playground for various web technologies.

Live Demo: https://dantecollazzi.com

![Portfolio Demo](demo.gif)

## Core Features

- Full-Featured Blog: Rich text editor (TinyMCE), protected admin routes for creating/editing posts, and dynamic SEO per article
- Interactive Games Collection: 2D/3D games built with Babylon.js, D3.js, and gesture-controlled demos with MediaPipe
- Developer Tools & Demos: 3D model viewers (Three.js), web terminal (XTerm.js), shader experiments
- User Authentication: Secure login/registration with Firebase Authentication and admin roles

## Tech Stack

- Frontend: React, JavaScript, HTML/CSS
- 3D/Graphics: Three.js, Babylon.js, D3.js
- Authentication: Firebase Authentication
- Key Libraries: MediaPipe, XTerm.js, TinyMCE, Puppeteer

## Project Structure

Key folders under `src/`:

- `components/juegos`: Individual game components
- `components/tools`: Developer tools and demos
- `components`: Core UI (Header, Blog, Home, etc.)
- `css`: Global stylesheets

## Getting Started

Prerequisites:

- Node.js v16+ and npm (or yarn)

Installation:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
npm install
```

Environment variables:

Create a `.env` in the project root and add your backend API URL:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Also provide your Firebase credentials in `src/config/firebase-config.js`.

Run the dev server:

```bash
npm start
```

The app will be available at http://localhost:3000

## Available Scripts

- `npm start`: Run in development mode
- `npm run build`: Build for production
- `npm test`: Run tests

## License

MIT – see `LICENSE` for details.
