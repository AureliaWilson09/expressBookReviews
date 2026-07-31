const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// --- INSCRIPTION ---
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Registration failed: Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: `Registration failed: Username "${username}" already exists` });
  }

  users.push({ username: username, password: password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// --- TASK 10 : Obtenir tous les livres (Async/Await) ---
public_users.get('/', async function (req, res) {
  try {
    const booksList = await new Promise((resolve, reject) => {
      if (books && Object.keys(books).length > 0) {
        resolve(books);
      } else {
        reject(new Error("The bookshop catalog is currently empty"));
      }
    });
    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// --- TASK 11 : Obtenir par ISBN (Uniformisé avec Async/Await et Try/Catch) ---
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const bookDetails = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error(`Book with ISBN code "${isbn}" could not be found`));
      }
    });
    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});
  
// --- TASK 12 : Obtenir par Auteur (Modèle Async/Await de référence) ---
public_users.get('/author/:author', async function (req, res) {
  const authorParam = decodeURIComponent(req.params.author).replace(/\+/g, ' ').toLowerCase();

  try {
    const filteredBooks = await new Promise((resolve, reject) => {
      const matches = Object.entries(books)
        .filter(([id, book]) => book.author.toLowerCase() === authorParam)
        .map(([id, book]) => ({ id, ...book }));

      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(new Error(`No books found in our store for the author: "${req.params.author}"`));
      }
    });
    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// --- TASK 13 : Obtenir par Titre (Uniformisé avec l'architecture de la Task 12) ---
public_users.get('/title/:title', async function (req, res) {
  const titleParam = decodeURIComponent(req.params.title).replace(/\+/g, ' ').toLowerCase();

  try {
    const filteredBooks = await new Promise((resolve, reject) => {
      const matches = Object.entries(books)
        .filter(([id, book]) => book.title.toLowerCase() === titleParam)
        .map(([id, book]) => ({ id, ...book }));

      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(new Error(`No books found in our catalog with the title: "${req.params.title}"`));
      }
    });
    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// --- RECUPERATION DES AVIS ---
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: `Cannot get reviews: Book with ISBN "${isbn}" does not exist` });
  }
});

module.exports = public_users;
