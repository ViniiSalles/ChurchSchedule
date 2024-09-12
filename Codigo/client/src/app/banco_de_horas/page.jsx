"use client";
import {
    Select,
    Box,
    Container,
    Table,
    Button,
    Image,
    LoadingOverlay,
    Text
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import NextImage from 'next/image';
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import Sort from '../../../public/sortIcon.png';
import Negado from "@/components/acessoNegado/acessoNegado";
import ErrorDialog from "@/components/dialog/ErrorDialog";

import classes from "./bancoDeHoras.module.css";

export default function bancoDeHoras() {
    const [arrayInicial, setarrayInicial] = useState([])//array inicial onde os dados de membros são armazenados
    const [bancoHoras, setbancoHoras] = useState([]) //array responsavel por armazenar os dados tratados do banco de horas
    const [sort, setsort] = useState(false) //state utilizado para indicar quando o sistema deve realizar uma reexibição da tabela, devido a uma ordenação
    const [names, setnames] = useState('')//state com os nomes dos membros e seus respectivos ids
    const [idName, setidName] = useState('')//state armazenando o id do membro
    const [memberName, setmemberName] = useState('')//state armazenando o nome do membro
    const [min, setmin] = useState('')// state armazenando o ministerio selecionado pelo usuario
    const [searchedName, setsearchedName] = useState([])
    const [arrayMin, setarrayMin] = useState([]) //array contendo os resultados da pesquisa do select de ministerios
    const [tablecontent, settablecontent] = useState()//state utilizado para armazenar as linhas da tabela
    const [pesquisaMin, setpesquisaMin] = useState(false)//indicador do modo de pesquisa de nome
    const [pesquisaNome, setpesquisaNome] = useState(false)//indicador do modo de pesquisa por ministério

    const [minMonth, setminMonth] = useState(null)//armazena a data exibida no select de data minima
    const [maxMonth, setmaxMonth] = useState(null) //armazena a data exibida no select de data maxima
    const [minSearchMonth, setminSearchMonth] = useState(null) //state que armazena a data minima de pesquisa na tabela
    const [maxSearchMonth, setmaxSearchMonth] = useState(null)//state que armazena a data maxima de pesquisa na tabela
    const [monthSearchResult, setmonthSearchResult] = useState([])//array contendo os resultados da pesquisa por intervalo de data
    const [displayCaption, setdisplayCaption] = useState(false)

    const [nameDateSearch, setnameDateSearch] = useState(null);
    const [openedErrorDialogMessage, setOpenedPositionErrorDialogMessage] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")

    const closePositionErrorDialogMessage = () => setOpenedPositionErrorDialogMessage(false);

    //state de loader
    const [visible, setVisible] = useState(false)

    //função responsavel por carregar os dados da tabela membros do bd:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    const carregarArray = async () => {
        setVisible(true)
        let array = []
        let arrayNames = []
        let arrayMembros = []
        try {
            const response = await axios.get("https://schedule-server-rfti.onrender.com/members");
            array = response.data;
            for (const e of array) {
                arrayMembros.push({
                    id: e.id,
                    name: e.name,
                    diaconia: e.diaconia,
                    louvor: e.louvor,
                    midia: e.midia
                })
                arrayNames.push({
                    id: e.id,
                    label: e.name
                })
            }

            const nomeMembros = arrayNames.map((event) => ({
                value: event.id.toString(), // Converte o id numérico para string
                label: event.label,
            }));

            nomeMembros.sort(ordenarPorNome1)

            setnames(nomeMembros)
            arrayMembros.sort(ordenarPorId)
            setarrayInicial(arrayMembros);

        } catch (error) {
            setErrorMessage("Erro ao carregar banco de horas")
            console.error("Erro ao buscar eventos:", error);
        }
    }


    //função responsavel por cruzar os dados entre os meses pesquisados e o nome
    const carregarBHbyMonthAndNameSearch = async () => {
        let arrayfinal = []
        let diac = 0
        let louv = 0
        let mid = 0
        let total = 0
        let membroSelecionado = []
        for (const membro of arrayInicial) {
            if (membro.id == nameDateSearch.id)
                membroSelecionado = membro;
        }

        for (const ev of monthSearchResult) {//evento
            if (nameDateSearch.diaconia) {
                try {
                    let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/diaconia/${nameDateSearch.id}/evento/${ev.id}`)
                    diac = diac + response.data.length
                } catch (error) { 
                    setErrorMessage("Erro na busca")
                    console.error("Erro na busca:", error) }
            } else {
                diac = 0
            }

            if (nameDateSearch.louvor) {
                try {
                    let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/louvor/${nameDateSearch.id}/evento/${ev.id}`)
                    louv = louv + response.data.length
                } catch (error) { 
                    setErrorMessage("Erro na busca") 
                    console.error("Erro na busca:", error) }
            } else {
                louv = 0
            }

            if (nameDateSearch.midia) {
                try {
                    let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/midia/${nameDateSearch.id}/evento/${ev.id}`)
                    mid = mid + response.data.length
                } catch (error) { 
                    setErrorMessage("Erro na busca")
                    console.error("Erro na busca:", error); }
            } else {
                mid = 0
            }
        };
        total = diac + louv + mid

        if (membroSelecionado.diaconia == false) diac = null


        if (membroSelecionado.louvor == false) louv = null

        if (membroSelecionado.midia == false) mid = null

        arrayfinal.push({
            id: nameDateSearch.id,
            nome: nameDateSearch.nome,
            diaconia: diac,
            louvor: louv,
            midia: mid,
            Etotal: total,
        })
        let NameAndMinException = false
        if (pesquisaMin || pesquisaNome) {
            if (min == 'Diaconia') {
                if (arrayfinal[0].diaconia == null) {
                    arrayfinal.splice(0, 1);
                }
            }
            if (min == 'Louvor') {
                if (arrayfinal[0].louvor == null) {
                    arrayfinal.splice(0, 1);
                }
            }
            if (min == 'Mídia') {
                if (arrayfinal[0].midia == null) {
                    arrayfinal.splice(0, 1);
                }
            }
        }
        setbancoHoras(arrayfinal)
        // setTableCaption()

    }


    //função para carregar as escalas por intervalo de tempo
    const carregarBhByMonthSearch = async () => {
        let arrayfinal = []

        for (const e of arrayInicial) {// membro
            let totalDiac = 0
            let totalLouv = 0
            let totalMid = 0
            let totalTotal = 0

            for (const ev of monthSearchResult) {//evento
                let diac = 0
                let louv = 0
                let mid = 0
                let total = 0
                if (e.diaconia) {
                    try {
                        let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/diaconia/${e.id}/evento/${ev.id}`)
                        diac = response.data.length
                    } catch (error) { 
                        setErrorMessage("Erro na busca")
                        console.error("Erro na busca:", error) }
                } else {
                    totalDiac = null
                    diac = null
                }

                if (e.louvor) {
                    try {
                        let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/louvor/${e.id}/evento/${ev.id}`)
                        louv = response.data.length
                    } catch (error) { 
                        setErrorMessage("Erro na busca")
                        console.error("Erro na busca:", error) }
                } else {
                    totalLouv = null
                    louv = null
                }

                if (e.midia) {
                    try {
                        let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/midia/${e.id}/evento/${ev.id}`)
                        mid = response.data.length
                    } catch (error) { 
                        setErrorMessage("Erro na busca")
                        console.error("Erro na busca:", error); }
                } else {
                    totalMid = null
                    mid = null
                }

                total = diac + louv + mid

                if (!(totalDiac == null && diac == null)) {
                    totalDiac = totalDiac + diac;
                } else {
                    totalDiac = null
                }

                if (!(totalLouv == null && louv == null)) {
                    totalLouv = totalLouv + louv;
                } else {
                    totalLouv = null
                }

                if (!(totalMid == null && mid == null)) {
                    totalMid = totalMid + mid;
                } else {
                    totalMid = null
                }

                totalTotal = totalTotal + total
            };
            arrayfinal.push({
                id: e.id,
                nome: e.name,
                diaconia: totalDiac,
                louvor: totalLouv,
                midia: totalMid,
                Etotal: totalTotal,
            })
        }

        if (pesquisaMin && minSearchMonth != null) {
            let array1 = []
            if (min == "Diaconia") {
                for (const e of arrayfinal) {
                    if (e.diaconia > 0) {
                        array1.push(e)
                    }
                }
                setarrayMin(array1)
            } else if (min == "Louvor") {
                for (const e of arrayfinal) {
                    if (e.louvor > 0) {
                        array1.push(e)
                    }
                }
                setarrayMin(array1)
            } else if (min == "Mídia") {
                for (const e of arrayfinal) {
                    if (e.midia > 0) {
                        array1.push(e)
                    }
                }
                setarrayMin(array1)
            }
            array1.sort(ordenarPorNome)
            setbancoHoras(array1)
            setTableCaption()
        } else {
            arrayfinal.sort(ordenarPorNome)
            setbancoHoras(arrayfinal)
            setTableCaption()
        }
        setVisible(false)
    }


    //função responsavel por fazer o carregamento do banco de horas a partir da tabela "scale" do bd, recebe os dados, transforma eles no array de Horas
    const carregarBH = async () => {
        setVisible(true)
        let arrayfinal = []
        let diac = ''
        let louv = ''
        let mid = ''
        let total = ''

        for (const e of arrayInicial) {

            if (e.diaconia) {
                try {
                    let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/diaconia/${e.id}`)
                    diac = response.data.length
                } catch (error) {
                    setErrorMessage("Erro na busca")
                    console.error("Erro na busca:", error)
                }
            } else {
                diac = null
            }

            if (e.louvor) {
                try {
                    let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/louvor/${e.id}`)
                    louv = response.data.length
                } catch (error) {
                    setErrorMessage("Erro na busca")
                    console.error("Erro na busca:", error)
                }
            } else {
                louv = null
            }

            if (e.midia) {
                try {
                    let response = await axios.get(`https://schedule-server-rfti.onrender.com/escala-principal/midia/${e.id}`)
                    mid = response.data.length
                } catch (error) {
                    setErrorMessage("Erro na busca")
                    console.error("Erro na busca:", error);
                }
            } else {
                mid = null
            }

            total = diac + louv + mid

            arrayfinal.push({
                id: e.id,
                nome: e.name,
                diaconia: diac,
                louvor: louv,
                midia: mid,
                Etotal: total,
            })
        };
        arrayfinal.sort(ordenarPorNome)
        setbancoHoras(arrayfinal)
    }
    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    //FUNÇÕES DO SELECT DE NOMES::::::::::::::::::::::::::::::::::::::::::
    const onChangeName = (value, label) => {
        setmemberName(label.label)
        setidName(value)//id do membro
        setpesquisaNome(true)
    }

    //função para pesquisar o nome na lista de membros
    function pesquisarNome() {
        for (const e of bancoHoras) {
            if (idName == e.id) {
                setsearchedName(e)
            }
        }
    }

    //função para pesquisar o nome e inserir no contexto da pesquisa por periodo de tempo
    function pesquisarNome2() {
        for (const e of bancoHoras) {
            if (idName == e.id) {
                setnameDateSearch(e)
            }
        }
    }
    //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::



    //FUNÇÕES DO SELECT DE MINISTÉRIO:::::::::::::::::::::::::::::::::::::
    const minLabels = [
        { value: "Diaconia", label: "Diaconia" },
        { value: "Louvor", label: "Louvor" },
        { value: "Mídia", label: "Mídia" },
    ];

    const getMinLabels = (value) => {
        setmin(value)
        searchMin(value)
        setdisplayCaption(false)
    }


    //função para inserir apenas os membros com escalações > 0 no determinado ministerio
    function searchMin(value) {
        setpesquisaMin(true)
        let array = []
        if (value == "Diaconia") {
            for (const e of bancoHoras) {
                if (e.diaconia > 0) {
                    array.push(e)
                }
            }
            setarrayMin(array)
        } else if (value == "Louvor") {
            for (const e of bancoHoras) {
                if (e.louvor > 0) {
                    array.push(e)
                }
            }
            setarrayMin(array)
        } else if (value == "Mídia") {
            for (const e of bancoHoras) {
                if (e.midia > 0) {
                    array.push(e)
                }
            }
            setarrayMin(array)
        }
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    //FUNÇÕES DOS SELECTS DE DATAS::::::::::::::::::::::::::::::::::::::::
    //função para tratar e setar a data minima
    const changeMinMonth = (value) => {
        let data = value
        const formattedDate = data.toLocaleDateString('en-CA', {//realiza a formatação da data inserida
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        setminMonth(value)
        setminSearchMonth(formattedDate)
    }


    //função para tratar e setar a data maxima
    const changeMaxMonth = (value) => {
        let data = value
        const formattedDate = data.toLocaleDateString('en-CA', {//realiza a formatação da data inserida
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        setmaxMonth(value)
        setmaxSearchMonth(formattedDate)
    }


    //função para retornar os ids dos eventos pertencentes ao periodo de tempo especificado
    const getEventsByMonthRange = async () => {
        setVisible(true)
        try {
            let response = await axios.get(`https://schedule-server-rfti.onrender.com/events/from/${minSearchMonth}/to/${maxSearchMonth}`)
            setmonthSearchResult(response.data)
        } catch (error) {
            setErrorMessage("Erro na busca")
            console.error("Erro na busca:", error)
        }
    }

    function setTableCaptionNome() {
        if (pesquisaNome) {
            const text = `Exibindo resultados do membro ${memberName}`
            const row = (
                <Table.Caption>{text}</Table.Caption>
            );
            return row;
        } else return null;
    }


    function formatDate(dataaaa) {
        const data = dataaaa.split('-')
        let finalData = data[2] + '/' + data[1] + '/' + data[0]
        return finalData;
    }

    //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


    //função para realizar a pesquisa
    function pesquisar() {
        setVisible(true)
        if ((minSearchMonth != null && pesquisaNome) || ((minSearchMonth != null && pesquisaNome) && pesquisaMin)) {
            pesquisarNome2()
            getEventsByMonthRange()
        } else if (pesquisaNome && pesquisaMin) {
            nameSearch()
        } else if (pesquisaMin && minSearchMonth != null) {
            getEventsByMonthRange()
        } else if (minSearchMonth != null) {
            pesquisarNome2()
            getEventsByMonthRange()
        } else if (pesquisaNome) {
            nameSearch()
            setVisible(false)
        } else if (pesquisaMin) {
            gerarTabela(arrayMin)
            setdisplayCaption(true)
        } else {
            setVisible(false)
            setErrorMessage("Nenhuma informação inserida nos campos!")
        }
    }

    //função para iniciar a pesquisa utilizando o id salvo no select de membros
    function nameSearch() {
        pesquisarNome()
    }


    //função para gerar a tabela do banco de hrs 
    function gerarTabelaMinistério(array) {
        if (array.length == 0) {
            let texto = `Sem informações de ${min}`
            const rows = (
                <Table.Tr>
                    <Table.Td colSpan={5} style={{ textAlign: 'center' }}>{texto}</Table.Td>
                </Table.Tr>
            );
            settablecontent(rows)
        } else {
            const rows = array.map((cargo, index) => (
                <Table.Tr key={cargo.id} className={classes.tablerow}>
                    <Table.Td className={classes.tableData}>{cargo.nome}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.diaconia}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.louvor}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.midia}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.Etotal}</Table.Td>
                </Table.Tr>
            ));
            settablecontent(rows)
        }
    }

    //função para gerar a tabela do banco de hrs 
    function gerarTabela(array) {
        if (array.length == 0) {
            const rows = (
                <Table.Tr>
                    <Table.Td colSpan={5} style={{ textAlign: 'center' }}>Sem informações</Table.Td>
                </Table.Tr>
            );
            settablecontent(rows)
        } else {
            for (const e of array) {
                if (e.diaconia == null) {
                    e.diaconia = "N/A"
                }
                if (e.louvor == null) {
                    e.louvor = "N/A"
                }
                if (e.midia == null) {
                    e.midia = "N/A"
                }
            }
            const rows = array.map((cargo, index) => (
                <Table.Tr key={cargo.id} className={classes.tablerow}>
                    <Table.Td className={classes.tableData}>{cargo.nome}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.diaconia}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.louvor}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.midia}</Table.Td>
                    <Table.Td className={classes.tableData}>{cargo.Etotal}</Table.Td>
                </Table.Tr>
            ));
            settablecontent(rows)
        }
        setVisible(false)
    }

    function gerarTabelaNome() {
        let NameAndMinException = false
        if (searchedName.diaconia == null) {
            searchedName.diaconia = "N/A"
        }
        if (searchedName.louvor == null) {
            searchedName.louvor = "N/A"
        }
        if (searchedName.midia == null) {
            searchedName.midia = "N/A"
        }

        if (min == 'Diaconia') {
            if (searchedName.diaconia == "N/A") {
                NameAndMinException = true
            }
        } else if (min == 'Louvor') {
            if (searchedName.louvor == "N/A") {
                NameAndMinException = true
            }
        } if (min == 'Mídia') {
            if (searchedName.midia == "N/A") {
                NameAndMinException = true
            }
        }
        if (NameAndMinException == true) {
            let text = `O membro ${searchedName.nome} não está alocado em ${min}.`
            const rows = (<Table.Tr key={searchedName.id} className={classes.tablerow}>
                <Table.Td className={classes.tableData} colSpan={5} style={{ textAlign: 'center' }}>{text}</Table.Td>
            </Table.Tr>)
            NameAndMinException = false
            settablecontent(rows)
        } else {
            const rows = (
                <Table.Tr key={searchedName.id} className={classes.tablerow}>
                    <Table.Td className={classes.tableData}>{searchedName.nome}</Table.Td>
                    <Table.Td className={classes.tableData}>{searchedName.diaconia}</Table.Td>
                    <Table.Td className={classes.tableData}>{searchedName.louvor}</Table.Td>
                    <Table.Td className={classes.tableData}>{searchedName.midia}</Table.Td>
                    <Table.Td className={classes.tableData}>{searchedName.Etotal}</Table.Td>
                </Table.Tr>
            );
            settablecontent(rows)
        }
        setVisible(false)
    }

    //função para setar a legenda da tabela, indicando o intervalo de datas da procura ou o ministério da mesma
    function setTableCaption() {

        if (monthSearchResult.length != 0) {
            const minDate = formatDate(minSearchMonth)
            const maxDate = formatDate(maxSearchMonth)

            const text = `Exibindo resultados de eventos de ${minDate} até ${maxDate}`
            const row = (
                <Table.Caption>{text}</Table.Caption>
            );
            return row;
        } else if (pesquisaMin && displayCaption) {
            const text = `Exibindo resultados do ministério de ${min}\n\n\n\n\n(São exibidas apenas membros com uma ou mais escalações neste ministério)`
            const row = (
                <Table.Caption>{text}</Table.Caption>
            );
            return row;
        } else {
            return null;
        }
    }


    //funcão para limpar a pesquisa e exibir todos os dados na tabela
    function limparPesquisa() {
        location.reload()
    }

    //função de ordenação do array (se baseiam em algum atributo do objeto)
    function NameSort() {
        if (pesquisaMin) {
            let array1 = [];
            array1 = arrayMin
            array1.sort(ordenarPorNome)
            gerarTabela(array1)

        } else {
            let array = []
            array = bancoHoras
            array.sort(ordenarPorNome)
            setbancoHoras(array)
            setsort(true)
        }
    }
    function diaconiaSort() {
        if (pesquisaMin) {
            let array1 = [];
            array1 = arrayMin
            array1.sort(ordenarPorDiac)
            gerarTabela(array1)

        } else {
            let array = []
            array = bancoHoras
            array.sort(ordenarPorDiac)
            setbancoHoras(array)
            setsort(true)
        }
    }
    function midiaSort() {
        if (pesquisaMin) {
            let array1 = [];
            array1 = arrayMin
            array1.sort(ordenarPorMid)
            gerarTabela(array1)

        } else {
            let array = []
            array = bancoHoras
            array.sort(ordenarPorMid)
            setbancoHoras(array)
            setsort(true)
        }
    }
    function louvorSort() {
        if (pesquisaMin) {
            let array1 = [];
            array1 = arrayMin
            array1.sort(ordenarPorlouv)
            gerarTabela(array1)

        } else {
            let array = []
            array = bancoHoras
            array.sort(ordenarPorlouv)
            setbancoHoras(array)
            setsort(true)
        }
    }
    function totalSort() {

        if (pesquisaMin) {
            let array1 = [];
            array1 = arrayMin
            array1.sort(ordenarPortotal)
            gerarTabela(array1)

        } else {
            let array = []
            array = bancoHoras
            array.sort(ordenarPortotal)
            setbancoHoras(array)
            setsort(true)
        }
    }
    function ordenarPorId(a, b) {
        return a.id - b.id;
    }
    function ordenarPorDiac(a, b) {
        let aa = 0
        let bb = 0
        aa = a.diaconia
        bb = b.diaconia
        if (b.diaconia == "N/A") bb = -1
        if (a.diaconia == "N/A") aa = -1
        return bb - aa;
    }
    function ordenarPorMid(a, b) {
        let aa = 0
        let bb = 0
        aa = a.midia
        bb = b.midia
        if (b.midia == "N/A") bb = -1
        if (a.midia == "N/A") aa = -1
        return bb - aa;
    }
    function ordenarPorlouv(a, b) {
        let aa = 0
        let bb = 0
        aa = a.louvor
        bb = b.louvor
        if (a.louvor == "N/A") aa = -1
        if (b.louvor == "N/A") bb = -1
        return bb - aa;
    }
    function ordenarPortotal(a, b) {
        return b.Etotal - a.Etotal;
    }
    function ordenarPorNome(a, b) {
        return a.nome.localeCompare(b.nome);
    }
    function ordenarPorNome1(a, b) {
        return a.label.localeCompare(b.label);
    }

    useEffect(() => {
        if (nameDateSearch != null) {
            carregarBHbyMonthAndNameSearch()
        } else carregarBhByMonthSearch()
    }, [monthSearchResult]);

    useEffect(() => {
        gerarTabelaNome()
        setidName(null)
        setpesquisaNome(false)
        setVisible(false)
    }, [searchedName]);


    useEffect(() => {
        gerarTabela(bancoHoras)
        setsort(false)
    }, [sort]);

    useEffect(() => {
        gerarTabela(bancoHoras)
        setVisible(false)
    }, [bancoHoras]);

    useEffect(() => {
        carregarBH()
    }, [arrayInicial]);

    //executa ao iniciar a pagina
    useEffect(() => {
        carregarArray()
    }, []);


    const { user } = useUser();

    const userHasAccess = user && user['https://BetelApi.com/roles'] && (
        user['https://BetelApi.com/roles'].includes('Lider') ||
        user['https://BetelApi.com/roles'].includes('Lider Louvor')
    );

    useEffect(() => {
        if (errorMessage != "") setOpenedPositionErrorDialogMessage(true)
      }, [errorMessage]);

    if (userHasAccess) {
        return (
            <>
                <Box>
                    <LoadingOverlay visible={visible}
                        zIndex={1000}
                        overlayProps={{ blur: 2 }}
                        loaderProps={{ color: '#8c232c' }}
                    />
                    <Container className={classes.container}>
                        <div className="flex flex-col">
                            <div id={classes.searchSection}>
                                <div>
                                    <Container id={classes.nameInput}>
                                        <Select
                                            label="Selecione o nome:"
                                            placeholder="Selecione o nome"
                                            value={idName}
                                            onChange={onChangeName}
                                            data={names}
                                            searchable
                                            maxDropdownHeight={150}
                                            w={465}
                                        />
                                        <Select
                                            className={classes.marginR11}
                                            id={classes.minSelect}
                                            label="Selecione o ministerio:"
                                            placeholder="Selecione o ministerio"
                                            value={min}
                                            onChange={getMinLabels}
                                            data={minLabels}
                                            searchable
                                            ml={15} w={240}
                                        />
                                    </Container>
                                    <div className="flex">
                                        <Container id={classes.selectContainer}>
                                            <DateInput
                                                value={minMonth}
                                                onChange={changeMinMonth}
                                                // minDate={new Date()}
                                                // maxDate={dayjs(new Date()).add(1, "month").toDate()}
                                                valueFormat="DD/MM/YYYY"
                                                label="De:"
                                                placeholder="00/00/0000"
                                                firstDayOfWeek="sunday"
                                                mr={19}
                                                w={216}
                                            />
                                            <DateInput
                                                value={maxMonth}
                                                onChange={changeMaxMonth}
                                                // minDate={new Date()}
                                                // maxDate={dayjs(new Date()).add(1, "month").toDate()}
                                                valueFormat="DD/MM/YYYY"
                                                label="Até:"
                                                placeholder="00/00/0000"
                                                firstDayOfWeek="sunday"
                                                w={216}
                                            />
                                            <Container id={classes.buttonContainer}>
                                                <Button className={classes.searchButton} onClick={(e) => { pesquisar() }} mr={15} w={109}>
                                                    Buscar
                                                </Button>
                                                <Button className={classes.searchButton} id={classes.clearButton} onClick={(e) => { limparPesquisa() }} w={109} style={{ backgroundColor: '#aaa9a9' }}>
                                                    Limpar
                                                </Button>
                                            </Container>
                                        </Container>
                                    </div>
                                </div>
                            </div>
                            <div className={classes.tables}>
                                <div className={classes.tablediv}>
                                    <div className={classes.tabletit} id={classes.tableTittle}><b>Banco de horas</b></div>
                                    <Table>
                                        <Table.Thead>
                                            <Table.Tr id={classes.headtr}>
                                                <Table.Th className={classes.tableHead} >
                                                    <button onClick={(e) => { NameSort() }} className={classes.sortButton}>
                                                        Membro
                                                        <Image src={Sort}
                                                            component={NextImage}
                                                            className={classes.sortPic}
                                                            w={14}
                                                            h={14}
                                                            mt={2.5}
                                                            alt='Icone de ordenacao' /></button>
                                                </Table.Th>
                                                <Table.Th className={classes.tableHead}>
                                                    <button onClick={(e) => { diaconiaSort() }} className={classes.sortButton}>
                                                        Diaconia
                                                        <Image src={Sort}
                                                            component={NextImage}
                                                            className={classes.sortPic}
                                                            w={14}
                                                            h={14}
                                                            mt={2.5}
                                                            alt='Icone de ordenacao' /></button>
                                                </Table.Th>
                                                <Table.Th className={classes.tableHead}>
                                                    <button onClick={(e) => { louvorSort() }} className={classes.sortButton}>
                                                        Louvor
                                                        <Image src={Sort}
                                                            component={NextImage}
                                                            className={classes.sortPic}
                                                            w={14}
                                                            h={14}
                                                            mt={2.5}
                                                            alt='Icone de ordenacao' /></button>
                                                </Table.Th>
                                                <Table.Th className={classes.tableHead}>
                                                    <button onClick={(e) => { midiaSort() }} className={classes.sortButton}>
                                                        Mídia
                                                        <Image src={Sort}
                                                            component={NextImage}
                                                            className={classes.sortPic}
                                                            w={14}
                                                            h={14}
                                                            mt={2.5}
                                                            alt='Icone de ordenacao' /></button>
                                                </Table.Th>
                                                <Table.Th className={classes.tableHead} w={107}>
                                                    <button onClick={(e) => { totalSort() }} className={classes.sortButton}>
                                                        Total
                                                        <Image src={Sort}
                                                            component={NextImage}
                                                            className={classes.sortPic}
                                                            w={14}
                                                            h={14}
                                                            mt={2.5}
                                                            alt='Icone de ordenacao' /></button>
                                                </Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>{tablecontent}</Table.Tbody>
                                        {setTableCaption()}
                                    </Table>
                                </div>
                            </div>
                        </div>
                    </Container>
                    <ErrorDialog
                        opened={openedErrorDialogMessage}
                        onClose={closePositionErrorDialogMessage}
                        title="Erro"

                    >
                        <Text size="sm" c="black">{errorMessage}</Text>

                    </ErrorDialog>
                </Box>


            </>
        );
    }

    return <Negado></Negado>
}

