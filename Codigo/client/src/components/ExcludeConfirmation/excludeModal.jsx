import { useState, useEffect } from 'react';
import { IMaskInput } from 'react-imask';
// import { useForm } from "@mantine/form";
import Axios from "axios";
import { Button, Group, Box, Container, Image, LoadingOverlay, Text } from "@mantine/core";
import NextImage from 'next/image';
import styles from './excludeModal.module.css'
import CancelIcon from '../../../public/cancelIcon.png';
import ErrorDialog from "@/components/dialog/ErrorDialog";

export default function excludeModal({ close, elementId, fetch, type, exclude }) {
    const [texto, setTexto] = useState("")
    const [haveScale, sethaveScale] = useState(null)
    const [haveBand, setHaveBand] = useState(false)
    const [isUnavaliable, setIsUnavaliable] = useState(false)

    //state de loader
    const [visible, setVisible] = useState(true);

    //states da caixa de erro
    const [errorMessage, setErrorMessage] = useState("")
    const [openedErrorDialogMessage, setOpenedPositionErrorDialogMessage] = useState(false);

    const closePositionErrorDialogMessage = () => setOpenedPositionErrorDialogMessage(false);

    //função para verificar se o item atrelado está relacionado a escalas 
    const verifyScale = async (type, id) => {
        console.log(id)
        if (type == 'events') {
            const response = await Axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/${id}`);
            const responseVol = await Axios.get(`https://schedule-server-rfti.onrender.com/volunteers/${id}`);
            if (response.data.length != 0 || responseVol.data.length != 0) {
                sethaveScale(true)
            } else {
                sethaveScale(false)
            }
        } else if (type == 'membro') {
            const response = await Axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/membro/${id}`);
            const responseMember = await Axios.get(`https://schedule-server-rfti.onrender.com/bands/bandMember-get/${id}`);
            const unavaliableresponse = await Axios.get(`https://schedule-server-rfti.onrender.com/unavailable/${id}`)
            console.log(unavaliableresponse.data)
            if ((response.data.length != 0 || responseMember.data.length != 0) || unavaliableresponse.data.length != 0) {
                sethaveScale(true)
                if (responseMember.data.length != 0) setHaveBand(true)
                if (unavaliableresponse.data.length != 0) setIsUnavaliable(true)
            } else {
                sethaveScale(false)
            }
        }
    }





    //função para excluir escala
    const excludeScale = async (id) => {
        setVisible(true)
        console.log(id)
        try {
            await Axios.delete(`https://schedule-server-rfti.onrender.com/escala-principal/delete/${id}`);
            await Axios.delete(`https://schedule-server-rfti.onrender.com/volunteers/delete/${id}`);

            setVisible(false)
            exclude()
            fetch()
            close()
        } catch (error) {
            setVisible(false)
            setErrorMessage("Erro ao excluir")
            console.error("Erro ao excluir:", error);
        }
    }



    //função pra excluir item
    const excluir = async (id, type) => {
        setVisible(true)
        if (type == 'events') {
            if (haveScale == false) {
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/${type}/${id}`);
                    setVisible(false)
                    exclude()
                    fetch();
                    close();
                } catch (error) {
                    setVisible(false)
                    setErrorMessage("Erro ao excluir")
                    console.error("Erro ao excluir:", error);
                }
            } else {
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/escala-principal/delete/${id}`);
                    setVisible(false)
                    exclude()
                    fetch();
                    close();
                } catch (error) {
                    setVisible(false)
                    console.error("Erro ao excluir escala:", error);
                }
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/volunteers/delete/${id}`);
                    setVisible(false)
                    exclude()
                    fetch();
                    close();
                } catch (error) {
                    setVisible(false)
                    console.error("Erro ao excluir escala:", error);
                }
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/${type}/${id}`);
                    setVisible(false)
                    exclude()
                    fetch();
                    close();
                } catch (error) {
                    setVisible(false)
                    setErrorMessage("Erro ao excluir evento")
                    console.error("Erro ao excluir evento:", error);
                }
            }
        } else if (type == 'membro') {
            console.log(haveScale)
            if (haveScale == false) {
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/members/deleteMember/${id}`);
                    setVisible(false)
                    exclude()
                    fetch();
                    close();
                } catch (error) {
                    setVisible(false)
                    setErrorMessage("Erro ao excluir")
                    console.error("Erro ao excluir:", error);
                }
            } else {
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/unavailable/${id}`);
                } catch (error) {
                    setVisible(false)
                    console.error("Erro ao excluir escala:", error);
                }

                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/escala-principal/delete-member/${id}`);
                } catch (error) {
                    setVisible(false)
                    console.error("Erro ao excluir escala:", error);
                }
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/bands/bandMember-delete/${id}`);
                } catch (error) {
                    setVisible(false)
                    console.error("Erro ao excluir membro na banda:", error);
                }
                try {
                    await Axios.delete(`https://schedule-server-rfti.onrender.com/members/deleteMember/${id}`);
                    setVisible(false)
                    exclude()
                    fetch();
                    close();
                } catch (error) {
                    setVisible(false)
                    setErrorMessage("Erro ao excluir membro")
                    console.error("Erro ao excluir membro:", error);
                }
            }
        } else if (type == 'bands') {
            try {
                await Axios.delete(`https://schedule-server-rfti.onrender.com/bands/${id}`);
                setVisible(false)
                exclude()
                fetch();
                close();
            } catch (error) {
                setVisible(false)
                setErrorMessage("Erro ao excluir banda")
                console.error("Erro ao excluir banda:", error);
            }
        } else if (type == 'escala') {
            excludeScale(id)
        }
    };



    //função de criação de texto do modal
    function modelText(type) {
        let text = ''
        if (type == 'membro' && haveScale == false) {
            text = `O membro será excluido permanentemente da base de dados. Clique em "Excluir" para confirmar, ou clique em "Cancelar" ou na tecla "ESC" para cancelar a ação.`
        } else if (type == 'membro' && haveScale == true) {
            if (haveBand == false && isUnavaliable == false) {
                text = `O membro selecionado está atrelado a escalas de eventos, isso acarretará na exclusão das escalas deste membro, deseja continuar?`
            } else if (haveBand == false && isUnavaliable == true) {
                text = `O membro será excluido permanentemente da base de dados. Clique em "Excluir" para confirmar, ou clique em "Cancelar" ou na tecla "ESC" para cancelar a ação.`
        } else text = `O membro será excluido permanentemente da base de dados. Clique em "Excluir" para confirmar, ou clique em "Cancelar" ou na tecla "ESC" para cancelar a ação.`
        
        } else if (type == 'events' && haveScale == false) {
            text = `O evento será excluido permanentemente da base de dados. Clique em "Excluir" para confirmar, ou clique em "Cancelar" ou na tecla "ESC" para cancelar a ação.`
        } else if (type == 'events' && haveScale == true) {
            text = `O evento selecionado está atrelado a escalas de eventos, a exclusão deste evento, acarretará na exclusão das escalas alocadas a este evento, deseja continuar?`
        } else if (type == 'escala') {
            text = `A escala será excluida permanentemente da base de dados. Clique em  "Excluir" para confirmar, ou clique em "Cancelar" ou na tecla "ESC" para cancelar a ação.`
        } else if (type == 'bands') {
            text = `A banda será excluida permanentemente da base de dados. Clique em  "Excluir" para confirmar, ou clique em "Cancelar" ou na tecla "ESC" para cancelar a ação.`
        } else if (type == 'bands' && haveScale == true) {
            text = `A banda selecionada está atrelada a escalas de eventos, a exclusão desta banda, acarretará na exclusão das escalas alocadas aos eventos, deseja continuar?`
        } else {
            text = null;
        }

        setTexto(text);
    }



    //função para realizar a verificação de escalas associadas ao gerar o modal
    useEffect(() => {
        verifyScale(type, elementId);
    }, []);

    useEffect(() => {
        if (errorMessage != "") setOpenedPositionErrorDialogMessage(true)
    }, [errorMessage]);

    useEffect(() => {
        if (texto != "") setVisible(false)
    }, [texto]);

    useEffect(() => {
        modelText(type)
        // setVisible(false)
    }, [haveScale]);
    return (
        <>
            <Box mx="auto" id={styles.box}>
                <LoadingOverlay visible={visible}
                    zIndex={1000}
                    overlayProps={{ blur: 2 }}
                    loaderProps={{ color: '#8c232c' }}
                />
                <Container id={styles.container}>
                    <Image src={CancelIcon}
                        component={NextImage}
                        className={styles.cancelPic}
                        alt='Icone de cancelar' />
                    <Container id={styles.textContainer}>
                        <h3 id={styles.mainText}><b>ATENÇÃO</b> </h3>
                        <p id={styles.auxText}>{texto}</p>
                    </Container>
                    <Group id={styles.buttonsection}>
                        <Button id={styles.confirmButton} onClick={(e) => { excluir(elementId, type) }}>Excluir</Button>
                        <Button id={styles.cancelButton} onClick={(e) => { close() }}>Cancelar</Button>
                    </Group>
                </Container>
                <ErrorDialog
                    opened={openedErrorDialogMessage}
                    onClose={closePositionErrorDialogMessage}
                    title="Erro"

                >
                    <Text size="sm" c="black">{errorMessage}</Text>
                </ErrorDialog>
            </Box>
        </>
    )
}