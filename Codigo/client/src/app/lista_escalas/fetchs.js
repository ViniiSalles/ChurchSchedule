/* import axios from "axios";

export async function buscarInfo(event) {
    try {
        const [resultId, resultEscala, resultName] = await Promise.all([
            axios.get(`https://schedule-server-rfti.onrender.com/members/name-id/name/${event.idmembro}`),
            axios.get(`https://schedule-server-rfti.onrender.com/escala/ministerio/name/${event.idcargos}`),
            axios.get(`https://schedule-server-rfti.onrender.com/escala/name/${event.idcargos}`)
        ]);
        return {
            minName: resultEscala.data[0].ministerio,
            memberName: resultName.data[0].descricao,
            cargoName: resultId.data[0].name
        };
    } catch (error) {
        console.error("Erro ao buscar informações:", error);
        return { minName: '', memberName: '', cargoName: '' }; // Retorna valores padrão em caso de erro
    }
}
 */