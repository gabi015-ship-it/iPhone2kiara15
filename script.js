// script.js - Versión optimizada para Safari iOS
window.onload = function () {
  const inicio = document.getElementById("inicio");
  const videoIntro = document.getElementById("videoIntro");
  const elegante = document.getElementById("elegante");
  const videoFondo = document.getElementById("videoFondoInvitacion");
  let iniciado = false;

  // Función para manejar la reproducción de video en Safari
  function playVideoWithFallback(videoElement) {
    if (!videoElement) return Promise.reject('No video element');
    
    // Intentar reproducir
    return videoElement.play().catch(error => {
      console.log("Error de reproducción:", error);
      return Promise.reject(error);
    });
  }

  // Iniciar la experiencia al hacer clic
  inicio.addEventListener("click", (e) => {
    if (iniciado) return;
    iniciado = true;
    
    const mensaje = document.getElementById("mensaje");
    if (mensaje) mensaje.style.display = "none";
    
    // Activar sonido de la intro
    videoIntro.muted = false;
    
    // Intentar reproducir la intro
    videoIntro.play().catch(error => {
      console.log("Error al reproducir video:", error);
      continuarConInvitacion();
    });

    // Safari usa 'webkitend' como alternativa a 'ended'
    videoIntro.addEventListener("ended", function onEnded() {
      videoIntro.removeEventListener("ended", onEnded);
      continuarConInvitacion();
    });
    
    videoIntro.addEventListener("webkitend", function onWebKitEnd() {
      videoIntro.removeEventListener("webkitend", onWebKitEnd);
      continuarConInvitacion();
    });
    
    function continuarConInvitacion() {
      inicio.style.opacity = "0";
      setTimeout(() => {
        inicio.classList.remove("activa");
        elegante.classList.add("activa");
        
        if (videoFondo) {
          // Intentar reproducir el video de fondo
          videoFondo.play().catch(e => console.log("Error video fondo:", e));
        }
      }, 1000);
    }
  });

  // Prevenir selección de texto en elementos interactivos para Safari
  const interactiveElements = document.querySelectorAll('button, .btn-plata, .control-btn, .volume-btn, .gif-mapa, .gif-regalo, .creditos-redes a, .creditos-qr-img');
  interactiveElements.forEach(el => {
    el.addEventListener('touchstart', (e) => {
      // Prevenir selección de texto en Safari
      e.currentTarget.style.webkitTapHighlightColor = 'transparent';
    });
  });

  // ========== REPRODUCTOR DE MÚSICA ==========
  const audio = document.getElementById("audio");
  const playBtn = document.getElementById("play");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const progressBar = document.getElementById("progress");
  const progressContainer = document.querySelector(".progress-container");
  const currentTimeSpan = document.getElementById("current");
  const durationSpan = document.getElementById("duration");
  const volumeIcon = document.getElementById("volumeIcon");
  const volumeSliderContainer = document.getElementById("volumeSliderContainer");
  const volumeSlider = document.getElementById("volume");

  let isPlaying = false;

  // Establecer volumen inicial
  if (volumeSlider && audio) {
    volumeSlider.value = "0.7";
    audio.volume = 0.7;
  }

  // Cambiar icono de volumen según el nivel
  function updateVolumeIcon(volume) {
    if (volumeIcon) {
      if (volume == 0) {
        volumeIcon.textContent = "🔇";
      } else if (volume < 0.5) {
        volumeIcon.textContent = "🔉";
      } else {
        volumeIcon.textContent = "🔊";
      }
    }
  }

  /* MOSTRAR/OCULTAR CONTROL DE VOLUMEN VERTICAL */
  if (volumeIcon && volumeSliderContainer) {
    volumeIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      volumeSliderContainer.classList.toggle("show");
    });
    
    // Safari: prevenir comportamiento predeterminado
    volumeIcon.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      volumeSliderContainer.classList.toggle("show");
    });
  }

  /* CERRAR CONTROL DE VOLUMEN AL HACER CLICK FUERA */
  document.addEventListener("click", function(e) {
    if (volumeSliderContainer && volumeIcon) {
      if (!volumeSliderContainer.contains(e.target) && !volumeIcon.contains(e.target)) {
        volumeSliderContainer.classList.remove("show");
      }
    }
  });
  
  // Safari: también cerrar con touch
  document.addEventListener("touchstart", function(e) {
    if (volumeSliderContainer && volumeIcon) {
      if (!volumeSliderContainer.contains(e.target) && !volumeIcon.contains(e.target)) {
        volumeSliderContainer.classList.remove("show");
      }
    }
  });

  /* CONTROL DE VOLUMEN */
  if (volumeSlider && audio) {
    volumeSlider.addEventListener("input", (e) => {
      const volume = parseFloat(e.target.value);
      audio.volume = volume;
      updateVolumeIcon(volume);
    });
    
    // Safari: soporte para evento change
    volumeSlider.addEventListener("change", (e) => {
      const volume = parseFloat(e.target.value);
      audio.volume = volume;
      updateVolumeIcon(volume);
    });
  }

  /* ACTUALIZAR ICONO CUANDO EL AUDIO CAMBIA EL VOLUMEN POR OTROS MEDIOS */
  if (audio) {
    audio.addEventListener("volumechange", () => {
      if (volumeSlider) {
        volumeSlider.value = audio.volume;
        updateVolumeIcon(audio.volume);
      }
    });
  }

  /* PLAY / PAUSE - SOLO SE REPRODUCE AL HACER CLIC */
  if (playBtn && audio) {
    const togglePlay = () => {
      if (isPlaying) {
        audio.pause();
        playBtn.textContent = "▶";
      } else {
        // Safari requiere interacción de usuario para audio
        audio.play().catch(error => {
          console.log("Error al reproducir audio:", error);
          // Mostrar mensaje amigable si Safari bloquea
          if (error.name === "NotAllowedError") {
            alert("Por favor, toca el botón de play nuevamente para reproducir la música.");
          }
        });
        playBtn.textContent = "⏸";
      }
      isPlaying = !isPlaying;
    };
    
    playBtn.addEventListener("click", togglePlay);
    playBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      togglePlay();
    });
  }

  /* ACTUALIZAR PROGRESO */
  if (audio) {
    audio.addEventListener("timeupdate", () => {
      const { currentTime, duration: dur } = audio;

      if (dur && progressBar && !isNaN(dur)) {
        const percent = (currentTime / dur) * 100;
        progressBar.style.width = percent + "%";

        if (currentTimeSpan) currentTimeSpan.textContent = formatTime(currentTime);
        if (durationSpan && !isNaN(dur)) durationSpan.textContent = formatTime(dur);
      }
    });
    
    // Cuando el audio está listo, mostrar duración
    audio.addEventListener("loadedmetadata", () => {
      if (durationSpan && !isNaN(audio.duration)) {
        durationSpan.textContent = formatTime(audio.duration);
      }
    });
  }

  /* CLICK EN BARRA DE PROGRESO */
  if (progressContainer && audio) {
    const seek = (e) => {
      const rect = progressContainer.getBoundingClientRect();
      let clickX;
      
      if (e.touches) {
        // Touch event
        clickX = e.touches[0].clientX - rect.left;
      } else {
        // Mouse event
        clickX = e.offsetX;
      }
      
      const width = rect.width;
      const dur = audio.duration;
      
      if (dur && !isNaN(dur)) {
        audio.currentTime = (clickX / width) * dur;
      }
    };
    
    progressContainer.addEventListener("click", seek);
    progressContainer.addEventListener("touchstart", (e) => {
      e.preventDefault();
      seek(e);
    });
  }

  /* BOTÓN ANTERIOR - reinicia canción */
  if (prevBtn && audio) {
    const restartSong = () => {
      audio.currentTime = 0;
    };
    
    prevBtn.addEventListener("click", restartSong);
    prevBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      restartSong();
    });
  }

  /* BOTÓN SIGUIENTE - reinicia canción */
  if (nextBtn && audio) {
    const restartSong = () => {
      audio.currentTime = 0;
    };
    
    nextBtn.addEventListener("click", restartSong);
    nextBtn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      restartSong();
    });
  }

  /* FORMATO TIEMPO */
  function formatTime(time) {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  // ========== CONTADOR REGRESIVO - MISA (28 de Abril 20:30) ==========
  const fechaMisa = new Date("April 28, 2026 20:30:00").getTime();

  function actualizarContadorMisa() {
    const ahora = new Date().getTime();
    const diferencia = fechaMisa - ahora;

    const diasElem = document.getElementById("diasMisa");
    const horasElem = document.getElementById("horasMisa");
    const minutosElem = document.getElementById("minutosMisa");
    const segundosElem = document.getElementById("segundosMisa");

    if (!diasElem) return;

    if (diferencia <= 0) {
      diasElem.innerText = "00";
      horasElem.innerText = "00";
      minutosElem.innerText = "00";
      segundosElem.innerText = "00";
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    diasElem.innerText = dias.toString().padStart(2, "0");
    horasElem.innerText = horas.toString().padStart(2, "0");
    minutosElem.innerText = minutos.toString().padStart(2, "0");
    segundosElem.innerText = segundos.toString().padStart(2, "0");
  }

  // ========== CONTADOR REGRESIVO - FIESTA (9 de Mayo 21:30) ==========
  const fechaFiesta = new Date("May 9, 2026 21:30:00").getTime();

  function actualizarContadorFiesta() {
    const ahora = new Date().getTime();
    const diferencia = fechaFiesta - ahora;

    const diasElem = document.getElementById("diasFiesta");
    const horasElem = document.getElementById("horasFiesta");
    const minutosElem = document.getElementById("minutosFiesta");
    const segundosElem = document.getElementById("segundosFiesta");

    if (!diasElem) return;

    if (diferencia <= 0) {
      diasElem.innerText = "00";
      horasElem.innerText = "00";
      minutosElem.innerText = "00";
      segundosElem.innerText = "00";
      return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    diasElem.innerText = dias.toString().padStart(2, "0");
    horasElem.innerText = horas.toString().padStart(2, "0");
    minutosElem.innerText = minutos.toString().padStart(2, "0");
    segundosElem.innerText = segundos.toString().padStart(2, "0");
  }

  // Iniciar ambos contadores
  actualizarContadorMisa();
  actualizarContadorFiesta();
  setInterval(() => {
    actualizarContadorMisa();
    actualizarContadorFiesta();
  }, 1000);

  // Botón de datos bancarios
  const btnBancarios = document.getElementById("btnBancarios");
  if (btnBancarios) {
    const toggleBancarios = () => {
      const datosDiv = document.getElementById("datosBancarios");
      if (datosDiv) {
        if (datosDiv.style.display === "none" || datosDiv.style.display === "") {
          datosDiv.style.display = "block";
          btnBancarios.textContent = "🙈 OCULTAR DATOS";
        } else {
          datosDiv.style.display = "none";
          btnBancarios.textContent = "💳 DATOS BANCARIOS";
        }
      }
    };
    
    btnBancarios.addEventListener("click", toggleBancarios);
    btnBancarios.addEventListener("touchstart", (e) => {
      e.preventDefault();
      toggleBancarios();
    });
  }

  // Botón de WhatsApp (Optimizado para Safari iOS: usa el href directo sin bloqueo de pop-ups ni touchstart)
  const btnWhatsapp = document.getElementById("btnWhatsapp");
  if (btnWhatsapp) {
    const mensaje = encodeURIComponent("¡Hola! Me encantó su invitación web , quiero crear una por favor !");
    btnWhatsapp.href = `https://wa.me/5493853026369?text=${mensaje}`;
  }
  
  // ========== OPTIMIZACIONES PARA SAFARI ==========
  
  // Prevenir el zoom en inputs y botones (Safari)
  const preventZoomInputs = () => {
    const inputs = document.querySelectorAll('input, button, a');
    inputs.forEach(input => {
      input.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
          // No prevenir completamente, solo asegurar que el font-size sea >= 16px
          // Esto ya está manejado en CSS
        }
      });
    });
  };
  
  preventZoomInputs();
  
  // Manejar visibilidad de página (cuando el usuario cambia de pestaña)
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) {
      // Página oculta - pausar audio opcionalmente
      if (audio && isPlaying) {
        // No pausar automáticamente, dejar que Safari maneje
      }
    }
  });
  
  // Forzar actualización de contadores cuando la página se vuelve visible
  document.addEventListener("visibilitychange", function() {
    if (!document.hidden) {
      actualizarContadorMisa();
      actualizarContadorFiesta();
    }
  });
  
  console.log("Sitio optimizado para Safari iOS - Listo!");
};