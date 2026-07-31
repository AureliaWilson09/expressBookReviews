const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    const userExists = users.some((user) => user.username === username);
  
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ username: username, password: password });
  
    return res.status(201).json({ message: "User successfully registered. Now you can login" });
});
  

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const response = await new Promise((resolve) => resolve({ data: books }));
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const bookDetails = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    });

    return res.status(200).json(bookDetails);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const authorParam = req.params.author.toLowerCase();

  try {
    const filteredBooks = await new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      let matches = [];

      keys.forEach((key) => {
        if (books[key].author.toLowerCase() === authorParam) {
          matches.push({ id: key, ...books[key] });
        }
      });

      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(new Error("No books found for this author"));
      }
    });

    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const titleParam = decodeURIComponent(req.params.title).replace(/\+/g, ' ').toLowerCase();

  try {
    const filteredBooks = await new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      let matches = [];

      keys.forEach((key) => {
        if (books[key].title.toLowerCase() === titleParam) {
          matches.push({ id: key, ...books[key] });
        }
      });

      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject(new Error("Book not found"));
      }
    });

    return res.status(200).json(filteredBooks);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
}); 

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; 
    const book = books[isbn];
  
    if (book) {
      
      return res.status(200).json(book.reviews); 
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });  

module.exports.general = public_users;
