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

//GET
router.get('/ministerio', async (req, res) => {
    try {
      const queryResult = await connection.query('SELECT * FROM roles');
      res.json(queryResult.rows);
    } catch (e) {
      console.error(e);
      res.status(500).send('Error');
    }
  });



//GET baseado no ministerio
router.get("/ministerio/:min", async (req, res) => {
    const { min } = req.params;
    try{
      const queryResult = await connection.query('SELECT * FROM roles WHERE ministerio = $1', [min])
      res.json(queryResult.rows);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error");
    }
  })



//GET baseado no cargo do ministerio
  router.get("/:desc", async (req, res) => {
    const { desc } = req.params;
    try{
      const queryResult = await connection.query("SELECT * FROM roles WHERE descricao = $1", [desc])
      res.json(queryResult.rows[0]);
    } catch (e) {
      console.error(e);
      res.status(500).send("Error");
    }
  })


//GET NAME por id
  router.get('/name/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const queryResult = await connection.query('SELECT descricao FROM roles WHERE id = $1', [id]);
      res.json(queryResult.rows);
    } catch (e) {
      console.error(e);
      res.status(500).send('Error');
    }
  });

  //GET ministerio por id
  router.get('/ministerio/name/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const queryResult = await connection.query('SELECT ministerio FROM roles WHERE id = $1', [id]);
      res.json(queryResult.rows);
    } catch (e) {
      console.error(e);
      res.status(500).send('Error');
    }
  });


  export default router;