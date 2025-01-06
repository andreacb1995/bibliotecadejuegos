//const app = require('./app');

const express = require('express');
const app = express();
const connection = require('./db'); // Importar la conexión a MySQL
const cors = require('cors'); // Importar cors
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Usar cors para permitir solicitudes desde cualquier origen (o especificar un origen)
app.use(cors());
app.use(bodyParser.json());  // Asegúrate de que el cuerpo de la solicitud esté parseado como JSON


// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, './uploads');  // Carpeta donde se guardan los archivos subidos
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Inicializa multer con la configuración de almacenamiento
const upload = multer({ storage: storage });


// Ruta para /api
app.get('/api', (req, res) => {
  res.json({
      message: 'Bienvenido a la API',
      status: 'success',
  });
});

// Ruta para obtener todos los juegos
app.get('/juegos', (req, res) => {
  const query = 'SELECT * FROM juegos'; // Consulta para obtener todos los juegos

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error al consultar los juegos: ', err);
      res.status(500).json({ error: 'Error en la consulta' });
      return;
    }

    res.json(results); // Enviar los resultados en formato JSON
  });
});


// Ruta para crear o actualizar un juego por ID
/*
app.post('/crearjuego', (req, res) => {
  const { id, nombre, descripcion, foto, manual, numero } = req.body;

  // Verificar si el juego con el ID ya existe en la base de datos
  const queryCheckUser = 'SELECT * FROM juegos WHERE id = ?';

  connection.query(queryCheckUser, [id], (err, results) => {
    if (err) {
      console.error('Error al verificar el juego:', err);
      return res.status(500).json({ error: 'Error al verificar el juego' });
    }

    // Si el juego ya existe, actualizarlo
    if (results.length > 0) {
      const queryUpdateUser = `
        UPDATE juegos
        SET nombre = ?, descripcion = ?, foto = ?, manual = ?, numero = ?
        WHERE id = ?`;

      connection.query(queryUpdateUser, [nombre, descripcion, foto, manual, numero, id], (err) => {
        if (err) {
          console.error('Error al actualizar el juego:', err);
          return res.status(500).json({ error: 'Error al actualizar el juego' });
        }

        const juegoActualizado = {
          id: id,
          nombre: nombre,
          descripcion: descripcion,
          foto: foto,
          manual: manual,
          numero: numero
        };

        // Enviar respuesta con el juego actualizado
        return res.status(200).json({
          mensaje: 'Juego actualizado correctamente.',
          juego: juegoActualizado
        });
      });

    } else {
      // Insertar un nuevo juego si no existe
      const queryInsertUser = 'INSERT INTO juegos (nombre, descripcion, foto, manual, numero) VALUES (?, ?, ?, ?, ?)';
      connection.query(queryInsertUser, [nombre, descripcion, foto, manual, numero], (err, results) => {
        if (err) {
          console.error('Error al insertar juego:', err);
          return res.status(500).json({ error: 'Error al guardar el juego' });
        }

        const nuevojuego = {
          id: results.insertId,
          nombre: nombre,
          descripcion: descripcion,
          foto: foto,
          manual: manual,
          numero: numero
        };

        // Enviar respuesta con el nuevo juego
        res.status(201).json({
          mensaje: 'Juego creado correctamente.',
          juego: nuevojuego
        });
      });
    }
  });
});*/

app.post('/crearjuego', upload.fields([{ name: 'foto' }, { name: 'manual' }]), (req, res) => {
  const { id, nombre, descripcion, numero, mantenerManual, mantenerFoto } = req.body;
  const foto = req.files['foto'] ? req.files['foto'][0].filename : null;
  const manual = req.files['manual'] ? req.files['manual'][0].filename : null;

  const queryCheckUser = 'SELECT * FROM juegos WHERE id = ?';
  
  connection.query(queryCheckUser, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar el juego' });
    }

    if (results.length > 0) {
      const fotoActual = mantenerFoto === 'true' ? results[0].foto : foto;
      const manualActual = mantenerManual === 'true' ? results[0].manual : manual;

      // Actualizar el juego si ya existe
      const queryUpdateUser = `
        UPDATE juegos
        SET nombre = ?, descripcion = ?, foto = ?, manual = ?, numero = ?
        WHERE id = ?`;

      connection.query(queryUpdateUser, [nombre, descripcion, fotoActual, manualActual, numero, id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar el juego' });
        }
        return res.status(200).json({ mensaje: 'Juego actualizado correctamente.' });
      });
    } else {
      // Insertar nuevo juego
      const queryInsertUser = `
        INSERT INTO juegos (nombre, descripcion, foto, manual, numero) VALUES (?, ?, ?, ?, ?)`;
      
      connection.query(queryInsertUser, [nombre, descripcion, foto, manual, numero], (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Error al insertar el juego' });
        }
        res.status(201).json({ mensaje: 'Juego creado correctamente.' });
      });
    }
  });
});


app.put('/prestarjuego/:id', (req, res) => {
  const { id } = req.params;
  const { alumno } = req.body;

  if (!alumno) {
    return res.status(400).json({ error: 'El nombre del alumno es requerido.' });
  }

  const query = `
    UPDATE juegos
    SET alumno = ?, prestado = 1
    WHERE id = ?`;

  connection.query(query, [alumno, id], (err, results) => {
    if (err) {
      console.error('Error al prestar el juego:', err);
      return res.status(500).json({ error: 'Error al prestar el juego' });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Juego no encontrado.' });
    }
    res.status(200).json({ mensaje: `Juego con ID ${id} prestado correctamente.` });
  });
});

// Ruta GET para devolver un juego (actualizar campos alumno y prestado)
app.put('/devolverjuego/:id', (req, res) => {
  const { id } = req.params;

  // Verificar si el juego existe en la base de datos
  const queryCheckUser = 'SELECT * FROM juegos WHERE id = ?';

  connection.query(queryCheckUser, [id], (err, results) => {
    if (err) {
      console.error('Error al verificar el juego:', err);
      return res.status(500).json({ error: 'Error al verificar el juego' });
    }

    // Si el juego no existe
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Juego no encontrado.' });
    }

    // Actualizar los campos alumno y prestado
    const queryReturnGame = `
      UPDATE juegos
      SET alumno = NULL, prestado = 0
      WHERE id = ?`;

    connection.query(queryReturnGame, [id], (err) => {
      if (err) {
        console.error('Error al devolver el juego:', err);
        return res.status(500).json({ error: 'Error al devolver el juego' });
      }

      res.status(200).json({
        mensaje: `Juego con ID ${id} devuelto correctamente.`,
        id: id
      });
    });
  });
});

// Ruta para eliminar un juego por ID
app.delete('/eliminarjuego/:id', (req, res) => {
  const { id } = req.params;

  // Verificar si el juego con el ID existe en la base de datos
  const queryCheckUser = 'SELECT * FROM juegos WHERE id = ?';

  connection.query(queryCheckUser, [id], (err, results) => {
    if (err) {
      console.error('Error al verificar el juego:', err);
      return res.status(500).json({ error: 'Error al verificar el juego' });
    }

    // Si el juego no existe, devolver un error 404
    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'Juego no encontrado.' });
    }

    // Eliminar el juego si existe
    const queryDeleteUser = 'DELETE FROM juegos WHERE id = ?';

    connection.query(queryDeleteUser, [id], (err) => {
      if (err) {
        console.error('Error al eliminar el juego:', err);
        return res.status(500).json({ error: 'Error al eliminar el juego' });
      }

      res.status(200).json({
        mensaje: `Juego con ID ${id} eliminado correctamente.`,
        id: id
      });
    });
  });
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});
