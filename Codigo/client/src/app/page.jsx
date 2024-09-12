"use client";
import ReactDOMServer from 'react-dom/server';
import ReactDOM from 'react-dom';
import { MantineProvider } from '@mantine/core'
import { registerLicense } from "@syncfusion/ej2-base";
import Layout from "@/components/appLayout/layout";
import {
  ScheduleComponent,
  Month,
  Agenda,
  Inject,
  ViewsDirective,
  ViewDirective,
} from "@syncfusion/ej2-react-schedule";
import { Container, Table } from "@mantine/core";
import { useState, useEffect } from "react";
import axios from "axios";
import classes from "./home.module.css";
import "./material.css";

registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXpfdXVQQ2ddVEZ0XkA="
);



//para corrigir o bug das datas dos eventos no calendario, esta função foi alterada, em caso de bug na prod, mexer aqui
const fetchData = async () => {
  try {
    const response = await axios.get("https://schedule-server-rfti.onrender.com/events/");
    for (const e of response.data) {
      e.hourevent = e.hourevent.split(":");
    }
    return response.data.map((event) => {
      const startTime = new Date(event.dateevent);
      startTime.setHours(parseInt(event.hourevent[0], 10), parseInt(event.hourevent[1], 10), 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2);

      return {
        Id: event.id,
        Subject: event.nameevent,
        StartTime: startTime,
        EndTime: endTime,
        IsAllDay: false,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return [];
  }
};

const fieldsData = {
  id: "Id",
  subject: { name: "Subject" },
  isAllDay: { name: "IsAllDay" },
  startTime: { name: "StartTime" },
  endTime: { name: "EndTime" },
};

export default function Home() {
  const [events, setevents] = useState([]);
  const [scalesID, setScalesID] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");
  //variaveis do balacobaco
  // const [finalevents, setfinalevents] = useState([])  //armazena o array final de eventos
  const [arrayIds, setarrayIds] = useState([]); //array utilizado para armazenar os ids dos eventos para futuras buscas
  const [eventsInfo, seteventsInfo] = useState({}); // array utilizado para armazenar dados dos eventos (nome, data etc)
  const [arrayLabels, setarrayLabels] = useState([]); //array que vai armazenar os nomes dos membros e das posições(servirá como fonte de dados para gerar os cards)
  const [finalArray, setfinalArray] = useState([]); //array final
  const [arrayVol, setarrayVol] = useState([]); //utilizado para armazenar os dados dos voluntarios

  // Função para coletar os dados das escalas do bd
  const fetchEventos = async () => {
    const response = await axios.get(
      "https://schedule-server-rfti.onrender.com/escala-principal/tabela-escala"
    );
    setScalesID(response.data);
    const responseVol = await axios.get("https://schedule-server-rfti.onrender.com/volunteers/all");
    setarrayVol(responseVol.data);
  };

  function carregarIds() {
    let array = [];
    for (let i = 0; i < scalesID.length; i++) {
      array.push(scalesID[i].ideventos);
    }

    //função para excluir ids repetidos do array
    var novaArr = array.filter((este, i) => {
      return array.indexOf(este) === i;
    });

    setarrayIds(novaArr);
    carregarEventsInfo(novaArr)
  }

  async function carregarEventsInfo(arrayIds) {
    let eventArray = [];
    const responses = await Promise.all(
      arrayIds.map(async (id) => {
        const response = await axios.get(`https://schedule-server-rfti.onrender.com/events/${id}`);
        let evento = response.data;
        eventArray.push(evento);
        return response.data;
      })
    );
    seteventsInfo(eventArray);
  }

  //esta função cria um array contendo os nomes do membro, posição e ministerio, seguido do id
  const criarArrayLabels = async () => {
    let arrayFinal = [];
    let arr = await Promise.all(
      scalesID.map(async (event) => {
        const idAf = event.ideventos;
        const minName = await buscarInfo0(event.idcargos);
        const cargoName = await buscarInfo2(event.idcargos);
        const memberName = await buscarInfo1(event.idmembro);
        let array = {
          ideventos: idAf,
          ministerio: minName,
          posicao: cargoName,
          membro: memberName,
        };
        arrayFinal.push(array);
      })
    );
    setarrayLabels(arrayFinal);
  };

  //função pra pegar o ministerio via id
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

  //escala para buscar o nome do membro via id
  const buscarInfo1 = async (value) => {
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/members/name-id/name/${value}`
      );
      return response.data[0].name;
    } catch (error) {
      console.error("Erro ao buscar mmebros:", error);
    }
  };

  //busca o nome da posição via id
  const buscarInfo2 = async (value) => {
    try {
      const response = await axios.get(
        `https://schedule-server-rfti.onrender.com/escala/name/${value}`
      );
      // console.log(response.data[0].ministerio)
      return response.data[0].descricao;
    } catch (error) {
      console.error("Erro ao buscar cargo: ", error);
    }
  };



  useEffect(() => {
    console.log("Não acredito que quase chorei de emoção quando a ficha caiu que o t.i tinha acabado :(")
    const loadData = async () => {
      const data = await fetchData();
      setevents(data);
    };
    fetchEventos();
    loadData();
  }, []);



  useEffect(() => {
    carregarIds()
    criarArrayLabels();
  }, [scalesID]);



  const eventSettings = { dataSource: events, fields: fieldsData };



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
    return (ArrayF);
  }



  function gerarTabela(finalArray, id) {
    let found = false
    let elements = ''
    let arrayaux = []
    const arrayVazio = "Sem membros escalados";
    for (let i = 0; i < finalArray.length; i++) {
      if (finalArray[i][0].ideventos === id) {
        finalArray[i].forEach((element) => {
          arrayaux.push(element)
           // elements = elements + `\n\n${element.posicao}: ${element.membro}\n\n`
        });
        found = true
        break; // Isso garante que o loop para depois de adicionar os elementos para um evento específico
      }
    }

const rows = arrayaux.map((element, index) => (
  <Table.Tr key={index}>
  <Table.Td  w={60}>
    {element.posicao}
  </Table.Td>
  <Table.Td  w={90}>
    {element.membro}
  </Table.Td>
  </Table.Tr>
));


    if (found == false) {
      //verifica se existem membros escalados no ministerio
      return arrayVazio; //retorna mensagem de aviso
    } else {
      return rows; // Retorna os elementos como componentes JSX
    }
  }


  function gerarLista(NomeEvento) {


    let eventoSelecionado = []
    for (const e of eventsInfo) {
      if (e.nameevent == NomeEvento) {
        eventoSelecionado.push(e)
        break;
      }
    }

    const rows = eventoSelecionado.map((event, index) => (
      <div key={index}>
        <Table>
          <Table.Thead>
          </Table.Thead>
          <Table.Tbody>
              {gerarTabela(createFinalArray(), event.id)} 
          </Table.Tbody>
        </Table>
      </div>
    ));

    return ReactDOMServer.renderToString(
      <MantineProvider>
        <div>
          {rows}
        </div>
      </MantineProvider>
    );
  }

  useEffect(() => {

    if (arrayLabels.length != 0) {
      // Função para modificar o conteúdo do elemento "e-date-time-details"
      const modifyDateTimeDetails = () => {
        const dateTimeDetailsElements = document.querySelectorAll(
          ".e-date-time-details"
        );
        let item = document.querySelectorAll(
          ".e-subject"
        );
        const titulos = Array.from(item).map(elemento => elemento.getAttribute("title"));
        // console.log(titulos);
        const nomeDoEvento = titulos.find((element) => element != null);
        dateTimeDetailsElements.forEach((element) => {
          element.innerHTML = ''; // Limpa o conteúdo anterior
          element.insertAdjacentHTML('beforeend', gerarLista(nomeDoEvento));
        });
      };

      // Modificar o conteúdo após a montagem do componente
      const interval = setInterval(() => {
        modifyDateTimeDetails();
      }, 500); // Verifica a cada 500ms

      return () => clearInterval(interval);
    }
  }, [eventsInfo, arrayLabels]);


  return (
    <>
      <MantineProvider>
        <div className={classes.container}>
          <ScheduleComponent
            width="auto"
            height="auto"
            eventSettings={eventSettings}
          >
            <ViewsDirective>
              <ViewDirective option="Month" />
              <ViewDirective option="Agenda" />
            </ViewsDirective>
            <Inject services={[Agenda, Month]} />
          </ScheduleComponent>
        </div>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <p>{modalText}</p>
            </div>
          </div>
        )}
      </MantineProvider>
    </>
  );
}
