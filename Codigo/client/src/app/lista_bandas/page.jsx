'use client'
import { Table, Pagination, Container, Button, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import Modal from "react-modal"
import Modalbandas from './modalBands'
import axios from "axios";
import ExcludeModal from '../../components/ExcludeConfirmation/excludeModal'
import ModalCadastroBandas from './modalCadastroBandas'
import styles1 from '../../components/ExcludeConfirmation/excludeModal.module.css'
import stylesCadastro from './bandas.module.css'
import { useUser } from '@auth0/nextjs-auth0/client';
import Negado from "@/components/acessoNegado/acessoNegado";
import stylesCadastroBandas from './modalCadastroBandas.module.css'
import SuccessDialog from "@/components/dialog/SuccessDialog";

import { IconTrashX, IconEdit } from '@tabler/icons-react';
import { IoIosAddCircleOutline } from "react-icons/io";


export default function ListaBandas() {
  const [elements, setElements] = useState([]);
  const [memberNames, setMemberNames] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [openModal1, setOpenModal1] = useState(false);
  const [openModalCadastro, setOpenModalCadastro] = useState(false);
  const [elementId, setelementId] = useState('')
  const [itemType, setitemType] = useState('')
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

  //funções de abertura do modal de exclusão
  function modalOpen1(id) {
    setelementId(id)
    setOpenModal1(!openModal1);

  }
  //fechar o modal de exclusão
  function closeModal1() {
    setOpenModal1(!openModal1);
  }

  const modalOpenCadastro = () => {
    setOpenModalCadastro(!openModalCadastro);
  };

  const closeModalCadastro = () => {
    setOpenModalCadastro(!openModalCadastro);
  };

  // Função para exibir Bandas
  const fetchBandas = async () => {
    const response = await axios.get("https://schedule-server-rfti.onrender.com/bands/");
    setElements(response.data);
  };

  useEffect(() => {
    fetchBandas();
  }, []);

  const rows = elements.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((element) => (
    <Table.Tr key={element.id} className="text-black">
      <Table.Td>{element.nome}</Table.Td>
      <Table.Td>
        <button className="btn_edit" onClick={(e) => { modalOpen(element.id) }}>
          <IconEdit color="red" stroke={1.5} size={30} />
          </button>
      </Table.Td>
      <Table.Td>
        <button onClick={(e) => modalOpen1(element.id)}>
          <IconTrashX color="red" stroke={1.5} size={30} />
          </button>
      </Table.Td>
    </Table.Tr>
  ));

  const { user } = useUser();

  const userHasAccess = user && user['https://BetelApi.com/roles'] && (
    user['https://BetelApi.com/roles'].includes('Lider Louvor')
  );

  useEffect(() => {
    if(dialogMessage != "")setOpenedDialog(true)

  }, [dialogMessage])

  function openDeleteDialog(){
    setDialogMessage("Banda excluida com sucesso!")
  }

  if (userHasAccess) {
    return (
      <>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome da Banda</Table.Th>
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
          contentLabel="Modal Eventos"
          overlayClassName={stylesCadastro.modalOverlay}
          className={stylesCadastro.modalContent}
        >
          <Modalbandas elementId={elementId} fetch={fetchBandas} close={closeModal} />
        </Modal>
        <Modal
          isOpen={openModal1}
          onRequestClose={closeModal1}
          ariaHideApp={false}
          contentLabel="Modal de cancelar"
          overlayClassName={styles1.modalOverlay}
          className={styles1.modalContent}
        >
          <ExcludeModal close={closeModal1} elementId={elementId} fetch={fetchBandas} type={'bands'} exclude={openDeleteDialog}/>
        </Modal>

        <Modal
          isOpen={openModalCadastro}
          onRequestClose={closeModalCadastro}
          ariaHideApp={false}
          contentLabel="Modal de cadastro"
          overlayClassName={stylesCadastroBandas.modalOverlay}
          className={stylesCadastroBandas.modalContent}
        >
          <ModalCadastroBandas close={closeModalCadastro} fetch={fetchBandas} />
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