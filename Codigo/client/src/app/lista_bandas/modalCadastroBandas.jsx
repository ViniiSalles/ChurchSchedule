"use client";
import SuccessDialog from "@/components/dialog/SuccessDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import { useUser } from "@auth0/nextjs-auth0/client";
import Negado from "@/components/acessoNegado/acessoNegado";

import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Box,
  Text,
  LoadingOverlay,
} from "@mantine/core";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import axios from "axios";
import React, { useEffect, useState } from "react";

export default function CadastroBandas({ close, fetch }) {
  const [openedDialog, setOpenedDialog] = React.useState(false);
  const [openedErrorDialog, setOpenedErrorDialog] = React.useState(false);

  //state de loader
  const [visible, setVisible] = useState(false);

  const closeDialog = () => setOpenedDialog(false);
  const closeErrorDialog = () => setOpenedErrorDialog(false);

  useEffect(() => {
    const handleDoubleClick = () => {
      if (openedDialog) closeDialog();
      if (openedErrorDialog) closeErrorDialog();
    };

    // Adiciona o ouvinte de evento de clique duplo ao documento
    document.addEventListener("dblclick", handleDoubleClick);

    // Remove o ouvinte de evento quando o componente é desmontado
    return () => {
      document.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [openedDialog, openedErrorDialog]); // Dependências do useEffect

  const submitSalvar = () => {
    const values = form.values;
    setVisible(true)
    if (!values.name) {
      setVisible(false)
      setOpenedErrorDialog(true); // Abre o Dialog de erro
      return; // Interrompe a execução da função
    } else {
      axios
        .post("https://schedule-server-rfti.onrender.com/bands/", {
          nome: values.name,
        })
        .then(() => {
          setVisible(false)
          setOpenedDialog(true);
          fetch()
          form.reset();
        })
        .catch((error) => {
          setVisible(false)
          console.error("Erro ao cadastrar a banda:", error);
          setOpenedErrorDialog(true);
        });
    }
  };

  const form = useForm({
    initialValues: {
      name: "",
    },
  });

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
          <h1>Cadastro de bandas</h1>
          <form
            className="form-cadastro"
            onSubmit={form.onSubmit(submitSalvar)}
          >
            <TextInput
              label="Nome da Banda"
              withAsterisk
              placeholder=""
              {...form.getInputProps("name")}
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
              <Button type="submit">
                Salvar
              </Button>
            </Group>
          </form>
        </Box>

        <SuccessDialog
          opened={openedDialog}
          onClose={closeDialog}
          title="Banda cadastrada com sucesso!"
        >
          <Text size="sm">Sua banda foi cadastrada com sucesso.</Text>
        </SuccessDialog>
        <ErrorDialog
          opened={openedErrorDialog}
          onClose={closeErrorDialog}
          title="Erro ao cadastrar banda"
        >
          <Text size="sm">Por favor, preencha todos os campos obrigatórios.</Text>
        </ErrorDialog>
      </>
    );
  }

  return <Negado></Negado>;
}
