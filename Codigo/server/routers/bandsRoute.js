import express from "express";
import cors from "cors";
import connection from "../controllers/index.js";

const router = express.Router();

const corsOptions = {
  origin: 'https://schedule-seven.vercel.app', // Substitua pela URL do seu aplicativo cliente
  optionsSuccessStatus: 200
};

router.use(cors(corsOptions));
// router.use(cors());
router.use(express.json());

// POST
router.post("/", async (req, res) => {
  const { nome } = req.body;
  console.log(nome)

  try {
    const queryResult = await connection.query(
      "INSERT INTO bands (nome) VALUES ($1) RETURNING *",
      [nome]  // Use a mesma chave que você ajustou
    );
    res.json(queryResult.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occurred");
  }
});

// GET all bands
router.get("/", async (req, res) => {
  try {
    const queryResult = await connection.query("SELECT * FROM bands");
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occurred");
  }
});

// GET a single band by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query("SELECT * FROM bands WHERE id = $1", [id]);
    if (queryResult.rows.length > 0) {
      res.json(queryResult.rows[0]);
    } else {
      res.status(404).send("Band not found");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occurred");
  }
});

// PUT - Update a band's name
router.put("/:id", async (req, res) => {
  const { nome } = req.body;
  const { id } = req.params;

  try {
    const queryResult = await connection.query(
      "UPDATE bands SET nome = $1 WHERE id = $2 RETURNING *",
      [nome, id]
    );
    if (queryResult.rows.length > 0) {
      res.json(queryResult.rows[0]);
    } else {
      res.status(404).send("Band not found");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occurred");
  }
});

// DELETE a band
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResult = await connection.query("DELETE FROM bands WHERE id = $1", [id]);
    if (deleteResult.rowCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).send("Band not found");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occurred");
  }
});

router.get("/bandMember-get/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query("SELECT * FROM MemberBand WHERE idmember = $1", [id]);
    res.json(queryResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occurred");
  }
});

//delete membro de uma banda cadastrada
router.delete("/bandMember-delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResult = await connection.query("DELETE FROM MemberBand WHERE idmember = $1", [id]);
    res.json(deleteResult.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error occurred");
  }
});


export default router;