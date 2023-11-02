import { useState } from 'react';
import { Navbar, Col, Alert, Button, Container, InputGroup, Form, Spinner, Row} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom' ;
import { BsFillDatabaseFill, BsPersonCircle, BsFillPencilFill, BsCheckLg } from "react-icons/bs";
import { RxCross2 } from "react-icons/rx"

function MakeNavbar(props){

  const navigate = useNavigate();

  const [editingTitle, setEditingTitle] = useState(false);

  const [title, setTitle] = useState(props.title);

  const [newTitle, setNewTitle] = useState();

  const [errTitle, setErrTitle] = useState(false);

  const [loading, setLoading] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleClick = () => {
    if(props.user){
      setLoggingOut(true);
      props.handleLogout().then(() => {
        setLoggingOut(false);
        navigate('/');
      }).catch();
    }
    else{
      navigate('/login');
    }
  }

  const handleNewTitle = (nt) => {
    if(nt!=""){
      setLoading(true);
      props.handleNewTitle(nt);
    }
    else{
      setErrTitle(true);
    }
  }

  return (<>
    <Navbar expand="sm" variant ="light" style={{backgroundColor:'blue'}}>
      <Container fluid>
        <Navbar.Brand className='d-flex align-items-center' style={{color: "black"}}><BsFillDatabaseFill size="15px"></BsFillDatabaseFill>{!editingTitle && title}{props.user && props.user.role=="Admin" && !editingTitle && <Button variant ="outline-primary" className="edit_title" onClick={()=>{setNewTitle(title); setEditingTitle(true);}}><BsFillPencilFill size="15px"/></Button>}</Navbar.Brand>
        {editingTitle && <Col className="d-flex flex-row">
          <InputGroup style={{maxWidth:"250px"}}>
            <Form.Control value={newTitle} onChange={(ev)=>{setNewTitle(ev.target.value)}} type="text"/>
            <Button className="manage_title" variant="outline-success" onClick={()=>{handleNewTitle(newTitle)}}>
              <BsCheckLg/>
            </Button>
            <Button className="manage_title" variant="outline-danger" onClick={()=>{(setEditingTitle(false))}}>
              <RxCross2></RxCross2>
            </Button>
          </InputGroup>
          {loading && <Spinner animation="border" variant="secondary"/>}
        </Col>}
        {loggingOut && <Spinner animation="border" variant="secondary"/>}
        <Col className="d-flex justify-content-end align-items-center">{props.user?<p style={{color:"red", marginBottom:"0", marginRight:"10px"}}>Role: {props.user.role}</p>:""}<Button style={{color:"white"}} variant="primary" className={(props.user?'logout_button':'login_button')} onClick={handleClick}><Row className='d-flex align-items-center'><Col><BsPersonCircle size="25px"/></Col><Col style={{paddingLeft:"0"}}>{props.user?(<>{props.user.name}</>):"Login"}</Col></Row></Button></Col>
      </Container>
    </Navbar>
    {props.errTitle && <Alert variant="danger" dismissible onClose={() => props.setErrTitle()}>{props.errTitle}</Alert>}
    <Alert style={{position:'fixed', width:"-webkit-fill-available", textAlign:"center", bottom:"0", marginBottom:"0"}}
      dismissible
      show={errTitle}
      onClose={() => setErrTitle(false)}
      variant="danger">
      {"Title cannot be empty"}
    </Alert>
    </>
  )
}

export {MakeNavbar};