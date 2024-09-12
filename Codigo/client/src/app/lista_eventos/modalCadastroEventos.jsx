"use client";

import React, { useEffect } from "react";

import Layout from "@/components/appLayout/layout";
import Negado from "@/components/acessoNegado/acessoNegado";

import { useDisclosure } from "@mantine/hooks";
import { useUser } from '@auth0/nextjs-auth0/client';

import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Box,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import dayjs from "dayjs";
import { DateInput, TimeInput } from "@mantine/dates";
import SuccessDialog from "@/components/dialog/SuccessDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";

//Adições Bruno
import { IMaskInput } from "react-imask";
import axios from "axios";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

export default function CadastroEventos({ close, fetch }) {
  const [opened, { toggle }] = useDisclosure();
  const [openedDialog, setOpenedDialog] = React.useState(false);
  const [openedErrorDialog, setOpenedErrorDialog] = React.useState(false);

  //state de loader
  const [visible, setVisible] = React.useState(false);

  const closeDialog = () => setOpenedDialog(false);
  const closeErrorDialog = () => setOpenedErrorDialog(false);


  useEffect(() => {
    const handleDoubleClick = () => {
      if (openedDialog) closeDialog();
      if (openedErrorDialog) closeErrorDialog();
    };
    // Adiciona o ouvinte de evento de clique duplo ao documento
    document.addEventListener('dblclick', handleDoubleClick);

    // Remove o ouvinte de evento quando o componente é desmontado
    return () => {
      document.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [openedDialog, openedErrorDialog]); // Dependências do useEffect

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

  const submitSalvar = () => {
    const values = form.values; // Acessa os valores atuais do formulário

    if (
      !values.name ||
      !values.data ||
      !values.hora ||
      !values.tipo ||
      !values.descricao ||
      !values.preletor
    ) {
      setOpenedErrorDialog(true); // Abre o Dialog de erro
      return; // Interrompe a execução da função
    } else {
      setVisible(true)
      axios
        .post("https://schedule-server-rfti.onrender.com/events", {
          nameEvent: values.name,
          dateEvent: values.data,
          hourEvent: values.hora,
          typeEvent: values.tipo,
          descEvent: values.descricao,
          preletor: values.preletor,
        })
        .then(() => {
          setVisible(false)
          setOpenedDialog(true);
          form.reset();
          fetch()
        });
    }
    
  };

  const { user } = useUser();

  const userHasAccess = user && user['https://BetelApi.com/roles'] && (
    user['https://BetelApi.com/roles'].includes('Pastor') ||
    user['https://BetelApi.com/roles'].includes('Lider')
  );



  if (userHasAccess) {
    return (
      <>
        <Box maw={340} mx="auto">
          <LoadingOverlay visible={visible}
            zIndex={1000}
            overlayProps={{ blur: 2 }}
            loaderProps={{ color: '#8c232c' }}
          />
          <h1>Cadastro de Eventos</h1>
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
              placeholder="Insira a data do evento"
              {...form.getInputProps("data")}
            />
            <TimeInput
              withAsterisk
              label="Horário do evento"
              {...form.getInputProps("hora")}
            />
            <TextInput
              withAsterisk
              label="Tipo de evento"
              placeholder=""
              {...form.getInputProps("tipo")}
            />
            <TextInput
              withAsterisk
              label="Descrição evento"
              placeholder=""
              {...form.getInputProps("descricao")}
            />
            <TextInput
              withAsterisk
              label="Preletor"
              placeholder=""
              {...form.getInputProps("preletor")}
            />
            <Group justify="flex-end" mt="md">
              <Button
                onClick={() => {
                  close()
                  fetch()
                }}
              >
                Fechar
              </Button>
              <Button
                type="submit"
                onClick={(e) => {
                  submitSalvar();
                }}
              >
                Salvar
              </Button>
            </Group>
          </form>
        </Box>
        <SuccessDialog
          opened={openedDialog}
          onClose={closeDialog}
          title="Evento cadastrado com sucesso!"
        >
          <Text size="sm">Seu evento foi cadastrado com sucesso.</Text>
        </SuccessDialog>
        <ErrorDialog
          opened={openedErrorDialog}
          onClose={closeErrorDialog}
          title="Erro ao cadastrar evento"
        >
          <Text size="sm">Por favor, preencha todos os campos obrigatórios.</Text>
        </ErrorDialog>

      </>
    );
  }

  return <Negado></Negado>
}