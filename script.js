// === Toggle menú hamburguesa ===
const menuToggle = document.getElementById("menu-toggle");
const menuList = document.getElementById("menu-list");

if (menuToggle && menuList) {
  menuToggle.addEventListener("click", () => {
    menuList.style.display = menuList.style.display === "block" ? "none" : "block";
  });
}

// === Sesión ===
const rol = localStorage.getItem("rol");
const usuario = localStorage.getItem("usuario");
const loginLink = document.getElementById("login-link");
const logoutLink = document.getElementById("logout-link");
const adminPanel = document.getElementById("admin-panel");
const welcomeMessage = document.getElementById("welcome-message");

if (rol) {
  if (loginLink) loginLink.style.display = "none";
  if (logoutLink) logoutLink.style.display = "inline";
  if (welcomeMessage) {
    welcomeMessage.textContent = `Bienvenido ${rol === "admin" ? "Administrador" : "Usuario"} ${usuario}`;
  }
  if (rol === "admin" && adminPanel) {
    adminPanel.style.display = "block";
  }
} else {
  if (loginLink) loginLink.style.display = "inline";
  if (logoutLink) logoutLink.style.display = "none";
  if (adminPanel) adminPanel.style.display = "none";
}

if (logoutLink) {
  logoutLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "index.html";
  });
}

// === Perfil (solo admin puede editar) ===
function toggleEditarPerfil() {
  const editProfile = document.getElementById("edit-profile");
  if (editProfile) {
    editProfile.style.display = editProfile.style.display === "block" ? "none" : "block";
  }
}

function guardarPerfil() {
  const newName = document.getElementById("newName").value;
  const newPhoto = document.getElementById("newPhoto").files[0];

  if (newName) {
    document.getElementById("profile-name").textContent = newName;
    localStorage.setItem("profileName", newName);
  }

  if (newPhoto) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById("profile-pic").src = e.target.result;
      localStorage.setItem("profilePic", e.target.result);
    };
    reader.readAsDataURL(newPhoto);
  }

  alert("Perfil actualizado");
  toggleEditarPerfil();
}

// Cargar perfil guardado
const savedName = localStorage.getItem("profileName");
const savedPic = localStorage.getItem("profilePic");
if (savedName) document.getElementById("profile-name").textContent = savedName;
if (savedPic) document.getElementById("profile-pic").src = savedPic;

// === Contenido de semanas (local + BD) ===
const contenidoSemanas = {
  1: `
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S01/Manual Crear Cuenta en GitHub.pdf')">
      📄 Manual Crear Cuenta en GitHub
    </button>
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S01/Manual Subir Pagina Web GitHub.pdf')">
      🌐 Manual Subir Página Web GitHub
    </button>
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S01/Informe Tecnico.pdf')">
      📝 Informe Técnico
    </button>
  `,
  2: `
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S02/Manual SQL Server.pdf')">
      🗄️ Manual SQL Server
    </button>
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S02/modelo01.png')">
      ⚙️ Desarrollo Enunciado 1
    </button>
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S02/modelo02.png')">
      ⚙️ Desarrollo Enunciado 2
    </button>
  `,
   4: `
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S04/DISEÑO DE ARQUITECTURA.pdf')">
      🗄️ Diseño de Arquitecturas de Base de Datos 
    </button>
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S04/semana04-2.pdf')">
      🗄️ Analisis y diseño de la Arquitectura de Base de Datos
    </button>
  `,
  5: `
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S04/ManualAzure.pdf')">
      🗄️ Manual para crear cuenta en Azure
    </button>
    <button class="custom-button" onclick="mostrarIframe('assets/docs/S04/RepositorioAzure.pdf')">
      🗄️ Manual para subir repositorio en Azure
    </button>
  `,  
  
};

const tituloSemana = document.getElementById("titulo-semana");
const contenido = document.getElementById("contenido-semana");

function mostrarIframe(url) {
  const visor = document.getElementById("visor");
  const visorMensaje = document.getElementById("visor-mensaje");
  if (visor) {
    visor.src = url;
    visor.style.display = "block";
  }
  if (visorMensaje) {
    visorMensaje.style.display = "none";
  }
}

async function mostrarSemana(num) {
  if (tituloSemana) {
    tituloSemana.textContent = `Contenido semana ${num}`;
  }

  const formSubida = document.getElementById("form-subida");
  if (formSubida) {
    formSubida.style.display = rol === "admin" ? "block" : "none";
    formSubida.dataset.semana = num;
  }

  let html = contenidoSemanas[num] || "";

  try {
    const res = await fetch(`http://localhost:3000/archivos/${num}`);
    const archivos = await res.json();

    if (archivos.length > 0) {
      html += "<h3>Archivos subidos</h3><ul>";
      archivos.forEach(archivo => {
        html += `
          <li>
            <a href="http://localhost:3000${archivo.RutaArchivo}" target="_blank">📂 ${archivo.NombreArchivo}</a>
            ${rol === "admin" ? `<button class="btn btn-danger" onclick="eliminarArchivo(${archivo.Id}, ${num})">❌ Eliminar</button>` : ""}
          </li>
        `;
      });
      html += "</ul>";
    } else {
      html += "<p>No hay archivos subidos para esta semana.</p>";
    }
  } catch {
    html += "<p style='color:red;'></p>";
  }

  if (contenido) {
    contenido.innerHTML = `
      ${html}
      <div id="visor-contenedor">
        <iframe id="visor" class="visor"></iframe>
        <div id="visor-mensaje" class="visor-mensaje">Selecciona un archivo para verlo aquí</div>
      </div>
    `;
  }
}

const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const semana = uploadForm.parentElement.dataset.semana;
    const archivoInput = document.getElementById("archivo");
    if (!archivoInput.files.length) return alert("Selecciona un archivo");

    const formData = new FormData();
    formData.append("archivo", archivoInput.files[0]);

    try {
      const res = await fetch(`http://localhost:3000/subir/${semana}`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert("Archivo subido con éxito");
        mostrarSemana(semana);
      } else {
        alert("Error al subir archivo: " + data.message);
      }
    } catch {
      alert("Error de conexión al servidor");
    }
  });
}

async function eliminarArchivo(id, semana) {
  if (!confirm("¿Seguro que deseas eliminar este archivo?")) return;

  try {
    const res = await fetch(`http://localhost:3000/archivo/${id}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      alert("Archivo eliminado");
      mostrarSemana(semana);
    } else {
      alert("Error al eliminar archivo: " + data.message);
    }
  } catch {
    alert("Error de conexión al servidor");
  }
}
