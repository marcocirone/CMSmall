import {useEffect, useState} from 'react';
import { logIn, logOut, savePage, addNewPage, deletePage } from './API';
import { MakeNavbar } from './components/navbar';
import { MakeTable } from './components/table';
import { PageReader } from './components/reader';
import { EditPage } from './components/editor';
import { getAllPages, getPubPages, getInitialSettings, saveNewTitle } from "./API";
import dayjs from 'dayjs';

import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom' ;

import 'bootstrap/dist/css/bootstrap.min.css';
import { Login } from './components/login';


function App() {

  const [loggedIn, setLoggedIn] = useState(false);

  const [user, setUser] = useState();

  const [users, setUsers] = useState([]);

  const [images, setImages] = useState([]);

  const [title, setTitle] = useState();

  const [pages, setPages] = useState([]);

  const [readedPage, setReadedPage] = useState();

  const [editedPage, setEditedPage] = useState();

  const [editedBlocks, setEditedBlocks] = useState([]);

  const [submitted, setSubmmitted] = useState(false);

  const [errorMessage, setErrorMessage] = useState();

  const [errTitle, setErrTitle] = useState();

  const [loading, setLoading] = useState(false);

  const sortByDate = (a, b) => {
    if (a.publication_date==undefined){
      return 1;
    }
    if (b.publication_date==undefined){
      return -1;
    }
    return dayjs(b.publication_date).diff(dayjs(a.publication_date), 'days');
  }

  useEffect(() => {
    getInitialSettings().then((res) => {
      setUsers(res.users);
      setImages(res.images);
      setTitle(res.title);
    }).catch((err) => {setErrorMessage(err.message)});
  }, []);

  useEffect(() => {
    setLoading(true);
    if(loggedIn){
      getAllPages().then((p) => {setPages(p.sort(sortByDate)); setLoading(false);}).catch((err) => setErrorMessage(err.message));
    }
    else if(!loggedIn){
      getPubPages().then((p) => {setPages(p.sort(sortByDate)); setLoading(false);}).catch((err) => setErrorMessage(err.message));
    }
  }, [loggedIn]);

  useEffect(() => {
    if(submitted && loggedIn){
      setLoading(true);
      getAllPages().then((p) => {setPages(p.sort(sortByDate)); setLoading(false);}).catch((err) => setErrorMessage(err.message));
    }
    else if(submitted && !loggedIn){
      setLoading(true); 
      getPubPages().then((p) => {setPages(p.sort(sortByDate)); setLoading(false);}).catch((err) => setErrorMessage(err.message));
    }
    setSubmmitted(false);
  }, [submitted]);

  const handleNewTitle = async (newTitle) => {
    saveNewTitle(newTitle).then((res)=>{setTitle(newTitle)}).catch((err) => setErrTitle(err.message));
  }

  const handleLogin = async (credentials) => {
    logIn(credentials).then((user) => {
      setPages([]);  //to trigger the loading screen
      setUser(user);
      setLoggedIn(true);
      setErrorMessage();
    }).catch((err) => {setErrorMessage(err.message)});
  };

  const handleLogout = async () => {
    await logOut().then((res) => {
      setPages([]);
      setUser(null);
      setLoggedIn(false);
    }).catch((err) => {setErrTitle(err.message); throw err;});
  }

  const handleRead = (id) => {
    setReadedPage(pages.filter((p) => {return p.id==id})[0]);
  }
  
  const handleEdit = (id) => {
    const page = pages.filter((p) => {return p.id==id})[0];
    if(!page.publication_date){
      page.publication_date="";
    }
    setEditedPage(page);
  };

  const handleAdd = () => {
    setEditedPage({
      id: Math.max(...pages.map((p) => p.id)) + 1,
      title: "",
      author: user.name,
      creation_date: dayjs().format("YYYY-MM-DD"),
      publication_date: "",
      userid: user.id
    })
  }

  const handleChangePage = async (res) => {
    savePage(res).then(() => {
      setSubmmitted(true);
    }).catch((err) => {setErrorMessage(err.message);});;
  }

  const handleCreatePage = async (res) => {
    addNewPage(res).then(() => {
      setSubmmitted(true);
    }).catch((err) => {setErrorMessage(err.message);});
  }

  const handleDeletePage = (id) => {
    setLoading(true);
    deletePage(id).then((r) => {
      setPages((old) => old.filter((p) => p.id != id)); setLoading(false);
    }).catch((err) => {setErrorMessage(err.message); setLoading(false)});
  }

  function Layout(){
    return <>
    <MakeNavbar user={user} handleLogout={handleLogout} title={title} handleNewTitle={handleNewTitle} errTitle={errTitle} setErrTitle={setErrTitle}/>
    <Outlet/>
    </>
  }

  return <BrowserRouter>
    <Routes>
      <Route element={<Layout/>}>
        <Route index element={<MakeTable loc="front-office" user={user} pages={pages.filter((p) => (p.publication_date && dayjs(p.publication_date).diff(dayjs())<=0))} handleRead={handleRead} handleEdit={handleEdit} handleAdd={handleAdd} handleDelete={handleDeletePage} errorMessage={errorMessage} loading={loading}/>}/>
        <Route element={<MakeTable loc="back-office" user={user} pages={pages} handleRead={handleRead} handleEdit={handleEdit} handleAdd={handleAdd} handleDelete={handleDeletePage} errorMessage={errorMessage} loading={loading}/>} path="/back_office"/>
        <Route element={<PageReader page={readedPage} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>} path='/page/:id'/>
        <Route element={submitted?<Navigate replace to="/back_office"/>:<EditPage mode={"edit"} page={editedPage} user={user} users={[...users]} images={[...images]} handleSave={handleChangePage} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>} path='/edit_page/:id'/>
        <Route element={submitted?<Navigate replace to="/back_office"/>:<EditPage mode={"add"} user={user} users={[...users]} images={[...images]} page={editedPage} handleSave={handleCreatePage} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>} path='/add_page/:id'/>
        <Route element={user?<Navigate replace to="/"/>:<Login handleLogin={handleLogin} errorMessage={errorMessage} setErrorMessage={setErrorMessage}/>} path='/login'/>
      </Route>
    </Routes>
  </BrowserRouter>
}

export default App
