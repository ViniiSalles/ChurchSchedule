"use client";

import React, { useEffect } from 'react';
import { useState } from "react";
import { useForm } from "@mantine/form";
import { TextInput, Button, Group, Box, LoadingOverlay } from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";
import ErrorDialog from "@/components/dialog/ErrorDialog";



//Adições Bruno
import { IMaskInput } from 'react-imask';
import Axios from "axios";
import dayjs from "dayjs";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import style from './modalEventos.module.css'

export default function modalEventos({ elementId, fetch, close, edit }) {

  //state de loader
  const [visible, setVisible] = useState(false);

  //states da caixa de erro
  const [errorMessage, setErrorMessage] = useState("")
  const [openedErrorDialogMessage, setOpenedPositionErrorDialogMessage] = useState(false);

  
  const closePositionErrorDialogMessage = () => setOpenedPositionErrorDialogMessage(false);

  //funções que podem ser uteis
  const form = useForm({
    initialValues: {
      name: "",
      data: "",
      hora: "",
      tipo: "",
      descricao: "",
      preletor: "",
    },
  });


  //função de alteração do evento
  const alterarEvento = async (id) => {
    const values = form.values;
    setVisible(true)
    try {
      await Axios.put(`https://schedule-server-rfti.onrender.com/events/${id}`, {
        nameEvent: values.name,
        dateEvent: values.data,
        hourEvent: values.hora,
        typeEvent: values.tipo,
        descEvent: values.descricao,
        preletor: values.preletor,
        id: id,
      }).then(() => {
        edit()
        form.reset();
      });
      fetch()
      close()
      setVisible(false)
    } catch (error) {
      setVisible(false)
      setErrorMessage("Erro ao editar Evento")
      console.error("Erro ao editar Evento:", error);
    }
  };

  const fetchEventData = async () => {
    try {
      const response = await Axios.get(`https://schedule-server-rfti.onrender.com/events/${elementId}`);
      console.log(response.data)
      const event = response.data;
      console.log(event.nameevent)
      form.setValues({
        name: event.nameevent,
        data: new Date(dayjs(event.dateevent).format('YYYY-MM-DD')),
        hora: event.hourevent,
        tipo: event.typeevent,
        descricao: event.descevent,
        preletor: event.preletor,
      });
      setVisible(false)
    } catch (error) {
      setVisible(false)
      setErrorMessage("Erro ao buscar dados do evento")
      console.error("Erro ao buscar dados do evento:", error);
    }
  };

  useEffect(() => {
    if (errorMessage != "") setOpenedPositionErrorDialogMessage(true)
  }, [errorMessage]);

  useEffect(() => {
    setVisible(true)
    fetchEventData()
  }, []);

  return (
    <Box maw={340} mx="auto" className={style.modalArea}>
      <LoadingOverlay visible={visible}
        zIndex={1000}
        overlayProps={{ blur: 2 }}
        loaderProps={{ color: '#8c232c' }}
      />
      <h1>Editar evento:</h1>
      <form
        className="form-cadastro"
        onSubmit={form.onSubmit((values) => console.log(values))}
      >
        <TextInput
          withAsterisk
          label="Nome do evento"
          {...form.getInputProps("name")}
        />
        <DateInput
          withAsterisk
          minDate={new Date()}
          maxDate={dayjs(new Date()).add(1, "month").toDate()}
          valueFormat="DD/MM/YYYY"
          label="Data do Evento"
          placeholder="00/00/0000"
          {...form.getInputProps("data")}
        />
        <TimeInput
          withAsterisk
          label="Horário do evento"
          {...form.getInputProps("hora")}
        />
        <TextInput
          withAsterisk
          label="tipo de evento"
          placeholder=""
          {...form.getInputProps("tipo")}
        />
        <TextInput
          withAsterisk
          label="descrição evento"
          placeholder=""
          {...form.getInputProps("descricao")}
        />
        <TextInput
          label="Preletor do evento"
          {...form.getInputProps("preletor")}
        />
        <Group justify="flex-end" mt="md">
          <Button type="submit" color="#fa7889" onClick={(e) => { alterarEvento(elementId) }}>Salvar</Button>
        </Group>
      </form>
      <ErrorDialog
              opened={openedErrorDialogMessage}
              onClose={closePositionErrorDialogMessage}
              title="Erro"

            >
              <Text size="sm" c="black">{errorMessage}</Text>

            </ErrorDialog>
    </Box>
  );
}