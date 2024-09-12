"use client";
import SuccessDialog from "@/components/dialog/SuccessDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";

import React, { useEffect } from "react";
import axios from "axios";
import { IMaskInput } from "react-imask";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Box,
  Checkbox,
  Text,
  LoadingOverlay,
} from "@mantine/core";

export default function CadastroObreiros({close, fetch}) {
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
    document.addEventListener("dblclick", handleDoubleClick);

    // Remove o ouvinte de evento quando o componente é desmontado
    return () => {
      document.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [openedDialog, openedErrorDialog]); // Dependências do useEffect

  const form = useForm({
    initialValues: {
      name: "",
      telefone: "",
      diaconia: false,
      midia: false,
      louvor: false,
    },
  });

  const submitSalvar = () => {
    setVisible(true)
    const values = form.values; // Acessa os valores atuais do formulário

    if (
      !values.name ||
      !values.telefone ||
      (!values.diaconia && !values.louvor && !values.midia)
    ) {
      setVisible(false)
      closeErrorDialog(true); // Abre o Dialog de erro
      return; // Interrompe a execução da função
    } else {
      axios
        .post("https://schedule-server-rfti.onrender.com/members/", {
          name: values.name,
          telefone: values.telefone,
          diaconia: values.diaconia,
          louvor: values.louvor,
          midia: values.midia,
        })
        .then(() => {
          setVisible(false)
          setOpenedDialog(true);
          form.reset();
        });
    }
  };

  
  return (
    <>
    
      
          <Box maw={340} mx="auto">
          <LoadingOverlay visible={visible}
          zIndex={1000}
          overlayProps={{ blur: 2 }}
          loaderProps={{ color: '#8c232c' }}
        />
            <h1>Cadastro de Obreiros</h1>
            <form
              className="form-cadastro"
              onSubmit={form.onSubmit((values) => console.log(values))}
            >
              <TextInput
                withAsterisk
                label="Nome do Obreiro"
                {...form.getInputProps("name")}
              />
              
              <TextInput
                withAsterisk
                label="Telefone"
                component={IMaskInput}
                mask="(00) 00000-0000"
                {...form.getInputProps("telefone")}
              />

              <Checkbox
                label="Diaconia"
                mt="sm"
                {...form.getInputProps("diaconia", { type: "checkbox" })}
              />
              <Checkbox
                label="Mídia"
                mt="sm"
                {...form.getInputProps("midia", { type: "checkbox" })}
              />
              <Checkbox
                label="Louvor"
                mt="sm"
                {...form.getInputProps("louvor", { type: "checkbox" })}
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
          title="Obreiro cadastrado com sucesso!"
        >
          <Text size="sm">O obreiro foi cadastrado com sucesso.</Text>
        </SuccessDialog>
        <ErrorDialog
          opened={openedErrorDialog}
          onClose={closeErrorDialog}
          title="Erro ao cadastrar obreiro"
        >
          <Text size="sm">
            Por favor, preencha todos os campos obrigatórios.
          </Text>
        </ErrorDialog>
      
    </>
  );
}
