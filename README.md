🎮 Retro Game Vault
📌 Project Overview

Retro Game Vault is a web-based application that allows users to search and explore both classic and modern video games. It provides an intuitive interface to discover games, view details, and manage a personalized wishlist — all powered by a public gaming API.

The main goal of this project is to create a fast, responsive, and visually engaging game search engine while implementing real-world frontend concepts like API integration, state management, and performance optimization.

🚀 Purpose

This project is designed to:

Help users discover video games across different platforms
Provide detailed information such as ratings, genres, and release dates
Allow users to save their favorite games locally (without login)
Practice modern web development skills using APIs and dynamic UI
🌐 API Used

This project uses the RAWG Video Games Database API:

👉 https://rawg.io/apidocs

The API provides:

Game search functionality
Game details (ratings, platforms, release dates, etc.)
Images and metadata for thousands of games


✨ Features
🔍 Game Search (with Debounce)
Real-time search for games
Debounce logic to reduce unnecessary API calls and improve performance
🎮 Platform Filtering
Filter games by platform:
PC
PlayStation
Xbox
Nintendo
Makes it easier to narrow down results


⭐ Favorites / Wishlist
Add games to a wishlist
Stored in browser using localStorage
Persistent even after page refresh
📊 Compare Mode (Challenge Feature)
Select two games
View their details side-by-side
Compare:
Ratings
Release dates
Platforms
Genres


🧱 UI Design
Grid layout for displaying games
Large game cover images (box art)
Star-based rating system
Sidebar for favorites


🛠️ Technologies Used
HTML5
CSS3
JavaScript (Vanilla or React)
RAWG API
LocalStorage (for wishlist feature)
