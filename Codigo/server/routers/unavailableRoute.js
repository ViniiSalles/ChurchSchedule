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

// POST - Adicionar indisponibilidade
router.post('/', async (req, res) => {
  const { idMembro, dataInicio, dataFim } = req.body;

  try {
    const queryResult = await connection.query(
      'INSERT INTO unavailable (idMembro, dataInicio, dataFim) VALUES ($1, $2, $3) RETURNING *',
      [idMembro, dataInicio, dataFim]
    );
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET BY ID - Buscar indisponibilidade por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query('SELECT * FROM unavailable WHERE idmembro = $1', [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET membros indisponíveis
router.get('/membro/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query('SELECT * FROM unavailable WHERE idmembro = $1', [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET all indisponibilidades
router.get('/', async (req, res) => {
  try {
    const queryResult = await connection.query(`
      SELECT u.*, m.name 
      FROM unavailable u
      JOIN members m ON u.idMembro = m.id
    `);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// DELETE - Excluir indisponibilidade por ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const queryResult = await connection.query(
      'DELETE FROM unavailable WHERE idmembro = $1 RETURNING *',
      [id]
    );

    if (queryResult.rowCount === 0) {
      return res.status(404).send('Indisponibilidade não encontrada');
    }

    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

export default router;
