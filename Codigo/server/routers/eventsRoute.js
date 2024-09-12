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
router.get('/', async (req, res) => {
  try {
    const queryResult = await connection.query('SELECT * FROM events');
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

//get id dos eventos
router.get('/eventId', async (req, res) => {
  try {
    const queryResult = await connection.query('SELECT id FROM events');
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

//GET EVENTOS POR INTERVALO DE DATA
router.get('/from/:date1/to/:date2', async (req, res) => {
  const { date1, date2 } = req.params;
  try {
    const queryResult = await connection.query('SELECT id FROM events WHERE dateevent BETWEEN $1 AND $2', [date1, date2]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// GET ONLY
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query("SELECT * FROM events WHERE id = $1", [id])
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
})

// POST
router.post('/', async (req, res) => {
  const {
    nameEvent, dateEvent, hourEvent, typeEvent, descEvent, preletor
  } = req.body;

  try {
    const queryResult = await connection.query('INSERT INTO events (nameEvent, dateEvent, hourEvent, typeEvent, descEvent, preletor) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [nameEvent, dateEvent, hourEvent, typeEvent, descEvent, preletor]);
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// PUT
router.put("/:id", async (req, res) => {
  const { nameEvent, dateEvent, hourEvent, typeEvent, descEvent, preletor } = req.body;
  const { id } = req.params;

  try {
    const queryResult = await connection.query(
      "UPDATE events SET nameEvent = $1, dateEvent = $2, hourEvent = $3, typeEvent = $4, descEvent = $5, preletor = $7 WHERE id = $6 RETURNING *",
      [nameEvent, dateEvent, hourEvent, typeEvent, descEvent, id, preletor]
    );
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro ocorrido com sucesso!!");
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await connection.query('DELETE FROM events WHERE id = $1', [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

//GET name by id
router.get('/name/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // console.log("STARTINNNNNNNNGGGGG")
    const queryResult = await connection.query("SELECT nameevent FROM events WHERE id = $1", [id]);
    // console.log(queryResult)
    if (queryResult.rows.length === 0) {
      // console.log("MEMBER NOOOTTTTTT FOUNDDDDDDDDDDDDDDDDDDDDDDDDD!!!!!!!")
      res.status(404).json({ message: 'Member not found' });
    } else {
      // console.log("MEMBER FOUNDDDDDDDDDDDDDDDDDDDDDDDDD!!!!!!!")
      res.json(queryResult.rows);  // Envia apenas o objeto do primeiro membro encontrado
    }

  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

// PATCH preletor by id
router.patch('/:id/preletor', async (req, res) => {
  const { id } = req.params;
  const { preletor } = req.body;  // Supondo que o novo valor de preletor seja enviado no corpo da requisição

  if (!preletor) {
    return res.status(400).json({ message: 'Preletor is required' });
  }

  try {
    // Atualiza o preletor no banco de dados
    const queryResult = await connection.query("UPDATE events SET preletor = $1 WHERE id = $2 RETURNING *", [preletor, id]);

    if (queryResult.rows.length === 0) {
      res.status(404).json({ message: 'Event not found' });
    } else {
      res.json(queryResult.rows[0]);  // Envia o objeto do evento atualizado
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});


// GET preletor
router.get("/getpreletor/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query("SELECT preletor FROM events WHERE id = $1", [id])
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error");
  }
})

export default router;
