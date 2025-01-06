/**
 * Escucha el evento 'DOMContentLoaded' y ejecuta el código inicial al cargar la página.
 */
document.addEventListener("DOMContentLoaded", function() {

  const formModal = document.getElementById('formModal'); 
  const formModalPrestamo = document.getElementById('formModalPrestamo'); 
  const formModalEliminar = document.getElementById('confirmEliminarModal'); 
  const formModalDevolver = document.getElementById('confirmDevolverModal'); 

  const btnGuardar = document.getElementById('btn-guardar');
  const btnPrestar = document.getElementById('btn-prestar');
  const btnDevolver = document.getElementById('btn-devolver');
  const btnEliminar = document.getElementById('btn-eliminar');

  formModal.style.display = 'none';
  formModalPrestamo.style.display = 'none';

  cargarJuegos();


  /**
   * Evento click para mostrar el formulario de creación de juego.
   * @param {Event} event - El evento generado al hacer clic.
   */
  document.getElementById('addJuego').addEventListener('click', function(event) {
    event.preventDefault();
    Editando = false; 
    crearJuegoForm.reset(); 

    document.getElementById('juegoId').value = ''; // Limpiar el campo oculto del ID del alumno
    document.getElementById('formModal').querySelector('h2').textContent = 'Nuevo Juego'; 
    btnGuardar.style.display = 'inline-block'; 
    btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar'; 
    document.getElementById('btn-modificar').style.display = 'none';
    btnPrestar.style.display = 'none'; 
    btnDevolver.style.display = 'none'; 
    btnEliminar.style.display = 'none'; 

    establecercampos()
    abrirModal(formModal);
  });

  document.getElementById('cerrarModal').addEventListener('click', (event) => {
    event.stopPropagation();
    cerrarModal(formModal);
  });

  document.getElementById('cerrarModalPrestamo').addEventListener('click', (event) => {
    event.stopPropagation();
    cerrarModal(formModalPrestamo); 
  });

  document.getElementById('cancelarElimButton').addEventListener('click', (event) => {
    event.stopPropagation();
    cerrarModal(formModalEliminar);
  });

  document.getElementById('cancelarDevolverButton').addEventListener('click', (event) => {
    event.stopPropagation();
    cerrarModal(formModalDevolver);
  });

  document.getElementById('confirmDevolverButton').addEventListener('click', (event) => {
    const juegoId = document.getElementById('juegoId').value;

    // Verificar si se obtuvo el ID
    if (!juegoId) {
      alert('Error: No se pudo identificar el juego.');
      return;
    }      

    fetch(`http://localhost:3000/devolverjuego/${juegoId}`, {
      method: 'PUT'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al eliminar el juego.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta del servidor:', data);
      cargarJuegos();  // Actualiza la lista de juegos
      cerrarModal(document.getElementById('confirmDevolverModal'));  // Cierra el modal de confirmación
      cerrarModal(document.getElementById('formModal'));  // Cierra el modal de confirmación

    })
    .catch(error => {
      console.error('Error en la operación:', error);
      alert('Hubo un problema al eliminar el juego.');
    });


  });

  document.getElementById('confirmEliminarButton').addEventListener('click', (event) => {
    const juegoId = document.getElementById('juegoId').value;

    // Verificar si se obtuvo el ID
    if (!juegoId) {
      alert('Error: No se pudo identificar el juego.');
      return;
    }      

    fetch(`http://localhost:3000/eliminarjuego/${juegoId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al eliminar el juego.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta del servidor:', data);
      cargarJuegos();  // Actualiza la lista de juegos
      cerrarModal(document.getElementById('confirmEliminarModal'));  // Cierra el modal de confirmación
      cerrarModal(document.getElementById('formModal'));  // Cierra el modal de confirmación

    })
    .catch(error => {
      console.error('Error en la operación:', error);
      alert('Hubo un problema al eliminar el juego.');
    });

  });

  document.getElementById('fotoBtn').addEventListener('click', function() {
    const fileFoto = document.getElementById('foto');
    const fileSpanFoto = document.getElementById('fileFoto');
    const fotoBtn = document.getElementById('fotoBtn');

    fileFoto.value = '';  
    fileFoto.disabled = false; 
    fileSpanFoto.textContent = '';
    fotoBtn.style.display = 'none'; 
  });

  document.getElementById('cambiarmanualBtn').addEventListener('click', function() {
    const filemanual = document.getElementById('manual');
    const fileSpan = document.getElementById('archivomanual');
    const linkmanual = document.getElementById('linkmanual');
    const cambiarmanualBtn = document.getElementById('cambiarmanualBtn');

    filemanual.value = '';  
    filemanual.disabled = false; 
    fileSpan.textContent = '';
    linkmanual.innerHTML = ''; 
    cambiarmanualBtn.style.display = 'none'; 
  });

  document.getElementById('btn-prestar2').addEventListener('click', function() {
    const juegoId = document.getElementById('juegoId').value;
    const alumno = document.getElementById('alumnoprestamo').value;  // Campo para el alumno

    // Validar que el alumno esté ingresado
    if (!alumno) {
      alert('Por favor, ingresa el nombre del alumno.');
      return;
    }

    // Crear objeto con los datos del préstamo
    const juego = {
      alumno: alumno,
      prestado: 1  // Marcamos como prestado
    };

    // Enviar los datos al servidor
    fetch(`http://localhost:3000/prestarjuego/${juegoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(juego)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo completar el préstamo.');
      }
      return response.json();
    })
    .then(data => {
      console.log('Respuesta del servidor:', data);
      //cargarJuegos();  // Actualiza la lista de juegos
      //cerrarModal(document.getElementById('formModalPrestamo'));  // Cierra el modal
    })
    .catch(error => {
      console.error('Error en la operación:', error);
    });
  
});

  /**
   * Evento submit para enviar los datos del formulario de creación de juego.
   * @param {Event} event - El evento generado al enviar el formulario.
   */
  formModal.addEventListener('submit', function(event) {
    event.preventDefault();

    // Crear FormData para enviar archivos y datos
    const formData = new FormData();

    // Obtener los valores de los campos del formulario
    const juegoId = document.getElementById('juegoId').value;
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const numero = document.getElementById('numero').value;
    const foto = document.getElementById('foto').files[0];  // Archivos
    const fotoFiles = document.getElementById('foto');  // Archivos
    const manual = document.getElementById('manual').files[0];
    const manualFiles = document.getElementById('manual');


    if (manualFiles.files.length > 0 ) {
        if (manual) formData.append('manual', manual);  // Añadir archivo solo si existe
    } else {
      formData.append('mantenerManual', 'true');  // Bandera para indicar que no se cambia
    }

    if (fotoFiles.files.length > 0 ) {
      if (foto) formData.append('foto', foto);  // Añadir archivo solo si existe
    } else {
      formData.append('mantenerFoto', 'true');  // Bandera para indicar que no se cambia
    }


    // Validar que los campos no estén vacíos
    if (!nombre || !descripcion || !numero) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Añadir los datos al FormData (incluyendo archivos)
    formData.append('id', juegoId);
    formData.append('nombre', nombre);
    formData.append('descripcion', descripcion);
    formData.append('numero', numero);

    // Identificar qué botón fue presionado
    const accion = event.submitter.id;

    let url = 'http://localhost:3000/CrearJuego';
    let metodo = 'POST';  // Por defecto, crear/actualizar el juego

    switch (accion) {
        case 'btn-prestar':
          abrirModal(document.getElementById('formModalPrestamo'))
          return;
        case 'btn-devolver':
          abrirModal(document.getElementById('confirmDevolverModal'))
          return;
        case 'btn-eliminar':
          abrirModal(document.getElementById('confirmEliminarModal'))
          return;
    }

    // Enviar los datos al servidor
    fetch(url, {
      method: metodo,
      body: formData  // Enviar FormData directamente
    })
    .then(response => response.json())
    .then(data => {
      console.log('Respuesta del servidor:', data);
      cargarJuegos();  // Actualiza la lista de juegos
      cerrarModal(document.getElementById('formModal'));  // Cierra el modal
    })
    .catch(error => {
      console.error('Error en la operación:', error);
    });
  });

});

/**
 * Carga la lista de juegos desde el servidor.
 */
function cargarJuegos() {
    fetch('http://localhost:3000/juegos', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(juegos => {
      mostrarjuego(juegos);
    })
    .catch(error => console.error('Error:', error));
}

function mostrarjuego(juegos) {
  const cardsContainer = document.getElementById('tarjetasJuegos');
  cardsContainer.innerHTML = ''; 

  juegos.forEach(juego => {
    const foto = (juego && juego.foto) ? juego.foto : 'anpa.png';
    
    // Crear tarjeta
    const card = document.createElement('div');
    card.classList.add('card');
    card.setAttribute('data-prestado', juego.prestado);  // Añadir el atributo data-prestado
    card.innerHTML = `
      <img src="/uploads/${foto}" class="card-img-top" alt="Foto de juego" onerror="this.onerror=null; this.src='/uploads/anpa.png';">
      <div class="card-body">
        <h5 class="card-title text-dark font-weight-bold">${juego.nombre}</h5>
        <h6 class="card-subtitle text-muted mb-2">Número: ${juego.numero}</h6>
        <p>${juego.descripcion}</p>
        <span class="badge ${juego.prestado ? 'badge-danger' : 'badge-success'}">
          ${juego.prestado ? 'Prestado' : 'Disponible'}
        </span>
      </div>
    `;
    
    // Añadir tarjeta al contenedor
    cardsContainer.appendChild(card);

    card.addEventListener('click', function () {

      const modal = document.getElementById('formModal');  // Buscar el modal cada vez que se haga clic
      const modalTitulo = modal.querySelector('h2');

      const btnGuardar = document.getElementById('btn-guardar');
      const btnModificar = document.getElementById('btn-modificar');
      const btnPrestar = document.getElementById('btn-prestar');
      const btnDevolver = document.getElementById('btn-devolver');
      const btnEliminar = document.getElementById('btn-eliminar');

      if (modal) {
          abrirModal(modal);
          establecercampos()
          document.getElementById('juegoId').value = juego.id;
          document.getElementById('nombre').value = juego.nombre;
          document.getElementById('descripcion').value = juego.descripcion;
          document.getElementById('numero').value = juego.numero;
          document.getElementById('alumnop').value = juego.alumno;

          prestamo = document.getElementById('alumno');
          const mensajeSinCambios = document.getElementById('mensajeSinCambios');
          mensajeSinCambios.textContent = '';
          
          modalTitulo.textContent = 'Juego'; 

          btnGuardar.style.display = 'none'; 
          btnModificar.style.display = 'block'; 
          btnEliminar.style.display = 'block'; 

          if (juego.prestado == 0) {
            prestamo.style.display = 'none'; 
            btnDevolver.style.display = 'none'; 
            btnPrestar.style.display = 'block'; 
          }else{
            prestamo.style.display = 'block'; 
            btnDevolver.style.display = 'block';
            btnPrestar.style.display = 'none'; 
          }

          const archivoFoto = document.getElementById('fileFoto');
          const archivomanual = document.getElementById('archivomanual'); 

          if (juego.foto != null ){
            const foto = document.getElementById('foto');
            const fotoBtn = document.getElementById('fotoBtn');

            fotoBtn.style.display = 'inline-block';
            foto.disabled = true; 
            archivoFoto.textContent = `Archivo seleccionado: ${juego.foto}`;

          }
          //else {
          //  archivoFoto.textContent = 'Este juego no tiene Foto.';
          //}

          if (juego.manual != null ){
            const manual = document.getElementById('manual');
            const cambiarmanualBtn = document.getElementById('cambiarmanualBtn');
            const linkmanual = document.getElementById('linkmanual'); 

            cambiarmanualBtn.style.display = 'inline-block';
            manual.disabled = true;
            archivomanual.textContent = `Archivo seleccionado: ${juego.manual}`;
            const link = document.createElement("a");
            link.href = `/uploads/${juego.manual}`;
            link.textContent = "Descargar Manual";
            link.target = "_blank"; 
            linkmanual.innerHTML = '';  // Limpiar antes de añadir nuevo enlace
            linkmanual.appendChild(link);
         
          }
          //else {
          //      archivomanual.textContent = 'Este juego no tiene Manual.';
          //}
      } else {
          console.error('Modal no encontrado.');
      }
  });

  });
}

/**
 * Muestra un mensaje de error al juego.
 * @param {string} mensaje - El mensaje de error a mostrar.
 */
function mostrarMensajeError(mensaje) {
    const resultadoDiv = document.getElementById('resultadoBusqueda');
    resultadoDiv.innerHTML = `<p style="color: red;">${mensaje}</p>`;
    resultadoDiv.style.display = 'flex';
    setTimeout(() => {
        resultadoDiv.style.display = 'none';
    }, 3000);
}

/**
 * Muestra un mensaje de éxito al juego.
 * @param {string} mensaje - El mensaje de éxito a mostrar.
 */
function mostrarMensajeExito(mensaje) {
    const resultadoDiv = document.getElementById('resultadoBusqueda');
    resultadoDiv.style.display = 'flex';
    resultadoDiv.innerHTML = `<p style="color: green;">${mensaje}</p>`;
    setTimeout(() => {
        resultadoDiv.style.display = 'none';
    }, 3000);
}

/**
 * Función para abrir un modal.
 * @param {HTMLElement} modal - Elemento modal a abrir.
 */
function abrirModal(modal) {
  //window.scrollTo(0, 0);
  document.body.style.overflow = 'hidden';
  modal.style.display = 'flex';
  const modalBody = modal.querySelector('.modal-body');
  if (modalBody) {
    modalBody.scrollTop = 0; 
  } else {
    modal.scrollTop = 0; 
  }
  modal.focus();
}

/**
 * Función para cerrar un modal.
 * @param {HTMLElement} modal - Elemento modal a cerrar.
 */
function cerrarModal(modal) {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function establecercampos() {
  const cambiarmanualBtn = document.getElementById('cambiarmanualBtn'); 
  const manual = document.getElementById('manual'); 
  const archivomanual = document.getElementById('archivomanual'); 
  const linkmanual = document.getElementById('linkmanual'); 

  // Restablecer estados iniciales de los campos relacionados con archivos.
  linkmanual.innerHTML = ''; 
  cambiarmanualBtn.style.display = 'none'; 
  manual.disabled = false; 
  archivomanual.textContent = '';

  const fotoBtn = document.getElementById('fotoBtn');  
  const fotojuego = document.getElementById('foto'); 
  const fileFoto = document.getElementById('fileFoto'); 

  fileFoto.innerHTML = ''; 
  fotoBtn.style.display = 'none'; 
  fotojuego.disabled = false; 
  fileFoto.textContent = '';
}
function buscarJuego() {
  const input = document.getElementById('IdJuego').value.toLowerCase();
  const filtroPrestamo = document.getElementById('filtroPrestamo').value;
  const tarjetas = document.querySelectorAll('#tarjetasJuegos .card');
  let hayCoincidencias = false;

  tarjetas.forEach(tarjeta => {
    const textoTarjeta = tarjeta.innerText.toLowerCase();
    const prestado = tarjeta.getAttribute('data-prestado');  // 0 (disponible) o 1 (prestado)
    let mostrar = true;

    // Filtro por texto (nombre/número)
    if (input && !textoTarjeta.includes(input)) {
      mostrar = false;
    }

    // Filtro por préstamo
    if (filtroPrestamo === 'prestados' && prestado !== '1') {
      mostrar = false;
    } else if (filtroPrestamo === 'disponibles' && prestado !== '0') {
      mostrar = false;
    }

    // Mostrar u ocultar tarjeta
    tarjeta.style.display = mostrar ? 'block' : 'none';

    if (mostrar) {
      hayCoincidencias = true;
    }
  });

  // Mostrar mensaje si no hay resultados
  const mensaje = document.getElementById('mensaje-no-encontrado');
  if (!hayCoincidencias) {
    if (!mensaje) {
      const row = document.createElement('div');
      row.classList.add('w-100');
      row.id = 'mensaje-no-encontrado';
      row.innerHTML = `<p class="text-center w-100">No se encontraron resultados</p>`;
      document.getElementById('tarjetasJuegos').appendChild(row);
    }
  } else {
    if (mensaje) {
      mensaje.remove();
    }
  }
}


