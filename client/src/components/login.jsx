import { useNavigate } from 'react-router-dom' ;
import { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Row } from 'react-bootstrap';

function Login(props){

    const navigate = useNavigate();

    const {errorMessage, setErrorMessage} = props;
    
    const [username, setUsername] = useState("marco@email.it");
    const [password, setPassword] = useState("password");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
 
        const credentials = {
            username: username, 
            password: password
        };
        props.handleLogin(credentials);
    }

    return <>
    <Row className='d-flex flex-column justify-content-center align-items-center' style={{height: '600px'}}>
        {errorMessage &&<Alert style={{position:'fixed', bottom:"0", marginBottom:"0"}}
            dismissible
            onClose={() => setErrorMessage()}
            variant="danger">
            {errorMessage}
        </Alert>}
        <Card className="login_form" style={{backgroundColor: '#b7b3ff', width: "30%"}}>
            <Form onSubmit = {handleSubmit}>
                <Form.Group controlId="username">
                    <Form.Label className='fw-light'><h6>Email</h6></Form.Label>
                    <Form.Control value={username} onChange={(ev)=>{setUsername(ev.target.value)}} type="email" name="username" required={true} placeholder="Enter email" />
                </Form.Group>
                <Form.Group>
                    <Form.Label className='fw-light'><h6>Password</h6></Form.Label>
                    <Form.Control value={password} onChange={(ev)=>{setPassword(ev.target.value)}} type="password" name="password" required={true} placeholder="Enter password" />
                </Form.Group>
                <br/>
                <Button style={{backgroundColor:"green", marginRight:"1%"}} type="submit">Login</Button>
                <Button variant="secondary " onClick={() => {navigate('/')}}>Back</Button>
            </Form>
            {loading && <Spinner animation="border" variant="secondary"></Spinner>}
        </Card>
    </Row>

    </>
}

export {Login}