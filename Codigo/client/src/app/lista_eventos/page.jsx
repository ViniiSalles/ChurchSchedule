'use client';

import Negado from "@/components/acessoNegado/acessoNegado";
import SuccessDialog from "@/components/dialog/SuccessDialog";
import { Table, Container, Button, Pagination, LoadingOverlay, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import Axios from "axios";
import Modal from "react-modal";
import ModalEventos from './modalEventos';
import ModalCadastro from './modalCadastroEventos';
import ExcludeModal from '../../components/ExcludeConfirmation/excludeModal';
import styles from './modalEventos.module.css';
import styles1 from '../../components/ExcludeConfirmation/excludeModal.module.css';
import stylesCadastro from './cadastro_eventos.module.css';
import { useUser } from '@auth0/nextjs-auth0/client';
import { motion } from "framer-motion";
import { IconTrashX, IconEdit } from '@tabler/icons-react';
import { IoIosAddCircleOutline } from "react-icons/io";


export default function ListaEventos() {
  const [elements, setElements] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModalCadastro, setOpenModalCadastro] = useState(false);
  const [elementId, setElementId] = useState('');
  // const [itenType, setItenType] = useState('evento');
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10; // Quantidade de itens por página

  const [dialogMessage, setDialogMessage] = useState("")
  const [openedDialog, setOpenedDialog] = useState(false);

  const closeDialog = () => { setOpenedDialog(false), setDialogMessage("")}

  //state de loader
  const [visible, setVisible] = useState(false);

  const modalOpen = (id) => {
    setElementId(id);
    setOpenModal(!openModal);
  };

  const closeModal = () => {
    setOpenModal(!openModal);
  };

  const modalOpen1 = (id) => {
    setElementId(id);
    setOpenModal1(!openModal1);
  };

  const closeModal1 = () => {
    setOpenModal1(!openModal1);
  };

  const modalOpenCadastro = () => {
    setOpenModalCadastro(!openModalCadastro);
  };

  const closeModalCadastro = () => {
    setOpenModalCadastro(!openModalCadastro);
  };

  const fetchEventos = async () => {
    const response = await Axios.get("https://schedule-server-rfti.onrender.com/events/");
    setElements(response.data);
  };

  const rows = elements
    .slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)
    .map((element, i) => (
      <motion.tr
        key={element.id}
        custom={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: i * 0.2 }}
        className="text-black"
      >
        <motion.td>{element.nameevent}</motion.td>
        <motion.td>{new Date(element.dateevent).toLocaleDateString()}</motion.td>
        <motion.td>{element.hourevent}</motion.td>
        <motion.td>{element.typeevent}</motion.td>
        <motion.td>{element.descevent}</motion.td>
        <motion.td>{element.preletor}</motion.td>
        <motion.td>
          <button onClick={() => modalOpen(element.id)}>
            <IconEdit color="red" stroke={1.5} size={30} />
          </button>
        </motion.td>
        <motion.td>
          <button onClick={() => modalOpen1(element.id)}>
            <IconTrashX color="red" stroke={1.5} size={30} />
          </button>
        </motion.td>
      </motion.tr>
    ));

  useEffect(() => {
    setVisible(true)
    fetchEventos();
    setVisible(false)
  }, []);

  useEffect(() => {
    if(dialogMessage != "")setOpenedDialog(true)
  
  }, [dialogMessage])

  function openDeleteDialog(){
    setDialogMessage("Evento excluido com sucesso!")
  }

  function openEditDialog(){
    setDialogMessage("Evento alterado com sucesso!")
  }

  const { user } = useUser();

  const userHasAccess = user && user['https://BetelApi.com/roles'] && (
    user['https://BetelApi.com/roles'].includes('Pastor')
  );

  if (userHasAccess) {
    return (
      <>
        <LoadingOverlay visible={visible}
          zIndex={1000}
          overlayProps={{ blur: 2 }}
          loaderProps={{ color: '#8c232c' }}
        />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>Data</Table.Th>
              <Table.Th>Hora</Table.Th>
              <Table.Th>Tipo</Table.Th>
              <Table.Th>Descrição</Table.Th>
              <Table.Th>Preletor</Table.Th>
              <Table.Th>Editar</Table.Th>
              <Table.Th>Excluir</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        <Container pt={15} pl={0} pr={0} m={0} fluid className={stylesCadastro.container}>
          <Button onClick={modalOpenCadastro}>
            Novo <IoIosAddCircleOutline color="white" stroke={2.0} size={25} />
          </Button>
          <Pagination
            page={activePage}
            withEdges
            color="#8C232C"
            onChange={setActivePage}
            total={Math.ceil(elements.length / itemsPerPage)}
          />
        </Container>
        <Modal
          isOpen={openModal}
          onRequestClose={closeModal}
          ariaHideApp={false}
          contentLabel="Modal Eventos"
          overlayClassName={styles.modalOverlay}
          className={styles.modalContent}
        >
          <ModalEventos elementId={elementId} fetch={fetchEventos} close={closeModal} edit={openEditDialog}/>
        </Modal>

        <Modal
          isOpen={openModal1}
          onRequestClose={closeModal1}
          ariaHideApp={false}
          contentLabel="Modal de cancelar"
          overlayClassName={styles1.modalOverlay}
          className={styles1.modalContent}
        >
          <ExcludeModal close={closeModal1} elementId={elementId} fetch={fetchEventos} type={'events'} exclude={openDeleteDialog}/>
        </Modal>

        <Modal
          isOpen={openModalCadastro}
          onRequestClose={closeModalCadastro}
          ariaHideApp={false}
          contentLabel="Modal de cadastro"
          overlayClassName={stylesCadastro.modalOverlay}
          className={stylesCadastro.modalContent}
        >
          <ModalCadastro close={closeModalCadastro} fetch={fetchEventos} />
        </Modal>
        <SuccessDialog
          opened={openedDialog}
          onClose={closeDialog}
          title="Operação realizada com exito!"
        >
          <Text size="sm">{dialogMessage}</Text>
        </SuccessDialog>
      </>
    );
  }
  return <Negado />;
}
