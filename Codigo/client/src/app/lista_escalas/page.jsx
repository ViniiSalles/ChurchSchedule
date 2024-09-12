"use client";

import { Table, Pagination, Container, LoadingOverlay, Text } from "@mantine/core";
import Modal from "react-modal";
import Axios from "axios";
import { useEffect, useState } from "react";
import styles from "./listaEscalas.module.css";
import ModalEvent from "../../components/modalEvent.jsx/ModalEvent.jsx";
import CancelModal from "../../components/ExcludeConfirmation/excludeModal";
import styles1 from "../../components/ExcludeConfirmation/excludeModal.module.css";
import stylesCadastro from './listaEscalas.module.css';
import Negado from "@/components/acessoNegado/acessoNegado";
import { useUser } from "@auth0/nextjs-auth0/client";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import SuccessDialog from "@/components/dialog/SuccessDialog";


export default function ListaEscalas() {
  const [events, setevents] = useState([]); //armazena o conteudo recebido via banco de dados ao iniciar a pagina
  const [arrayIds, setarrayIds] = useState([]); //array utilizado para armazenar os ids dos eventos para futuras buscas
  const [eventsInfo, seteventsInfo] = useState({}); // array utilizado para armazenar dados dos eventos (nome, data etc)
  const [arrayLabels, setarrayLabels] = useState([]); //array que vai armazenar os nomes dos membros e das posições(servirá como fonte de dados para gerar os cards)
  const [finalArray, setfinalArray] = useState([]); //array final
  const [openModal1, setOpenModal1] = useState(false);
  const [elementId, setelementId] = useState("");
  const [arrayVol, setarrayVol] = useState([]); //utilizado para armazenar os dados dos voluntarios
  const [modalOpened, setModalOpened] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 2; // Quantidade de itens por página

  //state de loader
  const [visible, setVisible] = useState(false);

  //states da caixa de erro
  const [errorMessage, setErrorMessage] = useState("")
  const [openedErrorDialogMessage, setOpenedPositionErrorDialogMessage] = useState(false);

  const [dialogMessage, setDialogMessage] = useState("")
  const [openedDialog, setOpenedDialog] = useState(false);

  const closeDialog = () => { setOpenedDialog(false), setDialogMessage("") }

  const closePositionErrorDialogMessage = () => setOpenedPositionErrorDialogMessage(false);


  const handleOpenModal = (event) => {
    setCurrentEvent(event);
    setModalOpened(true);
  };

  // Função para coletar os dados das escalas do bd
  const fetchEventos = async () => {
    const response = await Axios.get(
      "https://schedule-server-rfti.onrender.com/escala-principal/tabela-escala"
    );
    // console.log(response.data)
    setevents(response.data);
    const responseVol = await Axios.get("https://schedule-server-rfti.onrender.com/volunteers/all");
    const responseEventos = await Axios.get("https://schedule-server-rfti.onrender.com/events/eventId");
    let arrayyids = []
    for (const e of responseEventos.data) {
      arrayyids.push(e.id);
    }
    setarrayIds(arrayyids)
    // console.log(responseVol.data)
    setarrayVol(responseVol.data);
  };

  //função que carrega as informações dos eventos no bd, e insere em um state
  async function carregarEventsInfo(arrayIds) {
    let eventArray = [];
    const responses = await Promise.all(
      arrayIds.map(async (id) => {
        const response = await Axios.get(`https://schedule-server-rfti.onrender.com/events/${id}`);
        let evento = response.data;
        eventArray.push(evento);
        return response.data;
      })
    );
    seteventsInfo(eventArray);
  }

  //função p/ carregar os ids dos eventos cadastrados no bd
  // const carregarIds = async () => {
  //   let array = [];
  //   if (events.length != 0) {
  //     for (let i = 0; i < events.length; i++) {
  //       array.push(events[i].ideventos);
  //     }
  //     //função para excluir ids repetidos do array
  //   var novaArr = array.filter((este, i) => {
  //     return array.indexOf(este) === i;
  //   });
  //   setarrayIds(novaArr);
  //   } else {
  //    let arrays = await getEventsId()
  //    let arrayyids = []
  //    for(const e of arrays){
  //     arrayyids.push(e.id);
  //    }
  //    console.log("aaaaaa")
  //    console.log(arrayyids)
  //    setarrayIds(arrayyids)

  //   }
  // }

  const getEventsId = async () => {
    try {
      const response = await Axios.get("https://schedule-server-rfti.onrender.com/events/eventId");
      return response.data
    } catch (e) {
      console.error(e)
    }
  }

  //esta função cria um array contendo os nomes do membro, posição e ministerio, seguido do id 
  const criarArrayLabels = async () => {
    let arrayFinal = []
    let arr = await Promise.all(events.map(async (event) => {
      const idAf = event.ideventos
      const minName = await buscarInfo0(event.idcargos)
      const cargoName = await buscarInfo2(event.idcargos)
      const memberName = await buscarInfo1(event.idmembro)
      let array = { ideventos: idAf, ministerio: minName, posicao: cargoName, membro: memberName }
      arrayFinal.push(array)
    }));
    setarrayLabels(arrayFinal)
  }




  //função pra pegar o ministerio via id
  const buscarInfo0 = async (value) => {
    try {
      const response = await Axios.get(
        `https://schedule-server-rfti.onrender.com/escala/ministerio/name/${value}`
      );
      // console.log(response.data[0].ministerio)
      return response.data[0].ministerio;
    } catch (error) {
      setErrorMessage("Erro ao buscar membros:");
      console.error(error)
    }
  };

  //escala para buscar o nome do membro via id
  const buscarInfo1 = async (value) => {
    try {
      const response = await Axios.get(
        `https://schedule-server-rfti.onrender.com/members/name-id/name/${value}`
      );
      return response.data[0].name;
    } catch (error) {
      setErrorMessage("Erro ao buscar membros")
      console.error("Erro ao buscar mmebros:", error);
    }
  };

  //busca o nome da posição via id
  const buscarInfo2 = async (value) => {
    try {
      const response = await Axios.get(
        `https://schedule-server-rfti.onrender.com/escala/name/${value}`
      );
      // console.log(response.data[0].ministerio)
      return response.data[0].descricao;
    } catch (error) {
      setErrorMessage("Erro ao buscar cargo:")
      console.error("Erro ao buscar cargo: ", error);
    }
  };

  function createFinalArray() {
    let ArrayF = [];
    for (let i = 0; i < arrayIds.length; i++) {
      let arrI = [];
      for (let j = 0; j < arrayLabels.length; j++) {
        if (arrayIds[i] == arrayLabels[j].ideventos) {
          arrI.push(arrayLabels[j]);
        }
      }
      ArrayF.push(arrI);
    }
    setfinalArray(ArrayF);
  }

  //função responsavel por setar o id do evento no localStorage, para que a pagina de ecição carregue as informações do evento(recebe o id do evento como argumento, e o insere no LS)
  function setLocalStorageItem(id) {
    localStorage.setItem("idevent", id);
    // console.log(id)
    // navigate("/escala/");
  }

  function gerarLista() {
    let newArray = []
    let foundScale = false;


    for (let j = 0; j < eventsInfo.length; j++) {
      for (const e of finalArray) {
        if (e.length != 0) {
          if (e[0].ideventos == eventsInfo[j].id) {
            foundScale = true
          }
        }
      }
      newArray.push({
        nameevent: eventsInfo[j].nameevent,
        id: eventsInfo[j].id,
        dateevent: eventsInfo[j].dateevent,
        descevent: eventsInfo[j].descevent,
        hourevent: eventsInfo[j].hourevent,
        preletor: eventsInfo[j].preletor,
        typeevnt: eventsInfo[j].typeevent,
        foundScale: foundScale,
      })
      foundScale = false
    }

    for (let j = 0; j < eventsInfo.length; j++) {
      const rows = newArray.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage).map((event, index) => (
        <div key={index} id={styles.tableDiv}>
          <Table>
            <Table.Thead>
              <Table.Tr className={styles.nameArea}>
                <Table.Th
                  className={styles.nome_evento}
                  id={styles.eventName}
                  onClick={() => handleOpenModal(event)}
                >
                  {event.nameevent}
                </Table.Th>
                <Table.Th></Table.Th>
                <Table.Th></Table.Th>
                <Table.Th id={styles.excludeButton}>
                  <button onClick={(e) => { setLocalStorageItem(event.id); }} id={styles.edButton}>
                    <a href="/escala" id={styles.edButton}>
                      Editar
                    </a>
                  </button>
                  {event.foundScale && (
                    <button onClick={(e) => { modalOpen1(event.id); }} id={styles.exButton}>
                      Excluir
                    </button>)}
                </Table.Th>
              </Table.Tr>
              <Table.Tr>
                <Table.Th className={styles.tableHead} w={150}>
                  Voluntários
                </Table.Th>
                <Table.Th className={styles.tableHead} w={150}>
                  Diaconia
                </Table.Th>
                <Table.Th className={styles.tableHead} w={150}>
                  Louvor
                </Table.Th>
                <Table.Th className={styles.tableHead} w={150}>
                  Mídia
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td className={styles.tableData} w={150}>
                  {gerarVoluntarios(arrayVol, event.id)}
                </Table.Td>
                <Table.Td className={styles.tableData} w={150}>
                  {gerarDiaconia(finalArray, event.id)}
                </Table.Td>
                <Table.Td className={styles.tableData} w={150}>
                  {gerarLouvor(finalArray, event.id)}
                </Table.Td>
                <Table.Td className={styles.tableData} w={150}>
                  {gerarMidia(finalArray, event.id)}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
            <Table.Caption>
              Clique no nome do evento para mais informações
            </Table.Caption>
          </Table>

        </div>

      ));
      return rows;
    }
  }

  function gerarVoluntarios(arrayVol, id) {
    const elements = [];
    const arrayVazio = "Sem voluntários escalados";
    for (let i = 0; i < arrayVol.length; i++) {
      if (arrayVol[i].idevent == id) {
        elements.push(
          <div key={arrayVol[i].id}>
            <b>{arrayVol[i].cargo}:</b> {arrayVol[i].nome}
          </div>
        );
      }
    }
    if (elements.length === 0) {
      //verifica se existem membros escalados no ministerio
      return arrayVazio; //retorna mensagem de aviso
    } else {
      return <>{elements}</>; // Retorna os elementos como componentes JSX
    }
  }

  function gerarDiaconia(finalArray, id) {
    const elements = [];
    const arrayVazio = "Sem membros escalados";
    for (let i = 0; i < finalArray.length; i++) {
      if (finalArray[i].length != 0) {
        if (finalArray[i][0].ideventos === id) {
          finalArray[i].forEach((element) => {
            if (element.ministerio === "diaconia") {
              elements.push(
                <div key={element.posicao}>
                  <b>{element.posicao}:</b> {element.membro}
                </div>
              );
            }
          });
          break; // Isso garante que o loop para depois de adicionar os elementos para um evento específico
        }
      }
    }
    if (elements.length === 0) {
      //verifica se existem membros escalados no ministerio
      return arrayVazio; //retorna mensagem de aviso
    } else {
      return <>{elements}</>; // Retorna os elementos como componentes JSX
    }
  }

  function gerarLouvor(finalArray, id) {
    const elements = [];
    const arrayVazio = "Sem membros escalados";
    for (let i = 0; i < finalArray.length; i++) {
      if (finalArray[i].length != 0) {
        if (finalArray[i][0].ideventos === id) {
          finalArray[i].forEach((element) => {
            if (element.ministerio === "louvor") {
              elements.push(
                <div key={element.posicao}>
                  <b>{element.posicao}:</b> {element.membro}
                </div>
              );
            }
          });
          break; // Encerra o loop após adicionar os elementos de um evento específico
        }
      }
    }

    if (elements.length === 0) {
      //verifica se existem membros escalados no ministerio
      return arrayVazio; //retorna mensagem de aviso
    } else {
      return <>{elements}</>; // Retorna os elementos como componentes JSX
    }
  }

  function gerarMidia(finalArray, id) {
    const elements = [];
    const arrayVazio = "Sem membros escalados";
    for (let i = 0; i < finalArray.length; i++) {
      if (finalArray[i].length != 0) {
        if (finalArray[i][0].ideventos === id) {
          finalArray[i].forEach((element) => {
            if (element.ministerio === "midia") {
              elements.push(
                <div key={element.posicao}>
                  <b>{element.posicao}:</b> {element.membro}
                </div>
              );
            }
          });
          break; // Encerra o loop após adicionar os elementos de um evento específico
        }
      }
    }
    if (elements.length === 0) {
      //verifica se existem membros escalados no ministerio
      return arrayVazio; //retorna mensagem de aviso
    } else {
      return <>{elements}</>; // Retorna os elementos como componentes JSX
    }
  }

  const excludeScale = async (id) => {
    try {
      await Axios.delete(`https://schedule-server-rfti.onrender.com/escala-principal/delete/${id}`);
      await Axios.delete(`https://schedule-server-rfti.onrender.com/volunteers/delete/${id}`);
      alert("Excluido Com Sucesso!!!");
      fetchEventos();
    } catch (error) {
      setErrorMessage("Erro ao excluir")
      console.error("Erro ao excluir:", error);
    }
  };

  // //Toggle feature
  // useEffect(() => {
  //   carregarIds();
  // }, [events]);

  useEffect(() => {
    setVisible(true)
    carregarEventsInfo(arrayIds);
    criarArrayLabels();
  }, [arrayIds]);

  useEffect(() => {
    createFinalArray();
  }, [arrayLabels]);

  useEffect(() => {
    gerarLista()
    setVisible(false)
  }, [finalArray]);

  useEffect(() => {
    if (errorMessage != "") setOpenedPositionErrorDialogMessage(true)
  }, [errorMessage]);


  //funções de abertura e fechamento do modal de exclusão
  function modalOpen1(id) {
    setelementId(id);
    setOpenModal1(!openModal1);
  }
  //fechar o modal de exclusão
  function closeModal1() {
    setOpenModal1(!openModal1);
  }

  //executa assim que a pagina é carregada
  useEffect(() => {
    fetchEventos();
  }, []);

  const { user } = useUser();

  const userHasAccess = user && user['https://BetelApi.com/roles'] && (
    user['https://BetelApi.com/roles'].includes('Pastor') ||
    user['https://BetelApi.com/roles'].includes('Lider') ||
    user['https://BetelApi.com/roles'].includes('Lider Louvor')
  );

  useEffect(() => {
    if (dialogMessage != "") setOpenedDialog(true)

  }, [dialogMessage])

  function openDeleteDialog() {
    setDialogMessage("Escala excluida com sucesso!")
  }

  if (userHasAccess) {
    return (
      <>
        <LoadingOverlay visible={visible}
          zIndex={1000}
          overlayProps={{ blur: 2 }}
          loaderProps={{ color: '#8c232c' }}
        />
        {gerarLista()}
        <Container pt={15} pl={0} pr={0} m={0} fluid className={stylesCadastro.container}>
          <Pagination
            page={activePage}
            withEdges
            color="#8C232C"
            onChange={setActivePage}
            total={Math.ceil(eventsInfo.length / itemsPerPage)}
          />
        </Container>
        <ModalEvent
          modalOpened={modalOpened}
          setModalOpened={setModalOpened}
          currentEvent={currentEvent}
        />
        <Modal
          isOpen={openModal1}
          onRequestClose={closeModal1}
          ariaHideApp={false}
          contentLabel="Modal de cancelar"
          overlayClassName={styles1.modalOverlay}
          className={styles1.modalContent}
        >
          <CancelModal
            close={closeModal1}
            elementId={elementId}
            fetch={fetchEventos}
            type={"escala"}
            exclude={openDeleteDialog}
          />
        </Modal>
        <ErrorDialog
          opened={openedErrorDialogMessage}
          onClose={closePositionErrorDialogMessage}
          title="Erro"

        >
          <Text size="sm" c="black">{errorMessage}</Text>

        </ErrorDialog>
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
