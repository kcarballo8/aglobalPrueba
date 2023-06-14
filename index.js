const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const config = {
  user: 'agtest',
  password: 'aggl0bal.2023',
  server: '66.94.101.248',
  database: 'db_agtest',
  options: {
    encrypt: false, //
  },
};

const pool = new sql.ConnectionPool(config);

pool.on('error', (err) => {
  console.error('error de coneccion a SQL Server:', err);
});

app.use((req, res, next) => {
  req.sql = sql;
  req.pool = pool;
  next();
});

// crear una persona
app.post('/personas', (req, res) => {
  const { dni, nombre, apellido, fecha_nacimiento, telefono } = req.body;
  const insertQuery = `INSERT INTO personas (dni, nombre, apellido, fecha_nacimiento, telefono)
                       VALUES (@dni, @nombre, @apellido, @fecha_nacimiento, @telefono)`;

  req.pool.connect().then((pool) => {
    return pool.request()
      .input('dni', sql.VarChar, dni)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('fecha_nacimiento', sql.VarChar, fecha_nacimiento)
      .input('telefono', sql.VarChar, telefono)
      .query(insertQuery);
  }).then(() => {
    res.json({ message: 'Persona creada exitosamente.' });
  }).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Error al crear persona.' });
  });
});

// obtener todas las personas
app.get('/personas', (req, res) => {
  const selectQuery = 'SELECT * FROM personas';

  req.pool.connect().then((pool) => {
    return pool.request().query(selectQuery);
  }).then((result) => {
    const rows = result.recordset;
    res.json(rows);
  }).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las personas' });
  });
});

// actualizar una persona por su ID
app.put('/personas/:id', (req, res) => {
  const { id } = req.params;
  const { dni, nombre, apellido, fecha_nacimiento, telefono } = req.body;
  const updateQuery = `UPDATE personas
                       SET dni = @dni, nombre = @nombre, apellido = @apellido,
                       fecha_nacimiento = @fecha_nacimiento, telefono = @telefono
                       WHERE id = @id`;

  req.pool.connect().then((pool) => {
    return pool.request()
      .input('dni', sql.VarChar, dni)
      .input('nombre', sql.VarChar, nombre)
      .input('apellido', sql.VarChar, apellido)
      .input('fecha_nacimiento', sql.VarChar, fecha_nacimiento)
      .input('telefono', sql.VarChar, telefono)
      .input('id', sql.Int, id)
      .query(updateQuery);
  }).then(() => {
    res.json({ message: 'Persona actualizada exitosamente' });
  }).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la persona' });
  });
});

// eliminar una persona por su ID
app.delete('/personas/:id', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM personas WHERE id = @id';

  req.pool.connect().then((pool) => {
    return pool.request()
      .input('id', sql.Int, id)
      .query(deleteQuery);
  }).then(() => {
    res.json({ message: 'Persona eliminada exitosamente' });
  }).catch((err) => {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar persona' });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});