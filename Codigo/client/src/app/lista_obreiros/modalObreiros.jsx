import { useState, useEffect } from 'react';
import Axios from "axios";
import { IMaskInput } from 'react-imask';
import { useForm } from "@mantine/form";
import { TextInput, Button, Group, Box, Checkbox, LoadingOverlay, Text } from "@mantine/core";
import ErrorDialog from "@/components/dialog/ErrorDialog";

export default function CadastroObreiros({ elementId, fetch, close, edit }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [openedErrorDialog, setOpenedErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")

  //state de loader
  const [visible, setVisible] = useState(false);


  const closeErrorDialog = () => setOpenedErrorDialog(false);
  const form = useForm({
    initialValues: {
      name: "",
      telefone: "",
      diaconia: false,
      midia: false,
      louvor: false,
    },
  });

  // useEffect(() => {
  //   const handleDoubleClick = () => {
  //     if (openedDialog) closeDialog();
  //   };
  //   // Adiciona o ouvinte de evento de clique duplo ao documento
  //   document.addEventListener('dblclick', handleDoubleClick);

  //   // Remove o ouvinte de evento quando o componente é desmontado
  //   return () => {
  //     document.removeEventListener('dblclick', handleDoubleClick);
  //   };
  // }, [openedDialog]);

  useEffect(() => {
    if (!isLoaded) {
      const fetchMembro = async () => {
        try {
          setVisible(true)
          const response = await Axios.get(`https://schedule-server-rfti.onrender.com/members/${elementId}`);
          if (response.data) {
            const { name, telefone, diaconia, louvor, midia } = response.data;
            // Atualiza os valores do formulário com os dados recebidos apenas uma vez
            form.setValues({ name, telefone, diaconia, louvor, midia });
            setIsLoaded(true); // Indica que os dados foram carregados
            setVisible(false)
          }
        } catch (error) {
          setVisible(false)
          setErrorMessage("Erro ao buscar Membro")
          console.error("Erro ao buscar membro:", error);
        }
      };
      fetchMembro();
    }
  }, [elementId, form, isLoaded]);

  const alterarMembro = async () => {
    const values = form.values;
    try {
      setVisible(true)
      await Axios.put(`https://schedule-server-rfti.onrender.com/members/${elementId}`, values).then(() => {
        setVisible(false)
        fetch();
        edit();
        close();
      });
    } catch (error) {
      setVisible(false)
      setErrorMessage("Erro ao editar Membro")
      console.error("Erro ao editar Membro:", error);
    }
  };

  // useEffect(() => {
  //   if(openedDialog == true) close();
  // }, [openedDialog]);

  useEffect(() => {
    if (errorMessage != "") setOpenedErrorDialog(true)
  }, [errorMessage]);

  return (
    <>
      <Box mx="auto" style={{ maxWidth: 340 }}>
        <LoadingOverlay visible={visible}
          zIndex={1000}
          overlayProps={{ blur: 2 }}
          loaderProps={{ color: '#8c232c' }}
        />
        <h1>Edição de obreiro:</h1>
        <form onSubmit={form.onSubmit(() => alterarMembro())}>
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
          <Group position="right" mt="md">
            <Button type="submit">Salvar</Button>
          </Group>
        </form>
      <ErrorDialog
              opened={openedErrorDialog}
              onClose={closeErrorDialog}
              title="Erro"
            >
              <Text size="sm" c="black">{errorMessage}</Text>

            </ErrorDialog>
      </Box>
    </>
  );
}
