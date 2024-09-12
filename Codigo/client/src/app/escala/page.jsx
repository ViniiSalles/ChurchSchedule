"use client";
import {
  Select,
  TextInput,
  Box,
  Container,
  Table,
  Button,
  ScrollArea,
  Title,
  Anchor,
  Text,
  LoadingOverlay,
} from "@mantine/core";
import ErrorDialog from "@/components/dialog/ErrorDialog";
import SuccessDialog from "@/components/dialog/SuccessDialog";
import { useState, useEffect } from "react";
// import { Loader } from "@mantine/core";
// import Layout from "@/components/appLayout/layout";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import Negado from "@/components/acessoNegado/acessoNegado";
import classes from "./escala.module.css";

export default function escala() {
  const [events, setevents] = useState([]); //arraylist de eventos
  const [roles, setroles] = useState([]); //arraylist de cargos
  const [members, setmembers] = useState([]); //arraylist de membros::::
  const [eventId, seteventId] = useState(""); //state contendo o id do evento
  const [ministerioId, setministerioId] = useState(""); //state contendo o nome do ministerio
  const [roleId, setroleId] = useState(""); //state contendo o id do cargo
  const [memberId, setmemberId] = useState(""); //state contendo o id do membro
  const [arrayCargos, setarrayCargos] = useState([]); //state contendo o arraylist de cargos para injetar na tabela
  const [labelCargo, setlabelCargo] = useState(""); //state contendo o nome do cargo
  const [labelMember, setlabelMember] = useState(""); //state contendo o nome do membro
  const [arrayIds, setarrayIds] = useState([]); //array com os ids para o post em scale
  const [indexScale, setindexScale] = useState(0); //state para auxiliar no index de inserção de escalas
  const [editMode, seteditMode] = useState(null);
  const [eventLabel, seteventLabel] = useState("");
  const [volunteer, setvolunteer] = useState(false); //state para setar o campo de texto para voluntario
  const [volName, setvolName] = useState(""); //state pra conter o nome do voluntario
  const [volRole, setvolRole] = useState(""); //variavel contendo o cargo que o voluntário participará
  const [arrayVol, setarrayVol] = useState([]); //array contendo os voluntarios participantes
  const [indexVol, setIndexVol] = useState(0); //array contendo o maior index de ids de voluntarios
  const [preletorNome, setPreletorNome] = useState(""); // Nome do preletor
  // Variaveis Bandas
  const [bands, setBands] = useState([]);
  const [selectedBand, setSelectedBand] = useState("");
  const [bhContent, setBhContent] = useState(null);
  const [width, setwidth] = useState([]);
  const [arrayIndisponibilidade, setArrayIndisponibilidade] = useState([]); //array contendo as informações dos membros indisponiveis

  //states das caixas de erro e dialogo
  const [openedErrorDialog, setOpenedErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("")
  const [openedErrorDialogMessage, setOpenedPositionErrorDialogMessage] = useState(false);

  const [dialogMessage, setDialogMessage] = useState("")
  const [openedDialog, setOpenedDialog] = useState(false);

  const closeDialog = () => { setOpenedDialog(false), setDialogMessage("") }

  //state de loader
  const [visible, setVisible] = useState(false);

  const closeErrorDialog = () => setOpenedErrorDialog(false);
  const closePositionErrorDialogMessage = () => setOpenedPositionErrorDialogMessage(false);


  const handlePreletorChange = (event) => {
    setPreletorNome(event.target.value);
  };

  const atualizarPreletor = async () => {
    try {
      const response = await axios.patch(
        `https://schedule-server-rfti.onrender.com/events/${eventId}/preletor`,
        {
          preletor: preletorNome,
        }
      );
      // console.log("Preletor atualizado:", response.data);
    } catch (error) {
      console.error("Erro ao atualizar preletor:", error);
      setErrorMessage("Erro ao atualizar preletor")
    }
  };
  //função para pegar o ultimo id da tabela escala, para manipulação e adiconar a requisição post de scale
  const getMaxID = async () => {
    try {
      const response = await axios.get(
        "https://schedule-server-rfti.onrender.com/escala-principal/max-id"
      );
      // console.log("o index que veio da requisição é:", response.data.max);
      if (response.data.max != null) {
        setindexScale(response.data.max);
      } else {
        setindexScale(0);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setErrorMessage("Erro ao buscar eventos")
    }

    try {
      const response = await axios.get(
        "https://schedule-server-rfti.onrender.com/volunteers/id/maxid"
      );
      if (response.data != null) {
        setIndexVol(response.data);
      } else {
        setIndexVol(0);
      }
    } catch (error) {
      console.error("Erro ao buscar voluntarios:", error);
      setErrorMessage("Erro ao buscar voluntarios")
    }
  };


  //FUNÇÕES DE EVENTOS-----------------
  //puxa os eventos do bd e joga no state "events"
  const listareventos = async () => {
    try {
      const response = await axios.get("https://schedule-server-rfti.onrender.com/events/");
      setevents(response.data);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setErrorMessage("Erro ao buscar eventos")
    }
  };

  const listaIndisponibilidade = async () => {
    try {
      const response = await axios.get("https://schedule-server-rfti.onrender.com/unavailable");
      setArrayIndisponibilidade(response.data);
      // console.log("OUTROOOOOOO", response.data)

    } catch (error) {
      console.error("Erro ao buscar indisponibilidade:", error);
      setErrorMessage("Erro ao buscar indisponibilidade")
    }
  };


  //cria um array com o nome dos eventos, para ser inserido no select
  const nomeEventos = events.map((event) => ({
    value: event.id.toString(), // Converte o id numérico para string
    label: event.nameevent,
  }));

  //insere o id do evento no state de eventId
  //no select, o value deve possuir o id do elemento, e não sua label!!!!!!!!!!!!!!!!
  const getId = (value, label) => {
    cleanStates()
    seteventId(value);
    seteventLabel(label.label);
    pesquisarEscala(value);
  };


  function cleanStates(){
    setarrayIds([])
    seteditMode(null)
    setarrayCargos([]);
    setarrayVol([]);
    setministerioId("")
    setroleId("")
    setmemberId("")
  }
  //----------------------------------------------------------------------------------------------------------------------------------------------
  //funções para a pesquisa de eventos

  //consome as informações da escala de determinado evento(busca por id)
  const pesquisarEscala = async (value) => {
    if (value != "") {
      setVisible(true)
      try {
        let arrayEscalas = []
        let arrayVolantes = []
        try {
          const response = await axios.get(
            `https://schedule-server-rfti.onrender.com/escala-principal/${value}`
          );
          const events = response.data;
          arrayEscalas = response.data
          let localArrayCargos = [];
          if (events.length != 0) seteditMode(true);
          seteventId(events[0].ideventos);

          for (let event of events) {
            const idE = event.ideventos;
            const nomeEven = await buscarInfo2(idE);
            const nomeDesc = await buscarInfo(event.idcargos);
            const nomeMin = await buscarInfo0(event.idcargos);
            const nomeMem = await buscarInfo1(event.idmembro);

            localArrayCargos.push({
              idEvento: idE,
              idevento: nomeEven,
              idMinisterio: nomeMin,
              idCargo: nomeDesc,
              idObreiro: nomeMem,
            });
          }
          setarrayIds(response.data);
          setarrayCargos(localArrayCargos);

        } catch (e) {
          console.error(e)
        }

        try {
          const response = await axios.get(
            `https://schedule-server-rfti.onrender.com/volunteers/${value}`
          );
          arrayVolantes = response.data
          setarrayVol(response.data)
        } catch (e) {
          console.log("erro vol");
        }

        if (arrayEscalas.length != 0 || arrayVolantes.length != 0) {
          seteditMode(true)
          setVisible(false)
        } else {
          seteditMode(false)
        }


        try {
          const response = await axios.get(
            `https://schedule-server-rfti.onrender.com/events/getpreletor/${value}`
          );
          setPreletorNome(response.data.preletor);
        } catch (e) {
          console.log("erro preletor");
        }

      } catch (error) {
        console.error("Escala não encontrada");
        setarrayCargos([]);
        setarrayVol([]);
        gerarTabela(arrayCargos);
        getMaxID();
      }
      localStorage.removeItem("idevent");
    } else {
      console.log("value vazio")
    }
  };

  //estas funçoes buscam os nomes no bd, utilizando os ids, os nomes serão utilizados para a montagem da tabela
  const buscarInfo = async (value) => {
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/escala/name/${value}`
      );
      return response.data[0].descricao;
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
    }
  };

  const buscarInfo0 = async (value) => {
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/escala/ministerio/name/${value}`
      );
      return response.data[0].ministerio;
    } catch (error) {
      console.error("Erro ao buscar mmebros:", error);
    }
  };

  const buscarInfo1 = async (value) => {
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/members/name-id/name/${value}`
      );
      return response.data[0].name;
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
    }
  };

  const buscarInfo2 = async (value) => {
    if (value != "") {
      try {
        const response = await axios.get(
          `https://schedule-server-rfti.onrender.com/events/name/${value}`
        );
        return response.data[0].nameevent;
      } catch (error) {
        console.error("Erro ao buscar membros:", error);
        // setErrorMessage("Erro ao buscar membros")
      }
    } else {
      console.log("value vazio")
    }
  };



  //-----------------------------------------------------------------------------------------------------------------

  //FUNÇÕES DE MINISTERIOS----------------------------------------------------------------------------------------
  //define o enum de ministerios a ser utilizado nas rotas
  const minLabels = [
    { value: "diaconia", label: "Diaconia" },
    { value: "louvor", label: "Louvor" },
    { value: "midia", label: "Mídia" },
    { value: "voluntarios", label: "Voluntários" },
  ];

  //insere no state de ministerios o ministerio a ser utilizado na rota
  const getMinEnum = (value) => {
    if (value == "voluntarios") {
      setvolunteer(true);
      setministerioId(value);
    } else {
      setvolunteer(false);
      listaMembros(value);
      setministerioId(value);
      listarRoles(value);
    }
  };

  //função responsavel pela criação da tabela de banco de horas de determinado ministerio no mês do evento selecionado
  const buscarTabelaBH = async () => {
    let month = "";
    for (const e of events) {
      if (e.id == eventId) {
        month = e.dateevent.substring(5, 7);
      }
    }
    const currentyear = new Date().getFullYear();
    let maxday = getLastDayOfMonth(month);
    const minDate = currentyear + "-" + month + "-01";
    let joinResult = [];
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/escala-principal/min/${minDate}/max/${maxday}`
      );
      joinResult = response.data;
    } catch (error) {
      console.error("Erro ao realizar join:", error);
      setErrorMessage("Erro ao atualizar tabela de banco de horas")
    }

    let arrayBH = []; //array inicial para a montagem da tabela de banco de horas

    for (const e of joinResult) {
      if (arrayBH.length == 0) {
        arrayBH.push({
          id: e.idmembro,
          name: e.name,
          diaconia: e.diaconia,
          midia: e.midia,
          louvor: e.louvor,
          cargo: e.idcargo,
          totalEscalas: 0,
        });
      } else {
        let found = false;
        for (const j of arrayBH) {
          if (j.id == e.idmembro) {
            found = true;
            break;
          }
        }
        if (!found) {
          arrayBH.push({
            id: e.idmembro,
            name: e.name,
            diaconia: e.diaconia,
            midia: e.midia,
            louvor: e.louvor,
            cargo: e.idcargos,
            totalEscalas: 0,
          });
        }
      }
    }

    if (ministerioId == "diaconia") {
      for (const j of arrayBH) {
        let diac = 0;
        for (const e of joinResult) {
          if (e.idcargos >= 12 && e.idcargos <= 16 && j.id == e.idmembro)
            diac = diac + 1;
        }
        j.totalEscalas = diac;
      }
    } else if (ministerioId == "louvor") {
      for (const j of arrayBH) {
        let louv = 0;
        for (const e of joinResult) {
          if (
            ((e.idcargos >= 1 && e.idcargos <= 6) || e.idcargos == 17) &&
            j.id == e.idmembro
          )
            louv = louv + 1;
        }
        j.totalEscalas = louv;
      }
    } else if (ministerioId == "midia") {
      for (const j of arrayBH) {
        let mid = 0;
        for (const e of joinResult) {
          if (e.idcargos >= 7 && e.idcargos <= 11 && j.id == e.idmembro)
            mid = mid + 1;
        }
        j.totalEscalas = mid;
      }
    }
    tratararrayBh(arrayBH);
  };

  //função responsavel por remover membros que não estão cadastrados no ministerio selecionado, ordenar o array, e deixar apenas os 5 membros com menos escalas
  function tratararrayBh(array) {
    let newArray = [];

    if (ministerioId == "diaconia") {
      for (const e of array) {
        if (e.diaconia) {
          newArray.push(e); //insere apenas membros cadastrados na diaconia
        }
      }
    } else if (ministerioId == "louvor") {
      for (const e of array) {
        if (e.louvor) {
          newArray.push(e); //insere apenas membros cadastrados no louvor
        }
      }
    } else if (ministerioId == "midia") {
      for (const e of array) {
        if (e.midia) {
          newArray.push(e); //insere apenas membros cadastrados na midia
        }
      }
    }

    //inserção de membros faltantes do bh
    let arrayBH = insercaoMembrosFaltantes(newArray);
    arrayBH.sort(ordenarPorEscalaçãoTotal); //ordena o array em ordem crescente com relação as vezes escalados

    if (arrayBH.length > 5) {
      //verifica se o array possui mais de 5 elementos, se possuir, mantem apenas os 5 primeiros, se não, gera a tabela normalmente
      let arrayReduzido = arrayBH.slice(0, 5); //mantem apenas os 5 primeiros registros
      gerarTabelaBH(arrayReduzido); //insere apenas membros cadastrados na diaconia
    } else {
      gerarTabelaBH(arrayBH); //insere apenas membros cadastrados na diaconia
    }
  }

  function insercaoMembrosFaltantes(newArrrrrray) {
    let arrayaux = [];
    for (const e of members) {
      arrayaux.push({
        id: e.id,
        name: e.name,
        diaconia: e.diaconia,
        midia: e.midia,
        louvor: e.louvor,
        cargo: -1,
        totalEscalas: 0,
      });
    }

    for (const e of arrayaux) {
      let found = false;
      for (const j of newArrrrrray) {
        if (e.id == j.id) {
          found = true;
        }
      }

      if (found == false) {
        newArrrrrray.push(e);
      }
    }

    return newArrrrrray;
  }

  function ordenarPorEscalaçãoTotal(a, b) {
    //função para ordenação crescente por ordem de escalas
    return a.totalEscalas - b.totalEscalas;
  }

  function gerarTabelaBH(array) {
    if (ministerioId != "voluntarios") {
      const rows = array.map((cargo, index) => (
        <Table.Tr key={index} className={classes.tablerow}>
          <Table.Td className={classes.tableData}>{cargo.name}</Table.Td>
          <Table.Td className={classes.tableData}>
            {cargo.totalEscalas}
          </Table.Td>
        </Table.Tr>
      ));

      const table = (
        <>
          <Title order={4} className={classes.tabletit}>
            {ministerioId}
          </Title>
          <Table>
            <Table.Tr>
              <Table.Th className={classes.tableHead}>Membro</Table.Th>
              <Table.Th className={classes.tableHead}>Escalas</Table.Th>
            </Table.Tr>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </>
      );

      // setwidth(570)
      setmodifiedWidthValues();
      setBhContent(table);
    } else {
      setInitialWidthValues();
      setBhContent(null);
    }
  }

  //função para retornar o ultimo dia do mês
  function getLastDayOfMonth(month) {
    // Parse the month string to an integer and subtract 1 because JavaScript months are 0-based
    const monthIndex = parseInt(month, 10) - 1;
    // Get the current year
    const year = new Date().getFullYear();
    // Create a date object for the first day of the next month
    const nextMonth = new Date(year, monthIndex + 1, 1);
    // Subtract one day to get the last day of the specified month
    nextMonth.setDate(nextMonth.getDate() - 1);
    // Format the date to a string
    const lastDay = nextMonth.toISOString().split("T")[0];
    return lastDay;
  }

  //-----------------------------------------------------------------------------------------------------------------

  //FUNÇÕES DE CARGOS------------------------------------------------------------------------------------------------
  //puxa os cargos do bd e joga no state "roles"
  const listarRoles = async (value) => {
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/escala/ministerio/${value}`
      );
      setroles(response.data);
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
      setErrorMessage("Erro ao buscar cargos")
    }
  };

  // insere os cargos no select de cargos
  const cargosMin = roles.map((role) => ({
    value: role.id.toString(),
    label: role.descricao,
  }));

  //insere o id do cargo no state "roleId"
  const getRoleId = (value, label) => {
    setroleId(value);
    setlabelCargo(label.label);
  };
  //-----------------------------------------------------------------------------------------------------------------

  //FUNÇÕES DE MEMBROS DO MINISTERIO-----------------------------------------------------------------------------------
  //GET dos obreiros relacionados ao ministerio do bd
  const listaMembros = async (value) => {
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/members/ministerio/${value}`
      );
      setmembers(response.data);
    } catch (error) {
      console.error("Erro ao buscar membros:", error);
      // setErrorMessage("Erro ao buscar membros")
    }
  };

  //insere os membros do respectivo ministerio no select de membros
  const membros = members.map((mem) => ({
    value: mem.id.toString(),
    label: mem.name,
  }));

  //insere o id do membro no state "memberId"
  const getmemberId = (value, label) => {
    setmemberId(value);
    setlabelMember(label.label);
  };
  //---------------------------------------------------------------------------------------------------------------

  //essa função vai atualizar a tabela sempre que mudar o state arraycargos
  useEffect(() => {
    //função para gerar as linhas da tabela
    gerarTabela(arrayCargos);
    setVisible(false)
  }, [arrayCargos]);



  useEffect(() => {
    gerarTabelaVol(arrayVol);
  }, [arrayVol]);

  //esta função serve para inserir os dados dos states das labels, para criar a tabela a partir de um arraylist, e para
  //inserir os dados dos states dos ids dos itens selecionados, para fazer as requisições post a partir do botão SALVAR
  function escalar() {
    if (volunteer) {
      let newArr = arrayVol;

      if (!Array.isArray(newArr)) {
        newArr = [newArr];
      }
      const newIndexScale = indexVol + 2;
      setIndexVol(newIndexScale);
      let escalaVol = {
        id: newIndexScale,
        nome: volName,
        cargo: volRole,
        idevent: eventId,
      };
      const newescalaVol = [...newArr, escalaVol];
      setarrayVol(newescalaVol);
    } else {
      // if (editMode == false) {
      const newIndexScale = indexScale + 1;
      setindexScale(newIndexScale);
      // Criar um novo objeto para a nova entrada
      let escala = {
        idEvento: eventId,
        idevento: eventLabel,
        idMinisterio: ministerioId,
        idCargo: labelCargo,
        idObreiro: labelMember,
      };
      let escalaIds = {
        id: newIndexScale,
        idcargos: roleId,
        ideventos: eventId,
        idmembro: memberId,
      };

      // Criar um novo array com todos os itens antigos, mais a nova entrada
      const newEscalaCargos = [...arrayCargos, escala];
      const newEscalaIds = [...arrayIds, escalaIds];

      verificarConflitosMembro(newEscalaIds, memberId);
      verificarConflitosCargo(newEscalaIds, newEscalaCargos);
      verificarIndisponibilidade(memberId);

      // Atualizar o estado com o novo array
      setarrayCargos(newEscalaCargos);
      setarrayIds(newEscalaIds);

    }
  }

  //=======================================================================
  //Adições Bruno

  // Fetch bands from the server
  const fetchBands = async () => {
    try {
      const response = await axios.get("https://schedule-server-rfti.onrender.com/bands");
      const formattedData = response.data.map((band) => ({
        label: band.nome || "Desconhecido", // Verifica se nomeBanda existe
        value: band.id ? band.id.toString() : "0", // Verifica se id existe
      }));
      setBands(formattedData);
    } catch (error) {
      console.error("Erro ao buscar bandas:", error);
      setErrorMessage("Erro ao buscar bandas")
    }
  };

  const handleButtonClick = async () => {
    if (!eventId) {
      setErrorMessage("Por favor, selecione um evento antes de escalar a banda.");
      return;
    }

    try {
      setVisible(true)
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/levitas/${selectedBand}`
      );
      const membersAndRoles = response.data.map((item) => ({
        idCargo: buscarInfo(item.idroles),
        idObreiro: buscarInfo1(item.idmember),
        idevento: eventLabel,
        idEvento: eventId, // Adiciona o ID do evento para referência
        idMinisterio: buscarInfo0(item.idroles),
      }));

      let escalaBandsIdsss = [];

      let newIndexScale = indexScale + 1;
      for (const e of response.data) {
        const idd = newIndexScale;
        const idcargoss = e.idroles;
        const ideventoss = eventId;
        const idmembroo = e.idmember;
        escalaBandsIdsss.push({
          id: idd,
          idcargos: idcargoss,
          ideventos: ideventoss,
          idmembro: idmembroo,
        });
        newIndexScale = newIndexScale + 1;
      }

      for (const e of escalaBandsIdsss) {
        arrayIds.push(e);
      }
      // Atualizar a tabela com os membros e cargos
      setarrayCargos((prevArrayCargos) => [
        ...prevArrayCargos,
        ...membersAndRoles,
      ]);
      //setarrayIds(newEscalaIds);
      setVisible(false)
    } catch (error) {
      setVisible(false)
      console.error("Erro ao buscar membros da banda:", error);
      setErrorMessage("Erro ao buscar membros da banda")
    }
  };

  // Handle band selection
  const handleBandChange = (value) => {
    setSelectedBand(value);
  };

  useEffect(() => {
    fetchBands();
  }, []);



  //funcionalidades para a geração de tabelas da interface
  function gerarTabela(arrayCargos) {
    if (arrayCargos == 0) {
      const rows = (
        <Table.Tr>
          <Table.Td colSpan={5} style={{ textAlign: "center" }}>
            Evento ainda não escalado
          </Table.Td>
        </Table.Tr>
      );
      return rows;
    } else {
      const rows = arrayCargos.map((cargo, index) => (
        <Table.Tr key={index} className={classes.tablerow}>
          <Table.Td className={classes.tableData}>{cargo.idevento}</Table.Td>
          <Table.Td className={classes.tableData}>
            {cargo.idMinisterio}
          </Table.Td>
          <Table.Td className={classes.tableData}>{cargo.idCargo}</Table.Td>
          <Table.Td className={classes.tableData}>{cargo.idObreiro}</Table.Td>
          <Table.Td className={classes.tableData}>
            <Button
              onClick={() => removerCargo(index, false)}
              className={classes.buttons}
            >
              Excluir
            </Button>
          </Table.Td>
        </Table.Tr>
      ));
      return rows;
    }
  }

  function gerarTabelaVol(arrayVol) {
    // Verifica se arrayVol é um objeto e não um array
    if (!Array.isArray(arrayVol)) {
      // Se arrayVol for um objeto, transforma-o em um array
      arrayVol = [arrayVol];
    }

    // Verifica se o array está vazio
    if (arrayVol.length === 0) {
      const rows = (
        <Table.Tr>
          <Table.Td colSpan={5} style={{ textAlign: "center" }}>
            Voluntários ainda não escalados
          </Table.Td>
        </Table.Tr>
      );
      return rows;
    } else {
      // console.log(arrayVol);
      const rows = arrayVol.map((cargo, index) => (
        <Table.Tr key={index} className={classes.tablerow}>
          <Table.Td className={classes.tableData}>{eventLabel}</Table.Td>
          <Table.Td className={classes.tableData}>{cargo.cargo}</Table.Td>
          <Table.Td className={classes.tableData}>{cargo.nome}</Table.Td>
          <Table.Td className={classes.tableData}>
            <Button
              onClick={() => removerCargo(index, true)}
              className={classes.buttons}
            >
              Excluir
            </Button>
          </Table.Td>
        </Table.Tr>
      ));
      return rows;
    }
  }

  //funcionalidade para modificar o campo de acordo com o ministerio, se for voluntario, entra um campo de texto
  function gerarCampoMembro(volun) {
    // console.log(volun);
    if (volun) {
      const input = (
        <>
          <div className="flex-initial">
            <TextInput
              w={width.cargo}
              className={classes.marginR10}
              label="Cargo do voluntário:"
              placeholder="Digite o Cargo"
              // w={220}
              onChange={(event) => setvolRole(event.currentTarget.value)}
            />
          </div>
          <div className="flex-initial w-64">
            <TextInput
              w={width.obreiro}
              label="Nome do voluntário:"
              placeholder="Digite o voluntário"
              // w={246}
              onChange={(event) => setvolName(event.currentTarget.value)}
            />
          </div>
        </>
      );

      return input;
    } else {
      const input = (
        <>
          <div className="flex-initial">
            <Select
              w={width.cargo}
              className={classes.infoSelect}
              label="Selecione o cargo"
              placeholder="Digite o Cargo"
              value={roleId}
              onChange={getRoleId}
              data={cargosMin}
              searchable
              comboboxProps={{
                transitionProps: { transition: "pop", duration: 200 },
              }}
            />
          </div>
          <div className="flex-initial w-64">
            <Select
              w={width.obreiro}
              className={classes.infoSelect}
              label="Selecione o Obreiro"
              placeholder="Digite o Obreiro"
              value={memberId}
              onChange={getmemberId}
              data={membros}
              searchable
              maxDropdownHeight={150}
              comboboxProps={{
                transitionProps: { transition: "pop", duration: 200 },
              }}
            />
          </div>
        </>
      );
      return input;
    }
  }

  useEffect(() => {
    //função para gerar as linhas da tabela
    gerarCampoMembro(volunteer);
  }, [volunteer]);

  //excluir cargo
  function removerCargo(index, bool) {
    if (bool == true) {
      let newArray = arrayVol;
      if (!Array.isArray(newArray)) {
        // Se arrayVol for um objeto, transforma-o em um array
        newArray = [newArray];
      }
      const newEscalaVols = newArray.filter((_, i) => i !== index);
      const newwIndexScale = indexVol - 2;
      setIndexVol(newwIndexScale);
      setarrayVol(newEscalaVols);
    } else {
      // novaEscala()
      const newEscalaCargos = arrayCargos.filter((_, i) => i !== index);
      const newArrayIds = arrayIds.filter((_, i) => i !== index);
      const newwIndexScale = indexScale - 1;
      setindexScale(newwIndexScale);
      setarrayCargos(newEscalaCargos);
      setarrayIds(newArrayIds);
    }
  }

  const salvarEscala = (arrayIds, eventId, arrayVol) => {
    if (arrayIds.length == 0 && arrayVol.length == 0) {
      setErrorMessage("Sem dados para serem salvos, por favor, insira as escalas para o evento")
    } else {
      setVisible(true)
      const atualizarPreletor = async () => {
        try {
          await axios.patch(`https://schedule-server-rfti.onrender.com/events/${eventId}/preletor`, {
            preletor: preletorNome,
          });
        } catch (error) {
          setVisible(false)
          setErrorMessage("Falha ao atualizar preletor")
          throw new Error("Falha ao atualizar preletor");
        }
      };

      if (editMode == false) {
        atualizarPreletor()
          .then(() => {
            let promises = arrayIds.map((escale) =>
              axios.post("https://schedule-server-rfti.onrender.com/escala-principal/", {
                id: escale.id,
                idCargos: escale.idcargos,
                idEventos: escale.ideventos,
                idMembro: escale.idmembro,
              })
            );

            if (arrayVol.length > 0) {
              promises = promises.concat(
                arrayVol.map((escale) =>
                  axios.post("https://schedule-server-rfti.onrender.com/volunteers/", {
                    id: escale.id,
                    nome: escale.nome,
                    cargo: escale.cargo,
                    idevent: escale.idevent,
                  })
                )
              );
            }

            Promise.all(promises)
              .then(() => {
                setVisible(false)
                setDialogMessage("Escala cadastrada com sucesso");
                setarrayCargos([]);
                setarrayVol([]);
              })
              .catch((error) => {
                setVisible(false)
                console.error("Erro ao salvar escala", error);
                setErrorMessage("Erro ao salvar escala")
              });
          })
          .catch((error) => {
            setVisible(false)
            console.error("Falha ao atualizar informações do evento:", error);
            setErrorMessage("Falha ao atualizar informações do evento")
          });
      } else {
        atualizarPreletor()
          .then(() => {
            modificarEscala(eventId, arrayIds);
            modificarEscalaVol(eventId, arrayVol);
          })
          .catch((error) => {
            setVisible(false)
            console.error("Falha ao atualizar informações do evento:", error);
            setErrorMessage("Falha ao atualizar informações do evento")
          });
      }
    }
    cleanStates()
  };

  //--------------------------------------------------------------------------------
  //funções de alterações da escala de voluntarios
  async function excluir2(id) {
    // console.log(arrayIds)
    try {
      await axios.delete(`https://schedule-server-rfti.onrender.com/volunteers/delete/${id}`);
    } catch (error) {
      setVisible(false)
      console.error("Erro ao excluir voluntario:", error);
      setErrorMessage("Erro ao excluir voluntario")
      throw error; // Re-lança o erro para ser capturado mais tarde
    }
  }

  async function atualizarEscala1(arrayVol) {
    if (arrayVol.length === 0) {
    } else {
      let promises = arrayVol.map((escale) =>
        axios.post(`https://schedule-server-rfti.onrender.com/volunteers/`, {
          id: escale.id,
          nome: escale.nome,
          cargo: escale.cargo,
          idevent: escale.idevent,
        })
      );

      try {
        const results = await Promise.all(promises);
        // console.log("Todas as escalas foram atualizadas com sucesso", results);
        return results;
      } catch (error) {
        setVisible(false)
        console.error("Erro ao atualizar escalas", error);
        setErrorMessage("Erro ao atualizar escalas")
        throw error;
      }
    }
  }

  function modificarEscalaVol(eventid, arrayVol) {
    setVisible(true)
    excluir2(eventid)
      .then(() => {
        // console.log(
        //   "Exclusão  de voluntario completada, iniciando atualização"
        // );
        return atualizarEscala1(arrayVol);
      })
      .then(() => {
        setVisible(false)
        setDialogMessage("Escala alterada com sucesso");
      })
      .catch((error) => {
        setVisible(false)
        console.error(
          "Ocorreu um erro durante a modificação da escala:",
          error
        );
        setErrorMessage("Ocorreu um erro durante a modificação da escala")
      });
  }
  //------------------------------------------------------------------------------------------------------

  //funções de alteração de escala de obreiros
  // função de exclusão
  async function excluir1(id) {
    // console.log(arrayIds)
    try {
      await axios.delete(`https://schedule-server-rfti.onrender.com/escala-principal/delete/${id}`);
    } catch (error) {
      setVisible(false)
      console.error("Erro ao excluir:", error);
      setErrorMessage("Erro ao excluir")
      throw error; // Re-lança o erro para ser capturado mais tarde
    }
  }

  // Este seria o código que manipula a atualização
  async function atualizarEscala(eventId, arrayIds) {
    let promises = arrayIds.map((escale) =>
      axios.post(`https://schedule-server-rfti.onrender.com/escala-principal/edit/${eventId}`, {
        id: escale.id, // Se necessário, ainda assim a geração de ID pode ser desnecessária
        idcargos: escale.idcargos,
        ideventos: escale.ideventos,
        idmembro: escale.idmembro, // Corrigido para idMembro
      })
    );

    try {
      const results = await Promise.all(promises);
      console.log("Todas as escalas foram atualizadas com sucesso", results);
      return results;
    } catch (error) {
      setVisible(false)
      console.error("Erro ao atualizar escalas", error);
      setErrorMessage("Erro ao atualizar escalas")
      throw error;
    }
  }

  // Função para executar a exclusão e, em seguida, a atualização
  function modificarEscala(eventId, arrayIds) {
    setVisible(true)
    excluir1(eventId)
      .then(() => {
        // console.log("Exclusão completada, iniciando atualização");
        return atualizarEscala(eventId, arrayIds);
      })
      .then(() => {
        setVisible(false)
        setDialogMessage("Escala alterada com sucesso");
      })
      .catch((error) => {
        setVisible(false)
        console.error(
          "Ocorreu um erro durante a modificação da escala:",
          error
        );
        setErrorMessage("Ocorreu um erro durante a modificação da escala")
      });
  }
  //-----------------------------------------------------------------------------------------------

  //função p/ verificar se existem inconsistencias na escala do evento(utiliza o id do membro como parametro)(verifica se o membro se encontra duplicado no array de ids, e remove a ultima aparição do mesmo)
  function verificarConflitosMembro(arrayIds, memberId) {
    const arraySize = arrayIds.length - 2;
    if (arrayIds.length > 1) {
      if (memberId == arrayIds[arraySize].idmembro) {
        setErrorMessage("Inconsistencia detectada ao tentar inserir na escala, o membro já foi escalado previamente.")
      }
    }
  }

  function verificarIndisponibilidade(memberId) {
    let eventDate = '';
    for (const e of events) {
      if (e.id == eventId) {
        eventDate = e.dateevent;
      }
    }


    const refDate = new Date('2020-01-01:00:00:000Z')
    let date = new Date(eventDate)




    for (let j = 0; j < arrayIndisponibilidade.length; j++) {
      if (memberId == arrayIndisponibilidade[j].idmembro) {

        let dataInicio = new Date(arrayIndisponibilidade[j].datainicio)
        let dataFinal = new Date(arrayIndisponibilidade[j].datafim)

        const diferencaMilissegundos = Math.abs(dataInicio - refDate);
        const daysSinceRefInicio = Math.ceil(diferencaMilissegundos / (1000 * 60 * 60 * 24));
        const diferencaMilissegundos1 = Math.abs(dataFinal - refDate);
        const daysSinceRefFinal = Math.ceil(diferencaMilissegundos1 / (1000 * 60 * 60 * 24));
        const diferencaMilissegundos2 = Math.abs(date - refDate);
        const daysSinceRefEvent = Math.ceil(diferencaMilissegundos2 / (1000 * 60 * 60 * 24));

        if (daysSinceRefEvent >= daysSinceRefInicio && daysSinceRefEvent <= daysSinceRefFinal) {
          setOpenedErrorDialog(true)
          break;
        }
      }
    }
  }

  function verificarConflitosCargo(arrayIds, arrayCargos) {
    let encontrado = false;
    const arraySize = arrayIds.length;
    for (let i = 0; i < arraySize && !encontrado; i++) {
      let id = arrayIds[i].idcargos;
      for (let j = i + 1; j < arraySize && !encontrado; j++) {
        if (id == arrayIds[j].idcargos) {
          setErrorMessage("Não foi possivel inserir o membro na escala, a posição já foi escalada previamente.")
          arrayIds.splice(j, 1);
          arrayCargos.splice(j, 1);
          getMaxID().then(() => {
            let index = indexScale + 1;
            setindexScale(index);
          });
          encontrado = true;
        }
      }
    }
  }

  function setInitialWidthValues() {
    const widthValues = {
      evento: 850,
      banda: 707,
      min: 328,
      preletor: 512,
      cargo: 328,
      obreiro: 406,
      cont: 754,
    };
    setwidth(widthValues);
  }

  function setmodifiedWidthValues() {
    const widthValues = {
      evento: 570,
      banda: 427,
      min: 208,
      preletor: 352,
      cargo: 208,
      obreiro: 256,
      cont: 570,
    };
    setwidth(widthValues);
  }


  useEffect(() => {
    if (editMode == false) {
      setVisible(false)
      setDialogMessage("evento não possui escalas");
    }
  }, [editMode]);

  useEffect(() => {
    seteventLabel(buscarInfo2(eventId));
  }, [eventId]);

  useEffect(() => {
    if (eventLabel != "") pesquisarEscala(eventId);
  }, [eventLabel]);

  useEffect(() => {
    const LSid = localStorage.getItem("idevent");
    if (LSid != null) {
      seteventId(LSid);
    }
  }, [events]);

  useEffect(() => {
    if (errorMessage != "") setOpenedPositionErrorDialogMessage(true)
  }, [errorMessage]);

  useEffect(() => {
    if (ministerioId != "" && !members.length == 0) {
      buscarTabelaBH();
    }
  }, [ministerioId, members]);

  //executa ao iniciar a pagina
  useEffect(() => {
    setInitialWidthValues();
    listareventos();
    listaIndisponibilidade();
    getMaxID();
  }, []);

  const { user } = useUser();
  const userHasAccess =
    user &&
    user["https://BetelApi.com/roles"] &&
    (user["https://BetelApi.com/roles"].includes("Pastor") ||
      user["https://BetelApi.com/roles"].includes("Lider") ||
      user["https://BetelApi.com/roles"].includes("Lider Louvor"));

  useEffect(() => {
    if (dialogMessage != "") setOpenedDialog(true)

  }, [dialogMessage])

  if (userHasAccess) {
    return (
      <>
        <Box>
          <LoadingOverlay visible={visible}
            zIndex={1000}
            overlayProps={{ blur: 2 }}
            loaderProps={{ color: '#8c232c' }}
          />
          <Container className={classes.container} w={850}>
            <div className="flex flex-col">
              <Container id={classes.selectContainer} w={850} p={0}>
                <Container p={0}>
                  <Select
                    w={width.evento}
                    label="Selecione o evento"
                    placeholder="Selecione o evento"
                    value={eventId}
                    onChange={getId}
                    data={nomeEventos}
                    searchable
                    maxDropdownHeight={150}
                    comboboxProps={{
                      transitionProps: { transition: "pop", duration: 200 },
                    }}
                  />
                  {eventId != "" && (
                    <div className="flex">
                      <Select
                        w={width.min}
                        className={classes.marginR10}
                        label="Selecione o ministerio"
                        placeholder="Selecione o ministerio"
                        value={ministerioId}
                        onChange={getMinEnum}
                        data={minLabels}
                        searchable
                        comboboxProps={{
                          transitionProps: { transition: "pop", duration: 200 },
                        }}
                        limit={4}
                      />
                      <TextInput
                        w={width.preletor}
                        className={classes.w_22R}
                        type="text"
                        value={preletorNome}
                        onChange={handlePreletorChange}
                        label="Nome do Preletor"
                        withAsterisk
                      />
                    </div>)}
                  {ministerioId == "louvor" && (
                    <div className="flex">
                      <Select
                        w={width.banda}
                        className={classes.w_25R}
                        label="Selecione uma Banda"
                        placeholder="Selecione uma Banda"
                        data={bands}
                        onChange={handleBandChange}
                        value={selectedBand}
                        searchable
                        maxDropdownHeight={150}
                        comboboxProps={{
                          transitionProps: { transition: "pop", duration: 200 },
                        }}
                        mr={10}
                      />
                      <div className="flex items-end">
                        <Button
                          onClick={handleButtonClick}
                          className={classes.buttons}
                        >
                          Escalar Banda
                        </Button>
                      </div>
                    </div>)}
                  {ministerioId != "" && (
                    <Container className={classes.containerrrr} w={width.evento}>
                      <Container className={classes.containerrrr} w={width.cont}>
                        {gerarCampoMembro(volunteer)}
                      </Container>
                      <div className="flex items-end">
                        <Button
                          onClick={escalar}
                          className={classes.button}
                          w={96}
                        >
                          Escalar
                        </Button>
                      </div>
                    </Container>)}
                </Container>
                <Container w={260} ml={20} pl={0} pr={0}>
                  {bhContent}
                </Container>
              </Container>
              <div className={classes.tables}>
                <ScrollArea h={310}>
                  <div className={classes.tablediv}>
                    <div className={classes.tabletit}>Membros</div>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th className={classes.tableHead}>
                            Evento
                          </Table.Th>
                          <Table.Th className={classes.tableHead}>
                            Ministerio
                          </Table.Th>
                          <Table.Th className={classes.tableHead}>
                            Cargo
                          </Table.Th>
                          <Table.Th className={classes.tableHead}>
                            Obreiro
                          </Table.Th>
                          <Table.Th className={classes.tableHead}>
                            Excluir
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{gerarTabela(arrayCargos)}</Table.Tbody>
                    </Table>
                  </div>
                  <div className={classes.tablediv}>
                    <div className={classes.tabletit}>Voluntários</div>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th className={classes.tableHead}>
                            Evento
                          </Table.Th>
                          <Table.Th className={classes.tableHead}>
                            Cargo
                          </Table.Th>
                          <Table.Th className={classes.tableHead}>
                            Voluntário
                          </Table.Th>
                          <Table.Th className={classes.tableHead}>
                            Excluir
                          </Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{gerarTabelaVol(arrayVol)}</Table.Tbody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>
            </div>
            {(arrayCargos.length != 0 || arrayVol.length != 0) && (
              <Container className={classes.buttonContainer}>
                <Button
                  onClick={(e) => {
                    salvarEscala(arrayIds, eventId, arrayVol);
                  }}
                  className={classes.buttons}
                  id={classes.savebutton}
                >
                  Salvar
                </Button>
              </Container>)}
            <ErrorDialog
              opened={openedErrorDialog}
              onClose={closeErrorDialog}
              title="Obreiro indisponivel"

            >
              <Text size="sm" c="black">Obreiro indisponivel para a data do evento, consulte a  <Anchor href="/indisponibilidade" target="_blank">Lista de indisponibilidade</Anchor> para mais informações</Text>

            </ErrorDialog>
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
          </Container>
        </Box>
      </>
    );
  }

  return <Negado></Negado>;
}
