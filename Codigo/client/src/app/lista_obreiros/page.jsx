'use client'

// import Layout from "@/components/appLayout/layout";
import { Table, Container, Button, Pagination, Text } from "@mantine/core"
import Axios from "axios";
import { useEffect, useState } from "react";

import Modal from "react-modal"
import ModalObreiros from './modalObreiros'
import styles from './modalObreiros.module.css'
import ExcludeModal from '../../components/ExcludeConfirmation/excludeModal'
import ModalCadastroObreiros from './modalCadastroObreiros'
import stylesCadastro from './modalCadastroObreiro.module.css'
import styles1 from '../../components/ExcludeConfirmation/excludeModal.module.css'
import { motion } from "framer-motion";
import SuccessDialog from "@/components/dialog/SuccessDialog";

import { IconTrashX, IconEdit } from '@tabler/icons-react';
import { IoIosAddCircleOutline } from "react-icons/io";
import Negado from "@/components/acessoNegado/acessoNegado";
import { useUser } from "@auth0/nextjs-auth0/client";


export default function ListaObreiros() {

  const [elements, setelements] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModalCadastro, setopenModalCadastro] = useState(false);
  const [elementId, setelementId] = useState('')
  const [itenType, setitenType] = useState('membro')
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10; // Quantidade de itens por página

  const [dialogMessage, setDialogMessage] = useState("")
  const [openedDialog, setOpenedDialog] = useState(false);

  const closeDialog = () => { setOpenedDialog(false), setDialogMessage("")}

  //funções de abertura e fechamento do modal
  function modalOpen(id) {
    setelementId(id)
    setOpenModal(!openModal);

  }

  function closeModal() {
    setOpenModal(!openModal);
  }

  //Função de abertura do modal de exclusão
  function modalOpen1(id) {
    setelementId(id)
    setOpenModal1(!openModal1);
  }

  //fechar o modal de exclusão
  function closeModal1() {
    setOpenModal1(!openModal1);
  }

  //funções de abertura e fechamento do modal de cadastro
  function modalOpenCadastro() {
    setopenModalCadastro(!openModalCadastro);
  }

  function closeModalCadastro() {
    setopenModalCadastro(!openModalCadastro);
  }


  // Função para exibir membro
  const fetchMembros = async () => {
    const response = await Axios.get("https://schedule-server-rfti.onrender.com/members/");
    setelements(response.data)
  }


  useEffect(() => {
    fetchMembros()
  }, [])

  //Codigo para exibir os ministérios filiados
  const filiacoesText = (diaconia, louvor, midia) => {
    const filiacoes = [];

    if (diaconia) {
      filiacoes.push("Diaconia");
    }
    if (louvor) {
      filiacoes.push("Louvor");
    }
    if (midia) {
      filiacoes.push("Midia");
    }

    return filiacoes.join(', ');
  }


  const rows = elements.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((elements, i) => (
    <motion.tr
      key={elements.id}
      custom={i}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: i * 0.2 }}
      className="text-black"
    >
      <motion.td>{elements.name}</motion.td>
      <motion.td>{elements.telefone}</motion.td>
      <motion.td>{filiacoesText(elements.diaconia, elements.louvor, elements.midia)}</motion.td>
      <motion.td>
        <button onClick={() => { modalOpen(elements.id) }}>
          <IconEdit color="red" stroke={1.5} size={30} />
        </button>
      </motion.td>
      <motion.td>
        <button onClick={() => { modalOpen1(elements.id) }}>
          <IconTrashX color="red" stroke={1.5} size={30} />
        </button>
      </motion.td>
    </motion.tr>
  ));

  const { user } = useUser();

  const userHasAccess = user && user['https://BetelApi.com/roles'] && (
    user['https://BetelApi.com/roles'].includes('Lider') ||
    user['https://BetelApi.com/roles'].includes('Lider Louvor')
  );


  useEffect(() => {
    if(dialogMessage != "")setOpenedDialog(true)

  }, [dialogMessage])

  function openEditDialog(){
    setDialogMessage("Membro alterado com sucesso!")
    console.log("mensagem alterada")
  }

  function openDeleteDialog(){
    setDialogMessage("Membro excluido com sucesso!")
  }
  if (userHasAccess) {
    return (
      <>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome do Obreiro</Table.Th>
              <Table.Th>Telefone do Obreiro</Table.Th>
              <Table.Th>Ministerios Filiados</Table.Th>
              <Table.Th>Editar</Table.Th>
              <Table.Th>Excluir</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
        <Container pt={15} pl={0} pr={0} m={0} fluid className={stylesCadastro.container}>
          <Button onClick={() => { modalOpenCadastro() }}>
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
          contentLabel="Modal Obreiros"
          overlayClassName={styles.modalOverlay}
          className={styles.modalContent}
        >
          <ModalObreiros elementId={elementId} fetch={fetchMembros} close={closeModal} edit={openEditDialog}/>
        </Modal>

        <Modal
          isOpen={openModal1}
          onRequestClose={closeModal1}
          ariaHideApp={false}
          contentLabel="Modal de cancelar"
          overlayClassName={styles1.modalOverlay}
          className={styles1.modalContent}
        >
          <ExcludeModal close={closeModal1} elementId={elementId} fetch={fetchMembros} type={itenType} exclude={openDeleteDialog}/>
        </Modal>

        <Modal
          isOpen={openModalCadastro}
          onRequestClose={closeModalCadastro}
          ariaHideApp={false}
          contentLabel="Modal de cadastro"
          overlayClassName={stylesCadastro.modalOverlay}
          className={stylesCadastro.modalContent}
        >
          <ModalCadastroObreiros close={closeModalCadastro} fetch={fetchMembros} />
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

  return <Negado></Negado>
}
