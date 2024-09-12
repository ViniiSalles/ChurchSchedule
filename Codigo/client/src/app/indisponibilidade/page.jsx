'use client'
import { useState, useEffect } from "react";
import classes from "./indisponibilidade.module.css";
import classesModal from './excludeIndisponibilidadeModal.module.css'
import {
    Select,
    Button,
    Table,
    Modal,
    Text,
    LoadingOverlay,
    Container,
} from "@mantine/core";
import { DateInput } from "@mantine/dates"; // Importação correta para DateInput
import SuccessDialog from "@/components/dialog/SuccessDialog";
import ErrorDialog from "@/components/dialog/ErrorDialog";

export default function Indisponibilidade() {
    const [member, setMember] = useState("");
    const [members, setMembers] = useState([]); // arraylist de membros
    const [ministry, setMinistry] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [records, setRecords] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    //state de loader
    const [visible, setVisible] = useState(false);



    async function fetchMembers() {
        const response = await fetch('https://schedule-server-rfti.onrender.com/members');
        const data = await response.json();
        setMembers(data);
    }

    // Fetch members from the backend
    useEffect(() => {
        setVisible(true)
        fetchMembers();
        fetchAllUnavailable();
    }, []);

    // Fetch all unavailable records
    const fetchAllUnavailable = async () => {

        try {
            const response = await fetch('https://schedule-server-rfti.onrender.com/unavailable/');
            const data = await response.json();

            // Map the fields to the correct format
            const mappedData = data.map(record => ({
                ...record,
                dataInicio: record.datainicio ? new Date(record.datainicio) : null,
                dataFim: record.datafim ? new Date(record.datafim) : null,
            }));
            mappedData.sort(sortBydate)
            setRecords(mappedData);
            setVisible(false)
        } catch (error) {
            console.error('Error fetching all unavailable records:', error);
        }
        setVisible(false)
    };

    // Post new unavailable record to the backend
    const postUnavailable = async (unavailability) => {
        try {
            const response = await fetch('https://schedule-server-rfti.onrender.com/unavailable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(unavailability),
            });
            const data = await response.json();
            setRecords((prevRecords) => [...prevRecords, data]); // Add new record to the list
            fetchAllUnavailable(); // Fetch all records again to update the table
            setSuccessMessage('Indisponibilidade adicionada com sucesso!');
        } catch (error) {
            console.error('Error posting unavailable record:', error);
            setErrorMessage('Falha ao adicionar indisponibilidade.');
        }
    };

    // Delete unavailable record from the backend
    const deleteUnavailable = async (id) => {
        try {
            await fetch(`https://schedule-server-rfti.onrender.com/unavailable/${id}`, {
                method: 'DELETE',
            });
            setRecords((prevRecords) => prevRecords.filter(record => record.id !== id)); // Remove record from the list
            setSuccessMessage('Indisponibilidade excluída com sucesso!');
        } catch (error) {
            console.error('Error deleting unavailable record:', error);
            setErrorMessage('Falha ao excluir indisponibilidade.');
        }
    };

    // Open the modal for confirmation
    const openModal = (record) => {
        setRecordToDelete(record);
        setModalOpen(true);
    };

    // Confirm deletion
    const confirmDeletion = () => {
        setVisible(true)
        deleteUnavailable(recordToDelete.id);
        setModalOpen(false);
        setRecordToDelete(null);
        setVisible(false)
    };

    // Cancel deletion
    const cancelDeletion = () => {
        setModalOpen(false);
        setRecordToDelete(null);
    };

    // Filter members based on selected ministry
    const filteredMembers = ministry
        ? members.filter(member => member[ministry])
        : members;

    // Map filtered members to Select options
    const membros = filteredMembers.map((mem) => ({
        value: mem.id.toString(),
        label: mem.name,
    }));

    // Handle member selection (not used for fetching unavailable records anymore)
    const getMemberId = (value) => {
        setMember(value); // Store member ID
    };

    // Add a new unavailable record
    const addRecord = () => {
        setVisible(true)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Remove time part to compare only dates

        if (!startDate || !endDate) {
            setErrorMessage('Por favor, selecione ambas as datas de início e fim.');
            return;
        }

        if (startDate < today || endDate < today) {
            setErrorMessage('Datas passadas não são permitidas.');
            return;
        }

        if (endDate < startDate) {
            setErrorMessage('A data de fim não pode ser menor que a data de início.');
            return;
        }

        const unavailability = { idMembro: member, dataInicio: startDate, dataFim: endDate };
        postUnavailable(unavailability);
        setMember("");
        setMinistry("");
        setStartDate(null);
        setEndDate(null);
        fetchMembers();
        fetchAllUnavailable();
        setVisible(false)
    };


    function sortBydate(a, b) {
        return a.dataInicio - b.dataInicio;
    }
    return (
        <div>
            <LoadingOverlay visible={visible}
                zIndex={1000}
                overlayProps={{ blur: 2 }}
                loaderProps={{ color: '#8c232c' }}
            />
            <div className={classes.row}>
                <Select
                    className={classes.infoSelect}
                    label="Ministério"
                    placeholder="Selecione o Ministério"
                    data={[
                        { value: 'diaconia', label: 'Diaconia' },
                        { value: 'louvor', label: 'Louvor' },
                        { value: 'midia', label: 'Mídia' },
                    ]}
                    value={ministry}
                    onChange={setMinistry} // Adicionado onChange
                />
                <Select
                    className={classes.infoSelect}
                    label="Selecione o Obreiro"
                    placeholder="Digite o Obreiro"
                    data={membros}
                    searchable
                    maxDropdownHeight={150}
                    comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 } }}
                    value={member}
                    onChange={getMemberId} // Atualizado para armazenar o ID do membro
                />
            </div>
            <div className={classes.row}>
                <DateInput
                    className={classes.infoSelect}
                    label="Início da Indisponibilidade"
                    placeholder="Selecione a data de início"
                    value={startDate}
                    onChange={setStartDate} // Adicionado onChange
                    minDate={new Date()} // Impede datas passadas
                    popoverProps={{ withinPortal: true, position: 'top', align: 'center' }} // Popover centralizado
                    valueFormat="DD/MM/YYYY"
                    mr={19}
                    w={216}
                />
                <DateInput
                    className={classes.infoSelect}
                    label="Fim da Indisponibilidade"
                    placeholder="Selecione a data de fim"
                    value={endDate}
                    onChange={setEndDate} // Adicionado onChange
                    minDate={startDate || new Date()} // Impede datas menores que a data de início
                    popoverProps={{ withinPortal: true, position: 'top', align: 'center' }} // Popover centralizado
                    valueFormat="DD/MM/YYYY"
                />
            </div>
            <Button onClick={addRecord} className={classes.addButton}>Adicionar</Button> {/* Adiciona a indisponibilidade */}
            {/* Tabela de Registros */}
            <Table>
                <thead className={classes.tableHead}>
                    <tr>
                        <th>Obreiro</th>
                        <th>Data Início</th>
                        <th>Data Fim</th>
                        <th>Excluir</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.id} className={record.id % 2 === 0 ? classes.evenRow : classes.oddRow}>
                            <td style={{ textAlign: "center" }}>{record.name}</td> {/* Atualizado para mostrar o nome do membro */}
                            <td style={{ textAlign: "center" }}>{record.dataInicio ? record.dataInicio.toLocaleDateString() : 'N/A'}</td> {/* Formatação de data */}
                            <td style={{ textAlign: "center" }}>{record.dataFim ? record.dataFim.toLocaleDateString() : 'N/A'}</td> {/* Formatação de data */}
                            <td style={{ textAlign: "center" }}>
                                <Button onClick={() => openModal(record)}>Excluir</Button> {/* Botão de exclusão funcional */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal de confirmação de exclusão */}
            <Modal
                opened={modalOpen}
                onClose={cancelDeletion}
                title="Confirmar Exclusão"
            >
                <Container className={classesModal.containerModal}>
                    <Text>Tem certeza de que deseja excluir esta indisponibilidade?</Text>
                    <div className={classesModal.modalButtons}>
                        <Button onClick={confirmDeletion} color="red" className={classes.buttons}>Excluir</Button>
                        <Button onClick={cancelDeletion} className={classes.buttons}>Cancelar</Button>
                    </div>
                </Container>
            </Modal>

            {/* Dialog de sucesso */}
            {successMessage && (
                <SuccessDialog
                    message={successMessage}
                    onClose={() => setSuccessMessage("")}
                />
            )}

            {/* Dialog de erro */}
            {errorMessage && (
                <ErrorDialog
                    message={errorMessage}
                    onClose={() => setErrorMessage("")}
                />
            )}
        </div>
    );
}
