import { Table, Button, Container, Spinner, Row, Alert} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';

function MakeTable(props){

    const navigate = useNavigate();

    function PageRow(props){

        const title = props.page.title;
        const author = props.page.author;
        const creation_date = props.page.creation_date;
        const publication_date = props.page.publication_date;

        return<>
            <tr>
                <td><p>{title}</p></td>
                <td><p>{author}</p></td>
                <td><p>{creation_date}</p></td>
                <td><p>{publication_date?publication_date:"Undefined"}</p></td>
                <td>{publication_date?dayjs().diff(dayjs(publication_date), 'days')>=0?<p style={{color:"green"}}>Published</p>:<p style={{color:"gold"}}>Programmed</p>:<p style={{color:"red"}}>Draft</p>}</td>
                <td>
                    <button className="open_page" onClick={async () => {await props.handleRead(props.page.id); navigate(`/page/${props.page.id}`);}}><i className="bi-search" style={{color:'white'}}></i></button>
                    {(props.loc=="back-office" && ((props.user && props.user.role=='Admin') || (props.user && props.user.id==props.page.userid))) && <button className="edit_page" onClick={() => {props.handleEdit(props.page.id); navigate(`/edit_page/${props.page.id}`);}}><i className="bi-pencil-square" style={{color:'white'}}></i></button>}
                    {(props.loc=="back-office" && ((props.user && props.user.role=='Admin') || (props.user && props.user.id==props.page.userid))) && <button className="delete" onClick={()=>{props.handleDelete(props.page.id)}}><i className="bi-trash-fill" style={{color:'white'}}></i></button>}
                </td>
            </tr>
        </>
    }

    return <>
        {   props.errorMessage? 
            <Alert variant="danger" style={{podition:"fixed", width:"-webkit-fill-available", textAlign:"center"}}>{props.errorMessage}</Alert>
            :
            props.loading?
            <Row className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}><Spinner animation="border" variant="secondary"/></Row>
            :
            <Container fluid>
            <Table>
                <thead>
                    <tr>
                        <td>Title</td>
                        <td>Author</td>
                        <td>Creation Date</td>
                        <td>Publication date</td>
                        <td>Status</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {props.pages.map((p, ind) => {return <PageRow loc={props.loc} page={p} key={ind} user={props.user} handleRead={props.handleRead} handleEdit={props.handleEdit} handleDelete={props.handleDelete}/>})}
                </tbody>
            </Table>
            {props.user && props.loc=="front-office" && <Button variant="success" onClick={() => {navigate("/back_office")}}>To back-office</Button>}
            {props.user && props.loc=="back-office" && <><Button variant="success" style={{maxWidth:"200px"}} onClick={() => {navigate("/")}}>To front-office</Button>
            <Button className="add_page" onClick={()=>{props.handleAdd(); navigate(`/add_page/${Math.max(...props.pages.map((p)=>p.id)) + 1}`)}}>+</Button></>}
            </Container>
        }
    </>
}

export {MakeTable}