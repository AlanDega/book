import React from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { validateFunc } from '../../constraints/constraints';
import { withTranslation } from 'react-i18next';

// reactstrap components
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    FormGroup,
    Form,
    Input,
    Row,
    Col,
    UncontrolledAlert
} from "reactstrap";

import { cloudinary_upload_url, cloudinary_category, cloudinary_restaurant } from "../../config/config";
import { editRestaurant, createRestaurant } from "../../apollo/server";

const CREATE_RESTAURANT = gql`${createRestaurant}`
const EDIT_RESTAURANT = gql`${editRestaurant}`


class Restaurant extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: props.restaurant ? props.restaurant.title : '',
            description: props.restaurant ? props.restaurant.description : '',
            img: props.restaurant ? props.restaurant.img : '',
            direccion: props.restaurant ? props.restaurant.direccion : '',
            telefonos: props.restaurant ? props.restaurant.telefonos : '',
            gps_coords: props.restaurant ? props.restaurant.gps_coords : '',
            is_active: props.restaurant ? props.restaurant.is_active : true,
            errorMessage: '',
            successMessage: '',
            titleError: null,
            telefonosError: null,
            direccionError: null,
            gps_coordsError: null,
            descriptionError: null,
            mutation: props.restaurant ? EDIT_RESTAURANT : CREATE_RESTAURANT
        };
    }
    filterImage = (event) => {
        let images = [];
        for (var i = 0; i < event.target.files.length; i++) {
            images[i] = event.target.files.item(i);
        }
        images = images.filter(image => image.name.match(/\.(jpg|jpeg|png|gif)$/))
        // let message = `${images.length} valid image(s) selected`
        // console.log(message)
        return images.length ? images[0] : undefined
    }
    selectImage = (event, state) => {
        let result = this.filterImage(event)
        if (result) {
            this.imageToBase64(result)
        }
    }

    onBlur = (event, field) => {
        this.setState({ [field + 'Error']: !validateFunc({ ['restaurant_' + field]: this.state[field] }, 'restaurant_' + field) })
    }
    onSubmitValidaiton = () => {
        let form = this.state
        let titleError = !validateFunc({ restaurant_title: form.title }, 'restaurant_title')
        let descriptionError = !validateFunc({ restaurant_description: form.description }, 'restaurant_description')
        this.setState({ titleError, descriptionError })
        return (titleError && descriptionError)
    }
    clearFields = () => {
        this.setState({
            title: '',
            description: '',
            img: '',
            direccion: '',
            telefonos: '',
            gps_coords: '',
            is_active: true,
            titleError: null,
            telefonosError: null,
            descriptionError: null,
            gps_coordsError: null,
        })
    }
    onCompleted = (data) => {
        const message = this.props.restaurant ? 'Restaurante actualizado' : 'Restaurante agregado'
        this.setState({ successMessage: message, errorMessage: '' })
        if (!this.props.restaurant) this.clearFields()
        setTimeout(this.hideMessage, 3000)
    }
    onError = (error) => {
        const message = 'Falló la acción. Por favor inténtalo de nuevo '
        console.log('error:' + error)
        this.setState({ successMessage: '', errorMessage: message })
        setTimeout(this.hideMessage, 3000)
    }
    hideMessage = () => {
        this.setState({ errorMessage: '', successMessage: '' })
    }
    imageToBase64 = (imgUrl) => {
        let fileReader = new FileReader()
        fileReader.onloadend = () => {
            this.setState({ img: fileReader.result })
        }
        fileReader.readAsDataURL(imgUrl)
    }
    uploadImageToCloudinary = async () => {
        if (this.state.img === '')
            return this.state.img
        if (this.props.restaurant && this.props.restaurant.img === this.state.img)
            return this.state.img

        let apiUrl = cloudinary_upload_url;
        let data = {
            "file": this.state.img,
            "upload_preset": cloudinary_restaurant
        }
        try {
            const result = await fetch(apiUrl, {
                body: JSON.stringify(data),
                headers: {
                    'content-type': 'application/json'
                },
                method: 'POST',
            })
            const imageData = await result.json()
            return imageData.secure_url
        }
        catch (e) {
            console.log(e)
        }
    }
    
    render() {
        const { t } = this.props;
        return (<Row>
            <Col className="order-xl-1" >
                <Card className="bg-secondary shadow">
                    <CardHeader className="bg-white border-0">
                        <Row className="align-items-center">
                            <Col xs="8">
                                <h3 className="mb-0">{this.props.restaurant ? t("Editar Restaurante") : t("Agregar Restaurante")}</h3>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <Form>
                            <div className="pl-lg-4">
                                
                                <Row>
                                    <Col lg="6">

                                        <label
                                            className="form-control-label"
                                            htmlFor="input-title">
                                            {t("Title")}
                                        </label>
                                        <br />
                                        <small>{t("Character limit of max length 60")}</small>

                                        <FormGroup className={this.state.titleError === null ? "" : this.state.titleError ? "has-success" : "has-danger"}>
                                            <Input
                                                className="form-control-alternative"
                                                id="input-title"
                                                placeholder="ej. Sucursal Sur"
                                                type="text"
                                                value={this.state.title}
                                                maxLength="60"
                                                onChange={(event) => {
                                                    this.setState({ title: event.target.value })
                                                }}
                                                onBlur={event => { this.onBlur(event, 'title') }}
                                            />
                                        </FormGroup>

                                    </Col>
                                    <Col lg="6">
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-telefonos"
                                        >
                                            {t("Teléfonos")}
                                        </label>
                                        <br />
                                        <small>{t("Character limit of max length 60")}</small>
                                        <FormGroup className={this.state.telefonosError === null ? "" : this.state.telefonosError ? "has-success" : "has-danger"}>
                                            <Input
                                                className="form-control-alternative"
                                                id="input-telefonos"
                                                placeholder = "ej. 55 5555-5555, 55 5555-5555,"
                                                type="text"
                                                value={this.state.telefonos}
                                                maxLength="60"
                                                onChange={(event) => {
                                                    this.setState({ telefonos: event.target.value })
                                                }}
                                                onBlur={event => { this.onBlur(event, 'telefonos') }}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                
                                <Row>
                                    <Col md="6">
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-direccion">
                                            {t("Dirección")}
                                        </label>
                                        <br />
                                        <small>{t("Character limit of max length 140")}</small>
                                        <FormGroup className={this.state.direccionError === null ? "" : this.state.direccionError ? "has-success" : "has-danger"}>
                                            <Input
                                                className="form-control-alternative"
                                                id="input-direccion"
                                                placeholder="ej. Al sur de la ciudad"
                                                type="text"
                                                maxLength="140"
                                                value={this.state.direccion}
                                                onChange={(event) => {
                                                    this.setState({ direccion: event.target.value })
                                                }}
                                                onBlur={(event) => { this.onBlur(event, 'direccion') }}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-coords_gps"
                                        >
                                            {t("Coordenadas GPS")}
                                        </label>
                                        <br />
                                        <small>{t("Character limit of max length 60")}</small>
                                        <FormGroup className={this.state.gps_coordsError === null ? "" : this.state.gps_coordsError ? "has-success" : "has-danger"}>
                                            <Input
                                                className="form-control-alternative"
                                                id="input-gps_coords"
                                                placeholder = "ej. 19.3119548,-99.1193881"
                                                type="text"
                                                maxLength="60"
                                                value={this.state.gps_coords}
                                                onChange={(event) => {
                                                    this.setState({ gps_coords: event.target.value })
                                                }}
                                                onBlur={(event) => { this.onBlur(event, 'gps_coords') }}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md="6">
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-description">
                                            {t("Description")}
                                        </label>
                                        <br />
                                        <small>{t("Character limit of max length 140")}</small>
                                        <FormGroup className={this.state.descriptionError === null ? "" : this.state.descriptionError ? "has-success" : "has-danger"}>
                                            <Input
                                                className="form-control-alternative"
                                                id="input-description"
                                                placeholder="ej. Al sur de la ciudad"
                                                type="text"
                                                maxLength="140"
                                                value={this.state.description}
                                                onChange={(event) => {
                                                    this.setState({ description: event.target.value })
                                                }}
                                                onBlur={(event) => { this.onBlur(event, 'description') }}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md="6">
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-is_active">
                                            {t("Available")}
                                        </label>
                                                        <FormGroup >
                                                            <label className="custom-toggle">
                                                                <input
                                                                    defaultChecked={this.state.is_active}
                                                                    type="checkbox"
                                                                    onChange={event => {
                                                                        this.setState({ is_active: event.target.checked })
                                                                    }} />
                                                                <span className="custom-toggle-slider rounded-circle" />
                                                            </label>
                                                        </FormGroup>
                                    </Col>
                                    
                                </Row>
                                <Row >
                                    <Col lg="6" >
                                        <FormGroup >
                                            <div className="card-title-image">
                                                <a href="#pablo" onClick={e => e.preventDefault()}>
                                                    {this.state.img && typeof this.state.img === 'string' &&
                                                        <img alt='menu img'
                                                            style={{ width: '200px', height: '200px' }}
                                                            src={this.state.img}
                                                        />}
                                                </a>
                                                <input
                                                    className="mt-4"
                                                    type="file"
                                                    onChange={(event) => { this.selectImage(event, "img") }}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row >

                                    <Mutation
                                        mutation={this.state.mutation}
                                        onCompleted={this.onCompleted}
                                        onError={this.onError}
                                        refetchQueries={['Restaurants']}>
                                        
                                        {(mutate, { loading, error }) => {
                                            if (loading) return t("Loading")

                                            return (<Col className="text-right" xs="12">

                                                    <Button
                                                        color="primary"
                                                        href="#pablo"
                                                        onClick={async e => {
                                                            
                                                            e.preventDefault()

                                                            this.setState({ successMessage: '', errorMessage: '' })
                                                            
                                                            if (this.onSubmitValidaiton()) {
                                                            console.log('Desc: ' + this.state.description)

                                                                mutate({
                                                                    variables: {
                                                                        _id: this.props.restaurant ? this.props.restaurant._id : '',
                                                                        title: this.state.title,
                                                                        description: this.state.description,
                                                                        direccion: this.state.direccion,
                                                                        telefonos: this.state.telefonos,
                                                                        gps_coords: this.state.gps_coords,
                                                                        is_active: this.state.is_active,
                                                                        img: await this.uploadImageToCloudinary()
                                                                    }
                                                                })

                                                            }

                                                        }}
                                                        size="md"
                                                    >
                                                        {t("Save")}
                                                    </Button>

                                                </Col>)
                                        }}

                                    </Mutation>
                                </Row>
                                <Row >
                                    <Col lg="6">
                                        {this.state.successMessage &&
                                            <UncontrolledAlert color="success" fade={true}>
                                                <span className="alert-inner--icon">
                                                    <i className="ni ni-like-2" />
                                                </span>{" "}
                                                <span className="alert-inner--text">
                                                    <strong>{t("Success")}!</strong> {this.state.successMessage}</span>
                                            </UncontrolledAlert>}
                                        {this.state.errorMessage &&
                                            <UncontrolledAlert color="danger" fade={true}>
                                                <span className="alert-inner--icon">
                                                    <i className="ni ni-like-2" />
                                                </span>{" "}
                                                <span className="alert-inner--text">
                                                    <strong>{t("Danger")}!</strong> {this.state.errorMessage}</span>
                                            </UncontrolledAlert>}
                                    </Col>
                                </Row>
                            </div>
                        </Form>
                    </CardBody>
                </Card>
            </Col>
        </Row>
        );
    }
}

export default withTranslation()(Restaurant)