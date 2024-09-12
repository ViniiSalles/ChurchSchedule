import React, { useEffect, useState } from 'react';
import { useForm } from "@mantine/form";
import { TextInput, Button, Group, Box, Select, Table, ActionIcon, ScrollArea, Title, Divider, Notification, LoadingOverlay, Text } from "@mantine/core";
import { IconCheck, IconX } from '@tabler/icons-react';
import axios from 'axios';

export default function CadastroBands({ elementId, fetch }) {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState('');
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [levitas, setLevitas] = useState([]);
  const [members, setMembers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [showNameChangeNotification, setShowNameChangeNotification] = useState(false);

  //state de loader
  const [visible, setVisible] = useState(false);




  const form = useForm({
    initialValues: {
      name: "",
    },
  });

  const fetchBandaById = async () => {
    // setVisible(true)
    try {
      const response = await axios.get(`https://schedule-server-rfti.onrender.com/bands/${elementId}`);
      if (response.data) {
        form.setValues({ name: response.data.nome });
      }
      // setVisible(false)
    } catch (error) {
      // setVisible(false)
      console.error("Erro ao buscar banda por ID:", error);
    }
  };

  const updateBandName = async (newName) => {
    setVisible(true)
    try {
      await axios.put(`https://schedule-server-rfti.onrender.com/bands/${elementId}`, { nome: newName });
      setVisible(false)
      fetch()
      setShowNameChangeNotification(true);
      setTimeout(() => setShowNameChangeNotification(false), 3000); // Hide notification after 3 seconds
    } catch (error) {
      setVisible(false)
      console.error("Erro ao atualizar nome da banda:", error);
    }
  };

  const handleSubmit = (values) => {
    updateBandName(values.name);
  };

  const fetchLevitas = async () => {
    // setVisible(true)
    try {
      const response = await axios.get('https://schedule-server-rfti.onrender.com/members/levi');
      const formattedData = response.data.map(member => ({
        label: member.name,
        value: member.id.toString()
      }));
      setElements(formattedData);
      // setVisible(false)
    } catch (error) {
      // setVisible(false)
      console.error("Erro ao buscar sugestões de membros:", error);
    }
  };

  const fetchRoles = async () => {
    // setVisible(true)
    try {
      const response = await axios.get(`https://schedule-server-rfti.onrender.com/escala/ministerio/louvor`);
      const formattedData = response.data.map(role => ({
        label: role.descricao,
        value: role.id.toString()
      }));
      setRoles(formattedData);
      // setVisible(false)
    } catch (error) {
      // setVisible(false)
      console.error("Erro ao buscar cargos:", error);
    }
  };

  const fetchAllMembers = async () => {
    // setVisible(true)
    try {
      const response = await axios.get('https://schedule-server-rfti.onrender.com/members');
      setMembers(response.data);
      // setVisible(false)
    } catch (error) {
      // setVisible(false)
      console.error("Erro ao buscar membros:", error);
    }
  };

  const fetchAllRoles = async () => {
    // setVisible(true)
    try {
      const response = await axios.get('https://schedule-server-rfti.onrender.com/escala/ministerio');
      setAllRoles(response.data);
      // setVisible(false)
    } catch (error) {
      // setVisible(false)
      console.error("Erro ao buscar cargos:", error);
    }
  };

  const fetchMemberBand = async () => {
    // setVisible(true)
    try {
      const response = await axios.get(`https://schedule-server-rfti.onrender.com/levitas/${elementId}`);
      const formattedData = response.data.map(levita => ({
        id: levita.id,
        idMember: levita.idmember,
        idRole: levita.idroles
      }));
      setLevitas(formattedData);
      // setVisible(false)
    } catch (error) {
      // setVisible(false)
      console.error("Erro ao buscar levitas:", error);
    }
  };

  const postLevita = async () => {
    setVisible(true)
    try {
      await axios.post("https://schedule-server-rfti.onrender.com/levitas", {
        idMember: selectedElement,
        idRoles: selectedRole,
        idBand: elementId
      });
      console.log("Levita adicionado com sucesso!");
      setSelectedElement('');
      setSelectedRole('');
      fetchMemberBand();
      setVisible(false)
      fetch()
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000); // Hide notification after 3 seconds
    } catch (error) {
      setVisible(false)
      console.error("Erro ao adicionar levita:", error);
    }
  };

  const deleteLevita = async (id) => {
    // setVisible(true)
    try {
      await axios.delete(`https://schedule-server-rfti.onrender.com/levitas/${id}`);
      console.log("Levita excluído com sucesso!");
      fetchMemberBand();
      // setVisible(false)
    } catch (error) {
      // setVisible(false)
      console.error("Erro ao excluir levita:", error);
    }
  };

  useEffect(() => {
    setVisible(true)
    fetchBandaById();
    fetchLevitas();
    fetchRoles();
    fetchMemberBand();
    fetchAllMembers();
    fetchAllRoles();
    setVisible(false)
  }, [elementId]);

  const handleElementChange = (value) => {
    setSelectedElement(value);
    console.log('Selected Levita:', value);
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    console.log('Selected Role:', value);
  };

  const getMemberName = (id) => {
    const member = members.find(member => member.id === id);
    return member ? member.name : 'Desconhecido';
  };

  const getRoleDescription = (id) => {
    const role = allRoles.find(role => role.id === id);
    return role ? role.descricao : 'Desconhecido';
  };

  return (
    // <main>
      <Box mx="auto" style={{ maxWidth: 800 }}>
        <LoadingOverlay visible={visible}
          zIndex={1000}
          overlayProps={{ blur: 2 }}
          loaderProps={{ color: '#8c232c' }}
        />
        <ScrollArea h={480}>
        <Title order={1} align="center" mt="md">Editar Banda</Title>
        <Divider my="sm" />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Nome da Banda"
            {...form.getInputProps('name')}
            required
          />
          <Group position="right" mt="md">
            <Button type="submit">Alterar Nome</Button>
          </Group>
        </form>
        <Divider my="sm" />
        <Select
          label="Selecione o Levita"
          placeholder="Digite o Levita"
          data={elements}
          value={selectedElement}
          onChange={handleElementChange}
          searchable
          maxDropdownHeight={150}
          styles={{ dropdown: { zIndex: 3050 } }}
        />
        <Select
          label="Selecione a Função"
          placeholder="Selecione uma função"
          data={roles}
          value={selectedRole}
          onChange={handleRoleChange}
          searchable
          styles={{ dropdown: { zIndex: 1050 } }}
        />
        <Group position="right" mt="md">
          <Button onClick={postLevita}>Adicionar Levita</Button>
        </Group>
        <Divider my="sm" />
          <Table
            highlightOnHover
            horizontalSpacing="md"
            verticalSpacing="xs"
            sx={{
              tableLayout: 'fixed',
              width: '100%',
              'thead th': { backgroundColor: '#f0f0f0', textAlign: 'center' },
              'tbody tr:nth-of-type(odd)': { backgroundColor: '#fafafa' },
              'tbody tr:nth-of-type(even)': { backgroundColor: '#ffffff' },
              'tbody tr:hover': { backgroundColor: '#e9f0fa' },
              borderCollapse: 'collapse',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
            }}
          >
            <thead>
              <tr>
                <th style={{ width: '33%' }}>Levita</th>
                <th style={{ width: '33%' }}>Cargo</th>
                <th style={{ width: '33%' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {levitas.map(levita => (
                <tr key={levita.id}>
                  <td style={{ textAlign: 'center' }}>{getMemberName(levita.idMember)}</td>
                  <td style={{ textAlign: 'center' }}>{getRoleDescription(levita.idRole)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <ActionIcon color="red" onClick={() => deleteLevita(levita.id)}>
                      X
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollArea>
        {showNameChangeNotification && (
          <Notification
            icon={<IconCheck size={18} />}
            color="teal"
            title="Sucesso"
            onClose={() => setShowNameChangeNotification(false)}
          >
            Nome da banda alterado com sucesso!
          </Notification>
        )}
        {showNotification && (
          <Notification
            icon={<IconCheck size={18} />}
            color="teal"
            title="Sucesso"
            onClose={() => setShowNotification(false)}
          >
            Levita adicionado com sucesso!
          </Notification>
        )}
      </Box>
    // </main>
  );
}
