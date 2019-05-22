/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Fabric smart contract classes
const { Contract, Context } = require('fabric-contract-api');

// PaperNet specifc classes
const Book = require('./book.js');
const BookList = require('./booklist.js');

/**
 * A custom context provides easy access to list of all books
 */
class BookStoreContext extends Context {

    constructor() {
        super();
        // All books are held in a list of books
        this.bookList = new BookList(this);
    }

}

/**
 * Define book store smart contract by extending Fabric Contract class
 *
 */
class BookStoreContract extends Contract {

    constructor() {
        // Unique name when multiple contracts per chaincode file
        super('org.papernet.bookstore');
    }

    /**
     * Define a custom context for the bookstore
    */
    createContext() {
        return new BookStoreContext();
    }

    /**
     * Instantiate to perform any setup of the ledger that might be required.
     * @param {Context} ctx the transaction context
     */
    async instantiate(ctx) {
        // No implementation required with this example
        // It could be where data migration is performed, if necessary
        console.log('Instantiate the book store contract');
    }

    /**
     * Publish a book
     *
     * @param {Context} ctx the transaction context
     * @param {String} isbn the ISBN for the book
     * @param {String} publisher book publisher
     * @param {String} title title of the book
     * @param {String} author author of the book
     * @param {Integer} cost the cost of purchasing the book
     * @param {String} content the book contents
     * @param {String} category the category the book belongs to
    */
    async publish(ctx, isbn, publisher, title, author, cost, content, category) {

        // get a hash of the book content, to ensure they are unique

        const hash = content; //TODO: get a hash and make sure there are no books already with this hash

        let bookKey = Book.makeKey([isbn]);
        let book;
        try{
            book = await ctx.bookList.getBook(bookKey);
        } catch(e) {}

        if(book != null){
            throw new Error('The book ' + isbn + ' already exists in the book store');
        }

        // create an instance of the book
        book = Book.createInstance(isbn, publisher, title, author, cost, content, category);

        // Smart contract, rather than book, moves book into PUBLISHED state
        book.setPublished();

        // Newly published book is owned by the publisher
        book.setOwner(publisher); //TODO: maybe try to get the credentials of the user and store that insteand?

        // Add the book to the list of all similar books in the ledger world state
        await ctx.bookList.addBook(book);

        // Must return a serialized book to caller of smart contract
        return book.toBuffer();
    }

    /**
     * Buy book
     *
     * @param {Context} ctx the transaction context
     * @param {String} isbn the ISBN for the book
    */
    async buy(ctx, isbn) {

        // the new owner will be the identity that requested the transaction
        const owner = ctx.clientIdentity.id;

        // Retrieve the book using key fields provided
        let bookKey = Book.makeKey([isbn]);
        let book = await ctx.bookList.getBook(bookKey);

        if(book == null){
            throw new Error('Book ' + isbn + ' does not exist');
        }

        // Validate that current owner is still the publisher
        if (book.getOwner() !== book.publisher) {
            throw new Error('Book ' + isbn + ' is not owned by the bookstore anymore');
        }

        // First buy moves state from PUBLISHED to SOLD
        if (book.isPublished()) {
            book.setSold();
        }

        // Check book is not already READ
        if (book.isSold()) {
            book.setOwner(owner);
        } else {
            throw new Error('Book ' + isbn + ' is not sold. Current state = ' + book.getCurrentState());
        }

        // Update the book
        await ctx.bookList.updateBook(book);
        // Don't return content yet
        book.content = "";
        return book.toBuffer();
    }

    /**
     * Read book (get it's contents)
     *
     * @param {Context} ctx the transaction context
     * @param {String} isbn the ISBN for the book
    */
    async read(ctx, isbn) {

        // we will check that the identity requesting the book is actually the one who purchased it
        const requester = ctx.clientIdentity.id;

        let bookKey = Book.makeKey([isbn]);

        let book = await ctx.bookList.getBook(bookKey);

        if(book == null){
            throw new Error('Book ' + isbn + ' does not exist');
        }

        // We could check here that the user cannot download it more than once
        // if (book.isRead()) {
        //     throw new Error('Book ' + isbn + ' has already been downloaded');
        // }

        // Verify that the requester owns the book before returning it
        if (book.getOwner() === requester) {
            book.setRead();
        } else {
            throw new Error('Requesting user does not own book' + isbn);
        }

        await ctx.bookList.updateBook(book);
        return book.toBuffer();
    }

}

module.exports = BookStoreContract;
