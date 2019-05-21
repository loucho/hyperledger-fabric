/*
SPDX-License-Identifier: Apache-2.0
*/

'use strict';

// Utility class for ledger state
const State = require('./../ledger-api/state.js');

// Enumerate book state values
const bookState = {
    PUBLISHED: 1,
    SOLD: 2,
    READ: 3
};

/**
 * Book class extends State class
 * Class will be used by application and smart contract to define a book
 */
class Book extends State {

    constructor(obj) {
        super(Book.getClass(), [obj.isbn]);
        Object.assign(this, obj);
    }

    /**
     * Basic getters and setters
    */

    getOwner() {
        return this.owner;
    }

    setOwner(newOwner) {
        this.owner = newOwner;
    }

    /**
     * Useful methods to encapsulate book states
     */
    setPublished() {
        this.currentState = bookState.PUBLISHED;
    }

    setSold() {
        this.currentState = bookState.SOLD;
    }

    setRead() {
        this.currentState = bookState.READ;
    }

    isPublished() {
        return this.currentState === bookState.PUBLISHED;
    }

    isSold() {
        return this.currentState === bookState.SOLD;
    }

    isRead() {
        return this.currentState === bookState.READ;
    }

    static fromBuffer(buffer) {
        return Book.deserialize(Buffer.from(JSON.parse(buffer)));
    }

    toBuffer() {
        return Buffer.from(JSON.stringify(this));
    }

    /**
     * Deserialize a state data to book
     * @param {Buffer} data to form back into the object
     */
    static deserialize(data) {
        return State.deserializeClass(data, Book);
    }

    /**
     * Factory method to create a commercial paper object
     */
    static createInstance(isbn, publisher, title, author, cost, content, category) {
        return new Book({ isbn, publisher, title, author, cost, content, category });
    }

    static getClass() {
        return 'org.papernet.book';
    }
}

module.exports = Book;
