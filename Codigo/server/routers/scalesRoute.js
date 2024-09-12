import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connection from '../controllers/index.js';
const router = express.Router();
 
const corsOptions = {
  origin: 'https://schedule-seven.vercel.app', // Substitua pela URL do seu aplicativo cliente
  optionsSuccessStatus: 200
};

router.use(cors(corsOptions));
// router.use(cors());
router.use(express.json());
router.use(bodyParser.urlencoded({ extended: true }));

// GET
router.get('/tabela-escala', async (req, res) => {
  try {
    const queryResult = await connection.query('SELECT * FROM scale');
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET membros escalados no evento
router.get('/membro/:id', async (req, res) => {
  const {id} = req.params
  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE idmembro = $1', [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET escalas da diaconia por determinado id
router.get('/diaconia/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE idmembro = $1 AND idcargos BETWEEN 12 AND 16', [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET escalas da LOUVOR por determinado id
router.get('/louvor/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE idmembro = $1 AND (idcargos BETWEEN 1 AND 6 OR idcargos = 17)', [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET escalas da midia por determinado id
router.get('/midia/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE idmembro = $1 AND idcargos BETWEEN 7 AND 11', [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET escalas da diaconia por determinado id de membro e id de evento
router.get('/diaconia/:idmembro/evento/:idevento', async (req, res) => {
  const { idmembro, idevento } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE idmembro = $1 AND (idcargos BETWEEN 12 AND 16) AND ideventos = $2', [idmembro, idevento]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET escalas da LOUVOR por determinado id de membro e id de evento
router.get('/louvor/:idmembro/evento/:idevento', async (req, res) => {
  const { idmembro, idevento } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE idmembro = $1 AND (idcargos BETWEEN 1 AND 6 OR idcargos = 17) AND ideventos = $2', [idmembro, idevento]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET escalas da midia por determinado id
router.get('/midia/:idmembro/evento/:idevento', async (req, res) => {
  const { idmembro, idevento } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE idmembro = $1 AND (idcargos BETWEEN 7 AND 11) AND ideventos = $2', [idmembro, idevento]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// POST
router.post('/', async (req, res) => {
  const {
    id, idCargos, idEventos, idMembro,
  } = req.body;

  try {
    const queryResult = await connection.query('INSERT INTO scale (id, idCargos, idEventos, idMembro) VALUES ($1, $2, $3, $4) RETURNING *', [id, idCargos, idEventos, idMembro]);
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET maior id da tabela scale
router.get('/max-id', async (req, res) => {
  try {
    const queryResult = await connection.query('SELECT MAX(id) FROM scale');
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET BY ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query('SELECT * FROM scale WHERE ideventos = $1', [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// put
router.post('/edit/:id', async (req, res) => {
  const {
    id, idcargos, ideventos, idmembro,
  } = req.body;
  // const { id } = req.params;

  try {
    const queryResult = await connection.query(
      'INSERT INTO scale (id, idcargos, ideventos, idmembro) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, idcargos, ideventos, idmembro],
    );
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Erro ocorrido com sucesso!!');
  }
});

// DELETE
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await connection.query('DELETE FROM scale WHERE ideventos = $1', [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// DELETE escalas com membro especifico
router.delete('/delete-member/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await connection.query('DELETE FROM scale WHERE idmembro = $1', [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

//GET utilizando JOIN para criar a tabela necessária para a montagem da tabela de recomendação de escala
router.get('/min/:mindate/max/:maxdate', async (req, res) => {
  const { mindate, maxdate } = req.params;
  try {
    const queryResult = await connection.query('SELECT s.*, m.name, m.diaconia, m.midia, m.louvor FROM scale s JOIN events e ON s.ideventos = e.id JOIN members m ON s.idmembro = m.id WHERE e.dateevent BETWEEN $1 AND $2', [mindate, maxdate]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

export default router;
