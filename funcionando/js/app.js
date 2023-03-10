//Vaciar ls para las pruebas
const btnEliminarLocalStorage = document.querySelector('#btnBorrarLS');
btnEliminarLocalStorage.addEventListener('click', confirmarEliminacionLocalStorage);
function confirmarEliminacionLocalStorage() {
  const confirmacion = confirm('¿Está seguro que desea eliminar todos los datos almacenados?');

  if (confirmacion) {
    localStorage.clear();
    location.reload();
  };
};


const btnDetener = document.querySelector('#btnDetener');
const btnIniciar = document.querySelector('#btnIniciar');
const progressBar = document.querySelector('.determinate');
const errorContainer = document.getElementById('error-container');
const reportContainer = document.getElementById('report-container');
const progressPercentage = document.querySelector('.progress-percentage');

let totalTrabajadores = 0;
let trabajadoresCompletados = 0;
let currentIndex = 0;
let pausado = false;

btnDetener.addEventListener('click', pausar);
btnIniciar.addEventListener('click', fetchTrabajadores);

function showError(message) {
  errorContainer.innerHTML = message;
};

function showEnd(report) {
  reportContainer.innerHTML = report;
};

function pausar() {
  btnIniciar.disabled = false;
  btnDetener.disabled = true;
  pausado = true;
};

function actualizarBarraProgreso(percentageCompleted) {
  progressBar.style.width = `${percentageCompleted}%`;
  progressPercentage.innerText = `${percentageCompleted}%`;

};

function fetchTrabajadores() {
  btnIniciar.disabled = true;
  btnDetener.disabled = false;
  pausado = false;
  errorContainer.innerText = '';

  // Obtener la lista JSON de trabajadores desde el servidor
  fetch('https://sistemas.cruzperez.com/pramos12/script/trabajadores.json')
    .then(response => response.json())
    .then(data => {
      // Recorrer la lista de trabajadores y hacer una llamada fetch para cada número
      const trabajadores = data.trabajadores;
      totalTrabajadores = trabajadores.length;

      // Recuperar el porcentaje completado desde el localStorage
      const savedPercentage = localStorage.getItem('percentageCompleted');
      const savedIndex = localStorage.getItem('lastIndex');
      const savedTrabajadoresCompletados = localStorage.getItem('trabajadoresCompletados');

      if (savedPercentage && savedIndex) {
        currentIndex = parseInt(savedIndex);
        trabajadoresCompletados = parseInt(savedTrabajadoresCompletados);
        const parsedPercentage = parseInt(savedPercentage);
        actualizarBarraProgreso(parsedPercentage);
      };

      function fetchData() {
        if (!pausado && currentIndex < totalTrabajadores) {
          const numero_trabajador = trabajadores[currentIndex];
          fetch(`https://sistemas.cruzperez.com/pramos12/script/funcionando/data.php?numero=${numero_trabajador}`)
            .then(response => response.json())
            .then(data => {
              console.log(data);

              trabajadoresCompletados++;
              currentIndex++;

              const percentageCompleted = Math.round((currentIndex / totalTrabajadores) * 100);

              localStorage.setItem('percentageCompleted', percentageCompleted); // Guardar el porcentaje completado en el localStorage
              localStorage.setItem('lastIndex', currentIndex); // Guardar el índice del último trabajador cargado en el localStorage
              localStorage.setItem('trabajadoresCompletados', trabajadoresCompletados); // Guardar la cantidad total de trabajadores en el localStorage

              setTimeout(() => actualizarBarraProgreso(percentageCompleted), 500); // Delay de 0.5 segundos entre cada actualización de barra de progreso
              setTimeout(fetchData, 100); // Delay de 0.2 segundo por fetch
              if (percentageCompleted == 100) {
                pausado = true;
                btnIniciar.disabled = true;
                btnDetener.disabled = true;
                showEnd(`
                  <h5>Proceso finalizado</h5>
                  <p>Se han cargado los datos de ${trabajadoresCompletados} trabajadores.</p>
                  <br>
                `);
              };
            })
            .catch(error => {
              pausado = true;
              btnIniciar.disabled = false;
              btnDetener.disabled = true;

              console.error(error);
              showError(`
              <h5>Error</h5>
              <p>Error al cargar los datos del trabajador con el número: ${numero_trabajador}</p>
              <p>Error: ${error.message}</p>
              <br>
              <p>Presione el botón "Iniciar proceso" para continuar.</p>
            `); // Mostrar el mensaje de error en el div de errores
            });
        };
      };
      fetchData();
    })
    .catch(error => {
      console.error(error)
    });
};

window.addEventListener('load', () => {
  btnIniciar.disabled = false;
  btnDetener.disabled = true;

  const savedPercentage = localStorage.getItem('percentageCompleted');
  const savedIndex = localStorage.getItem('lastIndex');
  const savedTrabajadoresCompletados = localStorage.getItem('trabajadoresCompletados');

  if (savedPercentage) {
    const parsedPercentage = parseInt(savedPercentage);
    actualizarBarraProgreso(parsedPercentage);
  }
  if (savedPercentage == 100) {
    btnIniciar.disabled = true;
    btnDetener.disabled = true;
    showEnd(`
      <h5>Proceso finalizado</h5>
      <p>Se han cargado los datos de ${trabajadoresCompletados} trabajadores de ${currentIndex}.</p>
      <br>
    `);
  };
});