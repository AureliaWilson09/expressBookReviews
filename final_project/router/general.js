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
public_users.get('/isbn/:isbn', (req, res) =>{
    
    const ISBN = req.params.isbn;
    const booksBasedOnIsbn = (ISBN) => {
        return new Promise((resolve,reject) =>{
          setTimeout(() =>{
            const book = books.find((b) => b.isbn === ISBN);
            if(book){
              resolve(book);
            }else{
              reject(new Error("Book not found"));
            }},1000);
        });
         
    }
    booksBasedOnIsbn(ISB).then((book) =>{
      res.json(book);
    }).catch((err)=>{
      res.status(400).json({error:"Book not found"})
    });    
   
});
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const authorParam = req.params.author.toLowerCase();
    
    const getBooksByAuthor = () => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Safely convert object entries into a filtered array
                const filteredBooks = Object.values(books).filter(
                    book => book.author && book.author.toLowerCase() === authorParam
                );
                
                if (filteredBooks.length > 0) {
                    resolve(filteredBooks);
                } else {
                    reject({ status: 404, message: "Author not found" });
                }
            }, 1000);
        });
    };

    getBooksByAuthor()
        .then((matchingBooks) => {
            res.status(200).json(matchingBooks);
        })
        .catch((err) => {
            res.status(err.status || 500).json({ error: err.message || "An error occurred" });
        });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = decodeURIComponent(req.params.title).replace(/\+/g, ' ').toLowerCase();
    const booksKeys = Object.keys(books); 
    let filteredBooks = [];
  
    booksKeys.forEach((key) => {
      if (books[key].title.toLowerCase() === title) {
        filteredBooks.push({ id: key, ...books[key] });
      }
    });
  
    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });  

//  Get book review
// Obtenir les avis d'un livre basé sur l'ISBN (ID)
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn; // Récupère l'ID (ex: 1)
    const book = books[isbn];    // Trouve le livre dans votre liste
  
    if (book) {
      // Renvoie l'objet des avis (qui est {} actuellement)
      return res.status(200).json(book.reviews); 
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });  

module.exports.general = public_users;
