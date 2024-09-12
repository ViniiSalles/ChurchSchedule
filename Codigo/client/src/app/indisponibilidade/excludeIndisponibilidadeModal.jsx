"use client";
import React, { useEffect } from 'react';
import { Button, Box, LoadingOverlay, Text, Container } from "@mantine/core";
import classes from './excludeIndisponibilidadeModal.module.css'

export default function excludeIndisponibilidadeModal({ deletar, cancel, close }) {

    const confirmDeletion = () => {
        setVisible(true)
        deleteUnavailable(deletar.id);
        close()
    };



    return (
        <Box maw={340} mx="auto" className={classes.modalArea}>
            {/* <LoadingOverlay visible={visible}
                zIndex={1000}
                overlayProps={{ blur: 2 }}
                loaderProps={{ color: '#8c232c' }}
            /> */}
            <Container className={classes.containerModal}>
                <Text>Tem certeza de que deseja excluir esta indisponibilidade?</Text>
                <div className={classes.modalButtons}>
                    <Button onClick={confirmDeletion()} color="red" className={classes.buttons}>Excluir</Button>
                    <Button onClick={cancel()} className={classes.buttons}>Cancelar</Button>
                </div>
            </Container>
        </Box>)
}