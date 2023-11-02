const APIURL = 'http://localhost:3001/api/';

const logIn = async (credentials) => {
    const response = await fetch(APIURL + 'sessions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
        body: JSON.stringify(credentials),
    }).catch((err) => {throw new Error("Cannot communicate with the server")});
    if(response.ok){
        const res = await response.json();
        return res;
    }
    else{
        const message = await response.json();
        throw new Error("Application Error: " + message.error);
    }
}

const logOut = async () => {
    const response = await fetch(APIURL + 'sessions/current', {
        method: 'DELETE',
        credentials: 'include'
    }).catch((err) => {throw new Error("Cannot communicate with the server")});
    if(response.ok){
        const res = await response.json();
        return res;
    }
    else{
        const message = await response.json();
        throw new Error("Application Error: " + message.error);
    }
}

const getAllPages = async () => {
    const response = await fetch(APIURL + 'pages', {
        credentials: 'include'
    }).catch((err) => {throw new Error("Cannot communicate with the server")});
    if(response.ok){
        const pages = await response.json();
        return pages;
    }
    else{
        const message = await response.json();
        throw new Error("Application Error: " + message.error);
    }
}

const getPubPages = async () => {
    const response = await fetch(APIURL + 'pubpages').catch((err) => {throw new Error("Cannot communicate with the server")});
    if(response.ok){
        const pages = await response.json();
        return pages;
    }
    else{
        const message = await response.json();
        throw new Error("Application Error: " + message);
    }
}

const getPageByID = async (id) => {
    const response = await fetch(APIURL + `pages/${id}`,{
        credentials: 'include',
    }).catch((err) => {throw new Error("Cannot communicate with the server")});
    if(response.ok){
        const blocks = await response.json();
        return blocks;
    }
    else{
        const message = await response.json();
        throw new Error("Application Error: " + message);
    }
}

const getInitialSettings = async () => {
    const response = await fetch(APIURL + 'settings').catch((err) => {throw new Error("Cannot communicate with the server")});
    if(response.ok){
        const res = await response.json();
        return res;
    }
    else{
        const message = await response.json();
        throw new Error("Application Error: " + message);
    }
}

const savePage = async (res) => {
    const response = await fetch(APIURL + 'page', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(res)
    }).catch((err) => {throw new Error("Cannot communicate with the server")});
    if(!response.ok){
        const message = await response.json();
        throw new Error("Application Error: " + message.error);
    }
}

const addNewPage = async (res) => {
    const response = await fetch(APIURL + 'page', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(res)
    }).catch((err) => {throw new Error("Cannot communicate with the server")});
    if(!response.ok){
        const message = await response.json();
        throw new Error("Application Error: " + message.error);
    }
}

const deletePage = async (id) => {
    const response = await fetch(APIURL + `page/${id}`, {
        method: 'DELETE',
        credentials: 'include'
    }).catch((err) => {throw new Error("Cannot communicate with the server")});;
    if(!response.ok){
        const message = await response.json();
        throw new Error("Application Error: " + message.error);
    }
};

const saveNewTitle = async (newTitle) => {
    const response = await fetch(APIURL + 'title', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({title: newTitle})
    }).catch((err) => {throw new Error("Cannot communicate with the server")});;
    if(!response.ok){
        const message = await response.json();
        throw new Error("Application Error: " + message.error);
    }
}

export { logIn, logOut, getAllPages, getPubPages, getPageByID, getInitialSettings, savePage, addNewPage, deletePage, saveNewTitle };