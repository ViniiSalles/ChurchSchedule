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

// POST - Adicionar membro à banda com um papel específico
router.post("/", async (req, res) => {
  const { idMember, idBand, idRoles } = req.body;
  console.log(idBand)
  try {
    const queryResult = await connection.query(
      "INSERT INTO memberband (Idmember, Idband, idRoles) VALUES ($1, $2, $3) RETURNING *",
      [idMember, idBand, idRoles]
    );
    res.status(201).json(queryResult.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
});

// GET - Obter todos os membros das bandas
router.get("/", async (req, res) => {
  try {
    const queryResult = await connection.query("SELECT * FROM memberband");
    res.json(queryResult.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
});

// GET - Obter um membro específico da banda por ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const queryResult = await connection.query("SELECT * FROM memberband WHERE idBand = $1", [id]);
    if (queryResult.rows.length > 0) {
      res.json(queryResult.rows);
    } else {
      res.status(404).send("Entry not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
});

// PUT - Atualizar dados de um membro específico da banda
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { idMember, idBand, idRoles } = req.body;
  try {
    const queryResult = await connection.query(
      "UPDATE memberband SET idmember = $1, idband = $2, idroles = $3 WHERE id = $4 RETURNING *",
      [idMember, idBand, idRoles, id]
    );
    if (queryResult.rows.length > 0) {
      res.json(queryResult.rows[0]);
    } else {
      res.status(404).send("Entry not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
});

// DELETE - Remover um membro específico da banda
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deleteResult = await connection.query("DELETE FROM memberband WHERE id = $1", [id]);
    if (deleteResult.rowCount > 0) {
      res.status(204).send();
    } else {
      res.status(404).send("Entry not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error occurred");
  }
});

export default router;
