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


//POST
router.post('/', async (req, res) => {
    const {
      id, nome, cargo, idevent
    } = req.body;
  
    try {
      const queryResult = await connection.query('INSERT INTO volunteers (id, nome, cargo, idevent) VALUES ($1, $2, $3, $4) RETURNING *', [id, nome, cargo, idevent]);
      res.json(queryResult.rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).send('Error');
    }
  });

  router.get('/all', async (req, res) => {
    try {
      const queryResult = await connection.query('SELECT * FROM volunteers');
      res.json(queryResult.rows);
    } catch (e) {
      console.error(e);
      res.status(500).send('Error');
    }
  });


  
  //GET BY EVENTID
  router.get("/:eventid", async (req, res) => {
    const { eventid } = req.params;
    try{
      const queryResult = await connection.query("SELECT * FROM volunteers WHERE idevent = $1", [eventid])
      res.json(queryResult.rows);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error");
    }
  })

// DELETE
router.delete('/delete/:idevent', async (req, res) => {
  const { idevent } = req.params;

  try {
    await connection.query('DELETE FROM volunteers WHERE idevent = $1', [idevent]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});



// GET maior id da tabela voluntario
router.get('/id/maxid', async (req, res) => {
  try {
    const queryResult = await connection.query('SELECT MAX(id) AS maxid FROM volunteers');
    res.json(queryResult.rows[0].maxid); // Acessa diretamente o valor máximo
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});









export default router;
