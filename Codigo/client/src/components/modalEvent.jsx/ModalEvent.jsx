import { Modal } from '@mantine/core';
import axios from 'axios';
import classes from "./ModalEvent.module.css";

function ModalEvent({ modalOpened, setModalOpened, currentEvent, deleteEvent }) {
    // Função para deletar um evento
    // async function handleDelete(id) {
    //     await axios.delete(`https://schedule-server-rfti.onrender.com/events/${id}`)
    //         .then(() => {
    //             deleteEvent(id);
    //             setModalOpened(false);
    //         })
    //         .catch((error) => {
    //             console.error("Erro ao deletar o evento: ", error);
    //         });
    // }

    if (!currentEvent) {
        return null; // Ou alguma representação de loading ou estado vazio
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    return (
        <Modal
            opened={modalOpened}
            onClose={() => setModalOpened(false)}
            title= { currentEvent.nameevent }
        >
            {currentEvent ? (
                <div>
                    <div>
                        <div className= {classes.wrapper_info}>
                            <h2 className={ classes.info_title}>Data:</h2>
                            {formatDate(currentEvent.dateevent)}
                        </div>

                        <div className= {classes.wrapper_info}>
                            <h2 className={ classes.info_title}>Horário:</h2>
                            {currentEvent.hourevent}
                        </div>

                        <div className= {classes.wrapper_info}>
                            <h2 className={ classes.info_title}>Tipo:</h2>
                            {currentEvent.typeevent}
                        </div>

                        <div className= {classes.wrapper_info}>
                            <h2 className={ classes.info_title}>Preletor:</h2>
                            {currentEvent.preletor}
                        </div>

                        <div className= {classes.wrapper_info}>
                            <h2 className={ classes.info_title}>Descrição:</h2>
                            {currentEvent.descevent}
                        </div>
                    </div>

                    <div>
                        <button className={ classes.buttonn } onClick={() => setModalOpened(false)}>Fechar</button>
                    </div>
                </div>
            ) : (
                <p>Nenhum evento selecionado.</p>
            )}
        </Modal>
    );
}

export default ModalEvent;