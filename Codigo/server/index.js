import express from 'express';
import membersRouter from './routers/membersRoute.js';
import eventsRouter from './routers/eventsRoute.js';
import bandsRouter from './routers/bandsRoute.js';
import usersRouter from './routers/usersRoute.js';
import cargosRouter from './routers/cargosRoute.js';
import scalesRouter from './routers/scalesRoute.js';
import volunteersRouter from './routers/volunteersRoute.js';
import levitasRouter from './routers/levitasRoute.js'
import unavailableRouter from './routers/unavailableRoute.js'

const app = express();
const PORT = process.env.PORT || 3001;
app.use('/members', membersRouter);
app.use('/events', eventsRouter);
app.use('/bands', bandsRouter);
app.use('/users', usersRouter);
app.use('/escala', cargosRouter);
app.use('/escala-principal', scalesRouter);
app.use('/volunteers', volunteersRouter);
app.use('/levitas', levitasRouter)
app.use('/unavailable', unavailableRouter)

app.listen(PORT, () => {
  console.log(`Listening to ${PORT}`);
});
