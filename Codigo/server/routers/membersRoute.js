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
    const queryResult = await connection.query('SELECT * FROM members');
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});


// GET by Levi
router.get('/levi', async (req, res) => {
  try {
    const query = 'SELECT * FROM members WHERE louvor = true';
    const queryResult = await connection.query(query);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});

// GET by Name
router.get('/name/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM members WHERE name = $1', [name]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});


//GET NAME por id
router.get('/name-id/name/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // console.log("STARTINNNNNNNNGGGGG")
    const queryResult = await connection.query("SELECT name FROM members WHERE id = $1", [id]);
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


// GET by ministerio
router.get('/ministerio/:min', async (req, res) => {
  const { min } = req.params;

  try {
    const queryResult = await connection.query(`SELECT * FROM members WHERE ${min} = true`);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

  // GET ONLY
  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try{
      const queryResult = await connection.query("SELECT * FROM members WHERE id = $1", [id])
      res.json(queryResult.rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error");
    }
  })

// GET by NameLouvor
router.get('/levi/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const queryResult = await connection.query('SELECT * FROM members WHERE name LIKE $1 AND louvor = true', [`%${name}%`]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});


// POST
router.post('/', async (req, res) => {
  const {
    name, telefone, diaconia, louvor, midia,
  } = req.body;

  try {
    const queryResult = await connection.query('INSERT INTO members (name, telefone, diaconia, louvor, midia) VALUES ($1, $2, $3, $4, $5) RETURNING *', [name, telefone, diaconia, louvor, midia]);
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

//PUT
router.put("/:id", async (req, res) => {
  const { name, telefone, diaconia, louvor, midia} = req.body;
  const { id } = req.params;

  try {
    const queryResult = await connection.query(
      "UPDATE members SET name = $1, telefone = $2, diaconia = $3, louvor = $4, midia = $5 WHERE id = $6 RETURNING *",
      [name, telefone, diaconia, louvor, midia, id]
    );
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("Erro ocorrido com sucesso!!");
  }
});

// DELETE
router.delete('/deleteMember/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await connection.query('DELETE FROM members WHERE id = $1', [id]);
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});


// // DELETE 
// router.delete('/', async (req, res) => {
//     const { id } = req.params;
  
//     try {
//       await connection.query('DELETE FROM members');
//       res.status(204).send();
//     } catch (e) {
//       console.error(e);
//       res.status(500).send('Error');
//     }
//   });

export default router;
