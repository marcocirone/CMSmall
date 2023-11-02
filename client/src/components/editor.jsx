import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Col, Row, Button, Card, Form, Alert, Spinner } from "react-bootstrap";
import { BsTrashFill, BsArrowUp, BsArrowDown, BsFillPencilFill } from "react-icons/bs"
import { getPageByID } from "../API";
import dayjs from 'dayjs';

function EditPage(props){
    const navigate = useNavigate();

    const sortByOrder = (a, b) => {
        return a.position - b.position;
    }

    const {id} = useParams();

    const [blocks, setBlocks] = useState([]);

    const [initialBlocks, setInitialBlocks] = useState([]);

    const [loading, setLoading] = useState(true);

    const [dirty, setDirty] = useState(false);

    const [page, setPage] = useState(Object.assign({}, props.page));

    const [mode, setMode] = useState("view");

    const [editedBlock, setEditedBlock] = useState();

    const [err, setErr] = useState(false);
    
    const [cannotAdd, setCannotAdd] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const headers = blocks.filter((b) => b.type=="header").length;
        const otherBlocks = blocks.length - headers;

        if(page.title==""){
            setErr("Page title cannot be empty");
        }
        if(page.publication_date!="" && dayjs(page.publication_date).diff(dayjs(page.creation_date), "days")<0){
            setErr("Publication date cannot come before the creation date");
        }
        if(headers<=0 || otherBlocks<=0){
            setErr("You need at least one header and one paragraph");
        }

        if(page.title!="" && (page.publication_date=="" || dayjs(page.publication_date).diff(dayjs(page.creation_date), "days")>=0) && headers>0 && otherBlocks>0){
            setLoading(true);
            if(props.mode=="edit"){
                const added = blocks.filter((b) => !b.id);

                const updated = blocks.filter((b) => {
                    for(const a of initialBlocks){
                        if (a.id == b.id && (a.position != b.position || a.internal != b.internal)){
                            return true;
                        }
                    }
                    return false;
                });

                const deleted = initialBlocks.filter((b) => !blocks.map((a) => a.id).includes(b.id));

                const res = {
                    added: added,
                    updated: updated,
                    deleted: deleted,
                    page: page
                };
                await props.handleSave(res)
            }
            else {
                const res = {
                    added: blocks,
                    page: page
                };
                await props.handleSave(res);
            }
        }
    }

    useEffect(() => {
        if(props.mode=='edit'){
            getPageByID(id).then((b) => {
                setBlocks([...b.map((x)=>Object.assign({}, x)).sort(sortByOrder)]); 
                setInitialBlocks([...b.map((x)=>Object.assign({}, x)).sort(sortByOrder)]); 
                setLoading(false);
            }).catch((err) => {props.setErrorMessage(err.message)});
        }
        else{
            setLoading(false);
        }
    }, [])

    useEffect(() => {
        if(dirty){
            setBlocks(blocks.sort(sortByOrder));
        }
        setDirty(false);
    }, [dirty])

    const moveBlockUp = (pos) => {
        setBlocks(blocks.map((b) =>{ 
            if(b.position==pos){
                b.position=pos-1;
            }
            else if(b.position==pos-1){
                b.position=pos;
            }
            return b;
        }));
        setDirty(true);
    }

    const moveBlockDown = (pos) => {
        setBlocks(blocks.map((b) => { 
            if(b.position==pos){
                b.position=pos+1;
            }
            else if(b.position==pos+1){
                b.position=pos;
            }
            return b;
        }));
        setDirty(true);
    }

    const cancelBlock = (pos) => {
        const new_blocks = blocks.filter((b) => b.position != pos).map((b) => {
            if(b.position>pos){
                b.position = b.position - 1;
            }
            return b;
        });
        setBlocks(new_blocks);
    }

    return <>
        {props.errorMessage?
            <Alert variant="danger" style={{podition:"fixed", width:"-webkit-fill-available", textAlign:"center"}}>{props.errorMessage}</Alert>
        :
        loading?
        <Row className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}><Spinner animation="border" variant="secondary"/></Row>
        :
        <Row>
            <Col className="d-flex justify-content-center page_info" xs={4} >
                <Form style={{width:"80%"}}>
                    <Form.Group controlId="title">
                        <Form.Label className="fw-light"><h5>Title</h5></Form.Label>
                        <Form.Control type="text" name="title" value={page.title} onChange={(ev)=>{setPage((old)=>{return {
                            ...old,
                            title: ev.target.value
                        }})}}></Form.Control>
                    </Form.Group>
                    {(props.user && props.user.role=="Admin")?<Form.Group controlId="author">
                        <Form.Label className="fw-light"><h5>Author</h5></Form.Label>
                        <Form.Select name="author" value={page.author} onChange={(ev)=>{setPage((old)=>{return{
                            ...old,
                            author: ev.target.value,
                            userid: props.users.filter((u)=>u.name==ev.target.value).map((u)=>u.id)[0]
                        }})}}>
                            <option value={page.author} key={page.author}>{page.author}</option>
                            {props.users.filter((u)=>{return u.name!==page.author}).map((u, ind)=>
                                <option value={u.name} key={ind}>{u.name}</option>    
                            )}
                        </Form.Select>
                    </Form.Group>:<><h5>Author</h5><p>{page.author}</p></>}
                    <h5>Creation Date</h5><p>{page.creation_date}</p>
                    <Form.Group controlId="publication_date">
                        <Form.Label className="fw-light"><h5>Publication Date</h5></Form.Label>
                        <Form.Control type="date" name="publication_date" value={page.publication_date?page.publication_date:""} onChange={(ev)=>{setPage((old)=>{return{
                            ...old,
                            publication_date: ev.target.value
                        }})}}></Form.Control>
                    </Form.Group>
                </Form>
            </Col>
            <Col xs={8} style={{minHeight: "90vh"}}>
                <Form onSubmit={handleSubmit}>
                    {blocks.map((b, ind) => 
                        <Row className="d-flex align-items-center" style={{borderStyle:"solid", borderColor:"black"}} key={ind}>
                            <Col style={{paddingLeft: "5rem"}}>
                                {(b.type=='header') && <>
                                    <h3>Header</h3>
                                    <h5>{b.internal}</h5>
                                </>}
                                {(b.type=='paragraph') && <>
                                    <h3>Paragraph</h3>
                                    <p>{b.internal}</p>
                                </>}
                                {(b.type=='image') && <>
                                    <h3>Image</h3>
                                    <Card style={{width: '500px'}}>
                                        <Card.Img variant="top" src={`http://localhost:3001/${b.internal}`}/>
                                    </Card>
                                </>}
                            </Col>
                            <Col xs={3} className="d-flex justify-content-end">
                                {mode=="view" && b.position>1 && <Button className="move_blocks" onClick={() => {moveBlockUp(b.position);}}><BsArrowUp/></Button>}
                                {mode=="view" && b.position<blocks.length && <Button className="move_blocks" onClick={() => {moveBlockDown(b.position);}}><BsArrowDown/></Button>}
                                {mode=="view" && <Button onClick={()=>{setEditedBlock(b);setMode("edit");}}><BsFillPencilFill/></Button>}
                                {mode=="view" && <Button className="delete" onClick={()=>{cancelBlock(b.position)}}><BsTrashFill/></Button>}
                            </Col>
                        </Row>
                    )}
                    {mode=="view" && <Button className="add_block" onClick={()=>{
                        const newPos=Math.max(...blocks.map((b) => b.position));
                        setEditedBlock(
                            {
                                id: null,
                                type: "header",
                                internal: "",
                                pageID: id,
                                position: isFinite(newPos)?(newPos + 1) : 1
                            }
                        ); 
                        setMode("add");}}>+</Button>}
                    {mode=="add" && <>
                        <Form.Group style={{width:"500px"}} controlId="newType">
                            <Form.Label className="fw-light">Type</Form.Label>
                            <Form.Select name="newType" value={editedBlock.type} onChange={(ev)=>{setEditedBlock((old) => ({
                                    ...old,
                                    type: ev.target.value,
                                    internal: ev.target.value=="image"?props.images.map((i)=>i.name)[0]:""}))}}>
                                    <option value="header">header</option>
                                    <option value="paragraph">paragraph</option>
                                    <option value="image">image</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group style={{width:"500px"}} controlId="newContent">
                            <Form.Label>Internal</Form.Label>
                            {(editedBlock.type=="header" || editedBlock.type=="paragraph") && <>
                                <Form.Control as="textarea" name="newContent" value={editedBlock.internal} onChange={(ev)=>{setEditedBlock((old) => ({
                                    ...old,
                                    internal: ev.target.value}))}}>
                                </Form.Control>
                            </>}
                            {editedBlock.type=="image" && <>
                                <Form.Select name="newContent" value={editedBlock.internal} onChange={(ev)=>{setEditedBlock((old)=>({
                                    ...old,
                                    internal: ev.target.value}))}}>
                                    
                                    {props.images.map((i, ind)=>
                                        <option value={`${i.name}`} key={ind}>{`${i.name}`}</option>
                                    )}
                                </Form.Select>
                                <Card>
                                    <Card.Img src = {`http://localhost:3001/${editedBlock.internal}`}/>
                                </Card>
                            </>}
                        </Form.Group>
                        <Button variant="primary" className="mt-3" style={{width: "70px", marginRight:"1%"}} onClick={()=>{
                            if(editedBlock.internal!=""){
                                setBlocks((old)=>([
                                    ...old,
                                    editedBlock
                                ]));
                                setCannotAdd(false);
                                setMode("view");
                            }
                            else{
                                setCannotAdd(true);
                            }
                        }}>ADD</Button>
                        <Button variant="secondary" className="mt-3" style={{width: "70px"}} onClick={()=>{setMode("view"); setEditedBlock()}}>CLOSE</Button>
                    </>}
                    {mode=="edit" && <>
                        <Form.Group style={{width:"500px"}} controlId="newType">
                            <Form.Label className="fw-light">Type</Form.Label>
                            <Form.Select name="newType" value={editedBlock.type} onChange={(ev)=>{setEditedBlock((old) => ({
                                    ...old,
                                    type: ev.target.value,
                                    internal: ev.target.value=="image"?props.images.map((i)=>i.name)[0]:""}))}}>
                                    <option value="header">header</option>
                                    <option value="paragraph">paragraph</option>
                                    <option value="image">image</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group style={{width:"500px"}} controlId="newContent">
                            <Form.Label>Internal</Form.Label>
                            {(editedBlock.type=="header" || editedBlock.type=="paragraph") && <>
                                <Form.Control as="textarea" name="newContent" value={editedBlock.internal} onChange={(ev)=>{setEditedBlock((old) => ({
                                    ...old,
                                    internal: ev.target.value}))}}>
                                </Form.Control>
                            </>}
                            {editedBlock.type=="image" && <>
                                <Form.Select name="newContent" value={editedBlock.internal} onChange={(ev)=>{setEditedBlock((old)=>({
                                    ...old,
                                    internal: ev.target.value}))}}>
                                    
                                    {props.images.map((i, ind)=>
                                        <option value={`${i.name}`} key={ind}>{`${i.name}`}</option>
                                    )}
                                </Form.Select>
                                <Card>
                                    <Card.Img src = {`http://localhost:3001/${editedBlock.internal}`}/>
                                </Card>
                            </>}
                        </Form.Group>
                        <Button variant="primary" className="mt-3" style={{width: "70px", marginRight:"1%"}} onClick={()=>{
                            if(editedBlock.internal!=""){
                                setBlocks((old)=>old.map((b)=>{
                                    if(b.position==editedBlock.position){
                                        return editedBlock
                                    }
                                    else{
                                        return b;
                                    }
                                }));
                                setMode("view");
                                setCannotAdd(false);
                            }
                            else{
                                setCannotAdd(true);
                            }
                        }}>SAVE</Button>
                        <Button variant="secondary" className="mt-3" style={{width: "70px"}} onClick={()=>{setMode("view"); setEditedBlock()}}>CLOSE</Button>
                        {cannotAdd && <p className="error_message">Content of the new block is empty</p>}
                    </>}
                    <Row className='d-flex justify-content-end align-content-end align-self'>
                        <Button className='mt-3' type="submit" variant="primary" style={{backgroundColor:"green", width:"100px"}}>Save</Button>
                        <Button className='mt-3' variant="secondary" style={{marginRight:'1%', marginLeft:'1%', width:"100px"}} onClick={() => {navigate('/back_office')}}>Back</Button>
                    </Row>
                    {err && <><Alert style={{position:'fixed', width:"-webkit-fill-available", textAlign:"center"}}
                        dismissible
                        onClose={() => setErr()}
                        variant="danger">
                        {err}
                        </Alert></>
                    }
                </Form>
            </Col>
        </Row>
    }</>
}

export {EditPage}