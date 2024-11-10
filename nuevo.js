let peliculas = []; 
let peliculasFiltradas = []; 
let paginaActual = 1;
const peliculasPorPagina = 10;

const cargarImagenes = async () => {
  const url = 'https://imdb188.p.rapidapi.com/api/v1/getFanFavorites?country=US';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '9cd8a412e8msh32562a165b35b5ep13d3c4jsnd7ec50c8c811',
      'x-rapidapi-host': 'imdb188.p.rapidapi.com'
    },
    timeout: 5000 
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Error en la solicitud: ${response.status}`);

    const data = await response.json();

    if (!data || !data.data || !Array.isArray(data.data.list)) {
      throw new Error("Estructura de datos inesperada en la respuesta");
    }

    // Limita la cantidad de datos a 100 para evitar problemas de tamaño
    peliculas = data.data.list.slice(0, 100);
    peliculasFiltradas = peliculas;
    mostrarPeliculas(); 

  } catch (error) {
    console.error("Error al cargar las películas:", error);
    alert('Hubo un problema al cargar las películas. Intenta de nuevo más tarde.');
  }
};

const mostrarPeliculas = () => {
  const contenedor = document.getElementById('peliculas-container');
  if (!contenedor) {
    console.error("No se encontró el contenedor de películas");
    return;
  }

  contenedor.innerHTML = '';

  const inicio = (paginaActual - 1) * peliculasPorPagina;
  const fin = inicio + peliculasPorPagina;
  const peliculasPagina = peliculasFiltradas.slice(inicio, fin);

  if (peliculasPagina.length === 0) {
    contenedor.innerHTML = '<p>No se encontraron películas para mostrar.</p>';
    return;
  }

  peliculasPagina.forEach(pelicula => {
    const div = document.createElement('div');
    div.classList.add('pelicula');

    const imageUrl = pelicula.primaryImage ? pelicula.primaryImage.imageUrl : "";
    const title = pelicula.titleText ? pelicula.titleText.text : "Título no disponible";
    const releaseYear = pelicula.releaseYear ? pelicula.releaseYear.year : "Año no disponible";
    const genre = pelicula.titleType ? pelicula.titleType.text : "Género no disponible";
    const description = pelicula.plot && pelicula.plot.plotText ? pelicula.plot.plotText.plainText : "Descripción no disponible";

    div.innerHTML = `
      <img src="${imageUrl}" alt="${title}" />
      <div class="pelicula-info">
        <h3>${title}</h3>
        <p><strong>Año:</strong> ${releaseYear}</p>
        <p><strong>Género:</strong> ${genre}</p>
        <p><strong>Descripción:</strong> ${description}</p>
      </div>
    `;

    contenedor.appendChild(div);
  });

  actualizarBotones();
};

const actualizarBotones = () => {
  const btnAnterior = document.getElementById('btn-anterior');
  const btnSiguiente = document.getElementById('btn-siguiente');
  if (btnAnterior && btnSiguiente) {
    btnAnterior.disabled = paginaActual === 1;
    btnSiguiente.disabled = paginaActual * peliculasPorPagina >= peliculasFiltradas.length;
  }
};

const cambiarPagina = (incremento) => {
  const maxPaginas = Math.ceil(peliculasFiltradas.length / peliculasPorPagina);
  paginaActual = Math.min(Math.max(paginaActual + incremento, 1), maxPaginas);
  mostrarPeliculas();
};

const filtrarPorGenero = () => {
  const generoSeleccionado = document.getElementById('genre-select').value;

  peliculasFiltradas = generoSeleccionado
    ? peliculas.filter(pelicula => (pelicula.titleType?.text || "").toLowerCase().includes(generoSeleccionado.toLowerCase()))
    : peliculas;
  
  paginaActual = 1;
  mostrarPeliculas();
};

const buscarPeliculas = () => {
  const query = document.getElementById('search-input').value.toLowerCase();

  peliculasFiltradas = peliculas.filter(pelicula => (pelicula.titleText?.text || "").toLowerCase().includes(query));
  paginaActual = 1;
  mostrarPeliculas();
};

// Event Listeners
document.getElementById('genre-select')?.addEventListener('change', filtrarPorGenero);
document.getElementById('search-input')?.addEventListener('input', buscarPeliculas);
document.getElementById('btn-anterior')?.addEventListener('click', () => cambiarPagina(-1));
document.getElementById('btn-siguiente')?.addEventListener('click', () => cambiarPagina(1));

// Ejecutar la carga inicial de imágenes
cargarImagenes();