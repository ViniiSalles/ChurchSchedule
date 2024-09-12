import { useState, useEffect } from 'react';
import Axios from "axios";
import { Button, Group, Box, Container} from "@mantine/core";
import styles from './scaleDetailsModal.module.css'
// import CancelIcon from '../../../public/cancelIcon.png';

export default function excludeModal({ elementId, fetch, close }) {
    const [eventDetails, seteventDetails] = useState([])



    const carregarDetalhes = async (elementId) => {
        try {
            const response = await Axios.get(`https://schedule-server-rfti.onrender.com/events/${elementId}`);
            console.log("aaaaaa")
            console.log(response.data)
            seteventDetails(response.data)
        } catch (e) {
            console.log("erro: ", e)
        }
    }

    function gerarModal(eventDetails) {
        const modalInfo = 
            <div key={eventDetails.id} id={styles.tableDiv}>
                <Box mx="auto" id={styles.box}>
                    <Container id={styles.container}>
                        <Container id={styles.eventNameContainer}>
                            <h3 id={styles.eventNameText}>{eventDetails.nameevent}</h3>
                        </Container>
                        <Group id={styles.detailsGroup}>
                            <Container id={styles.data} className={styles.infodata}>
                                <label id={styles.labelData} className={styles.labels}>Data/Hora: </label>
                                <p id={styles.dateText}>{eventDetails.dateevent}/{eventDetails.hourevent}</p>
                            </Container>
                            <Container id={styles.preletor} className={styles.infodata}>
                                <label id={styles.labelpreletor} className={styles.labels}>Preletor: </label>
                                <p id={styles.preletorText}>Indisponivel</p>
                            </Container>
                            <Container id={styles.tipo} className={styles.infodata}>
                                <label id={styles.labeltipo} className={styles.labels}>Tipo:</label>
                                <p id={styles.tipoText}>{eventDetails.typeevent}</p>
                            </Container>
                            <Container id={styles.desc}>
                                <label id={styles.labeldesc} className={styles.labels}>Descrição:</label>
                                <p id={styles.descText}>{eventDetails.descevent}</p>
                            </Container>
                        </Group>
                        <Container id={styles.buttonArea}>
                        <Button id={styles.closeButton} onClick={(e) => { close() }}>Fechar</Button>
                        </Container>
                    </Container>
                </Box>
            </div>
        return modalInfo
    }



    //executa assim que a pagina é carregada
    useEffect(() => {
        carregarDetalhes(elementId)
    }, [])
    return (
        <>
            <Box mx="auto" id={styles.box}>
                <Container>
                    {gerarModal(eventDetails)}

                </Container>
            </Box>
        </>
    )
}