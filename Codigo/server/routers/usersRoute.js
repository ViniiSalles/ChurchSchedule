import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import connection from '../controllers/index.js';
// import bcrypt from 'bcrypt';

// const saltRounds = 10;
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
    const queryResult = await connection.query('SELECT * FROM users');
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const queryResult = await connection.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);

    if (queryResult.rows.length > 0) {
      res.send('Usuário logado com sucesso');
    } else {
      res.send('Usuário não encontrado');
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const queryResult = await connection.query('SELECT * FROM users WHERE email = $1', [email]);

    if (queryResult.rows.length === 0) {
      await connection.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password]);

      res.send({ msg: 'Usuário cadastrado com sucesso' });
    } else {
      res.send({ msg: 'Usuário já cadastrado' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).send('Error');
  }
});

export default router;
