const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const axios = require('axios'); 

const BASE_URL = "http://localhost:5000";


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


public_users.get('/', async function (req, res) {
  try {
   
    const response = await axios.get(`${BASE_URL}/books-internal-data`);
    return res.status(200).json(response.data);
  } catch (error) {
    // Si Axios échoue, on bascule de manière sécurisée sur les données locales
    return res.status(200).json(books);
  }
});


public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    if (books[isbn]) {
      return res.status(200).json(books[isbn]);
    }
    return res.status(404).json({ message: `Book with ISBN code "${isbn}" could not be found` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
  

public_users.get('/author/:author', async function (req, res) {
  const authorParam = decodeURIComponent(req.params.author).replace(/\+/g, ' ').toLowerCase();

  try {
    
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;

    const matches = Object.entries(allBooks)
      .filter(([id, book]) => book.author.toLowerCase() === authorParam)
      .map(([id, book]) => ({ id, ...book }));

    if (matches.length > 0) {
      return res.status(200).json(matches);
    } else {
      return res.status(404).json({ message: `No books found in our store for the author: "${req.params.author}"` });
    }
  } catch (error) {
    
    const matches = Object.entries(books)
      .filter(([id, book]) => book.author.toLowerCase() === authorParam)
      .map(([id, book]) => ({ id, ...book }));
      
    if (matches.length > 0) {
      return res.status(200).json(matches);
    }
    return res.status(404).json({ message: error.message });
  }
});


public_users.get('/title/:title', async function (req, res) {
  const titleParam = decodeURIComponent(req.params.title).replace(/\+/g, ' ').toLowerCase();

  try {
    
    const response = await axios.get(`${BASE_URL}/`);
    const allBooks = response.data;

    const matches = Object.entries(allBooks)
      .filter(([id, book]) => book.title.toLowerCase() === titleParam)
      .map(([id, book]) => ({ id, ...book }));

    if (matches.length > 0) {
      return res.status(200).json(matches);
    } else {
      return res.status(404).json({ message: `No books found in our catalog with the title: "${req.params.title}"` });
    }
  } catch (error) {
    // Mode de secours
    const matches = Object.entries(books)
      .filter(([id, book]) => book.title.toLowerCase() === titleParam)
      .map(([id, book]) => ({ id, ...book }));

    if (matches.length > 0) {
      return res.status(200).json(matches);
    }
    return res.status(404).json({ message: error.message });
  }
});


public_users.get('/books-internal-data', (req, res) => {
  return res.status(200).json(books);
});


public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: `Cannot get reviews: Book with ISBN "${isbn}" does not exist` });
  }
});

module.exports = public_users;
