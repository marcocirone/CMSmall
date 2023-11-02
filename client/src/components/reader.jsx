import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getPageByID } from "../API";
import { Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap";

function PageReader(props){
    const navigate = useNavigate();

    const {id} = useParams();

    const [blocks, setBlocks] = useState([]);

    const sortByOrder = (a, b) => {
        return a.position - b.position;
    }

    useEffect(() => {
        getPageByID(id).then((b) => {setBlocks(b.sort(sortByOrder))}).catch((err) => {props.setErrorMessage(err.message)});
    }, []);

    function Block(props){
        const block = props.block;


        return <>
                {(block && (block.type=='header')) && <h2 style={{maxWidth: '500px'}}>{block.internal}</h2>}
                {(block && block.type=='paragraph') && <p style={{maxWidth: '500px'}}>{block.internal}</p>}
                {(block && block.type=='image') &&
                    <Card style={{width: '500px'}}>
                        <Card.Img variant="top" src={`http://localhost:3001/${block.internal}`}/>
                    </Card>
                }
            <br />
        </>
    }

    return<>
    {   
        props.errorMessage?
        <Alert variant="danger" style={{podition:"fixed", width:"-webkit-fill-available", textAlign:"center"}}>{props.errorMessage}</Alert>
        :   
        blocks.length==0?
        <Row className="d-flex justify-content-center align-items-center" style={{height: "100vh"}}>
            <Spinner animation="border" variant="secondary"/>
        </Row>
        :
        <Row className="d-flex flex-row" style={{minHeight: "90vh"}}>
            <Col className="page_info d-flex flex-column align-items-start" xs={3}>
                <Row className="page_attribute"><h3 style={{color:"red"}}>Title:</h3><h5>{props.page.title}</h5></Row>
                <Row className="page_attribute"><h3 style={{color:"red"}}>Author:</h3><h5>{props.page.author}</h5></Row>
                <Row className="page_attribute"><h3 style={{color:"red"}}>Creation Date:</h3><h5>{props.page.creation_date}</h5></Row>
                <Row className="page_attribute"><h3 style={{color:"red"}}>Publication Date:</h3><h5>{props.page.publication_date?props.page.publication_date:"Undefined"}</h5></Row>
            </Col>
            <Col xs={9}>
                <Row className='d-flex flex-column justify-content-start align-items-center align-self-stretch'>
                    {blocks.map((b) => {return <Block block={b} key={b.id}/>})}
                </Row>
                <Row className='d-flex justify-content-end'>
                    <Button className='mt-3 d-flex justify-content-center' variant="secondary" style={{paddingRight: '1%', marginRight:"2%", width:"50px"}} onClick={() => {navigate(-1)}}>Back</Button>
                </Row>
            </Col>
        </Row>
    }
    </>
    
}

export {PageReader};