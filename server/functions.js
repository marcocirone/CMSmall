'use strict';

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('CMS.sqlite', (err) => {
  if (err) throw err;
});

const crypto = require('crypto');

//get user by email and password
exports.getUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email=?';
        db.get(sql, [email], (err, row) => {
            if(err){
                reject(err);
            }
            else if(row === undefined){
                resolve(false);
            }
            else{
                const user = {id: row.id, username: row.email, name: row.name, role: row.role};

                crypto.scrypt(password, row.salt, 32, function(err, hashedPassword){
                    if(err) reject(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
                        resolve(false);
                    else{
                        resolve(user);
                    }
                });
            }
        });
    });
}

exports.getUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, name FROM users';
        db.all(sql, [], (err, rows) => {
            if(err){
                reject(err);
            }
            else{
                const users = rows.map((u) => {
                    return {
                        id: u.id,
                        name: u.name
                    };
                });
                resolve(users);
            }
        });
    });
}

exports.getImages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM images";
        db.all(sql, [], (err, rows) => {
            if(err){
                reject(err);
            }
            else{
                const images = rows.map((i) => {
                    return {
                        id: i.id,
                        name: i.name
                    }
                });
                resolve(images);
            }
        });
    });
}

exports.getTitle = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM settings WHERE setting='title'";
        db.get(sql, [], (err, row) => {
            if(err){
                reject(err);
            }
            else{
                const res = row.value;
                resolve(res);
            }              
        });
    });
}

//get all the pages in the database
exports.getAllPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT pages.id, title, name, creation_date, publication_date, users.id AS userid FROM pages, users WHERE pages.author=users.id";
        db.all(sql, (err, rows) => {
            if(err){
                reject(err);
            }
            const pages = rows.map((p) => {
                return {
                    id: p.id,
                    title: p.title,
                    author: p.name,
                    creation_date: p.creation_date,
                    publication_date: p.publication_date,
                    userid: p.userid
                };
            });
            resolve(pages);
        });
    });
}

//get only the pages that have been published
exports.getPublishedPages = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT pages.id, title, name, creation_date, publication_date, users.id AS userid FROM pages, users WHERE pages.author = users.id AND publication_date IS NOT NULL AND publication_date <= date('now')";
        db.all(sql, (err, rows) => {
            if(err){
                reject(err);
            }
            const pages = rows.map((p) => {
                return {
                    id: p.id,
                    title: p.title,
                    author: p.name,
                    creation_date: p.creation_date,
                    publication_date: p.publication_date,
                    userid: p.userid
                };
            });
            resolve(pages);
        });
    });
}

//get the content of a specific page by its ID
exports.getPageContent = (pageID) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM blocks WHERE pageID=?";
        db.all(sql, [pageID], (err, rows) => {
            if(err){
                reject(err);
            }
            const blocks = rows.map((b) => {
                return {
                    id: b.id,
                    type: b.type,
                    internal: b.internal,
                    pageID: b.pageID,
                    position: b.position
                }
            });
            resolve(blocks);
        });
    });
}

exports.savePageInfo = (page) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE pages SET title=?, author=?, creation_date=?, publication_date=? WHERE id=?";
        const params = [page.title, page.userid, page.creation_date, page.publication_date==""?null:page.publication_date, page.id];
        db.run(sql, params, (err)=>{
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.saveAddedBlocks = (added) => {
    return new Promise((resolve, reject) => {
        let sql = "INSERT INTO blocks(id, type, internal, pageID, position) VALUES ";
        const params = [];
        for(const a of added){
            sql += '(?,?,?,?,?),';

            params.push(a.id);
            params.push(a.type);
            params.push(a.internal);
            params.push(a.pageID);
            params.push(a.position);
        }
        sql = sql.slice(0, sql.length-1) + ";"

        db.run(sql, params, (err) => {
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.saveUpdatedBlocks = (updated) => {
    return new Promise((resolve, reject) => {
        let sql = "WITH updated(id, type, internal, pageID, position) AS ( VALUES";
        const params = [];

        for(const u of updated){
            sql += '(?, ?, ?, ?, ?),'

            params.push(u.id);
            params.push(u.type);
            params.push(u.internal);
            params.push(u.pageID);
            params.push(u.position);
        }

        sql = sql.slice(0, sql.length-1) + ")UPDATE blocks SET type=updated.type, internal=updated.internal, pageID=updated.pageID, position=updated.position FROM updated WHERE blocks.id=updated.id;"

        db.run(sql, params, (err) => {
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.deleteBlocks = (deleted) => {
    return new Promise((resolve, reject) => {
        let sql = 'DELETE FROM blocks WHERE id IN (';
        const params = [];

        for (const d of deleted){
            sql += '?,'
            params.push(d.id);
        }

        sql = sql.slice(0, sql.length-1) + ')';

        db.run(sql, params, (err) => {
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.addPage = (page) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO pages(id, title, author, creation_date, publication_date) VALUES(?,?,?,?,?)';
        const params = [page.id, page.title, page.userid, page.creation_date, page.publication_date==""?null:page.publication_date];

        db.run(sql, params, (err) => {
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.deletePageBlocks = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM blocks WHERE pageID=?';

        db.run(sql, [id], (err) => {
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.deletePage = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM pages WHERE id=?';

        db.run(sql, [id], (err) => {
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.changeTitle = (title) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE settings SET value=? WHERE setting='title'";

        db.run(sql, [title], (err) => {
            if(err){
                reject(false);
            }
            else{
                resolve(true);
            }
        });
    });
}

exports.getPageInfo = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM pages WHERE id=?";
        db.get(sql, [id], (err, row) => {
            if(err){
                reject(err);
            }
            else{
                if(!row) resolve(undefined);
                const res = {
                    id: row.id,
                    title: row.title,
                    author: row.author,
                    creation_date: row.creation_date,
                    publication_date: row.publication_date
                };
                resolve(res);
            }
        });
    });
}