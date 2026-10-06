document.addEventListener('DOMContentLoaded', () => {

  // Navegación Activa (ScrollSpy) y Menú
  const navLinks = document.querySelectorAll('.nave-enlace');
  const sections = document.querySelectorAll('section[id]');
  const checkMenu = document.getElementById('check-menu');

  const updateActiveSection = () => {
    const scrollPos = window.scrollY + 150;
    sections.forEach(sec => {
      if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(l => l.classList.toggle('activo', l.getAttribute('href') === `#${sec.id}`));
      }
    });
  };

  window.addEventListener('scroll', updateActiveSection, { passive: true });
  updateActiveSection();

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (checkMenu?.checked) checkMenu.checked = false;
    });
  });

  // Botones "Solicitar Información" en Programas
  const selectPrograma = document.getElementById('programa');
  document.querySelectorAll('.btn-sel-prog').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-program-value');
      if (selectPrograma && val) {
        selectPrograma.value = val;
        setFieldState(selectPrograma, true);
        document.getElementById('registro')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => document.getElementById('nombreCompleto')?.focus(), 500);
      }
    });
  });

  // Validación de Formulario
  const form = document.getElementById('formRegistro');
  if (!form) return;

  const validators = {
    nombreCompleto: val => /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,60}$/.test(val.trim()) ? '' : 'Ingresa un nombre válido (mínimo 3 letras).',
    correo: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Ingresa un correo electrónico válido.',
    telefono: val => /^[0-9]{9,12}$/.test(val.trim()) ? '' : 'Ingresa un teléfono válido (9 a 12 dígitos).',
    edad: val => (Number(val) >= 16 && Number(val) <= 99) ? '' : 'La edad debe ser entre 16 y 99 años.',
    programa: val => val ? '' : 'Selecciona una carrera técnica.',
    modalidad: val => val ? '' : 'Selecciona una modalidad.',
    turno: () => form.querySelector('input[name="turno"]:checked') ? '' : 'Selecciona un turno.',
    terminos: () => form.querySelector('#terminos')?.checked ? '' : 'Debes aceptar los Términos y Condiciones.'
  };

  const setFieldState = (field, isValid, msg = '') => {
    const errorEl = document.getElementById(`error-${field.name || field.id}`);
    if (errorEl) errorEl.textContent = msg;
    if (field.classList) {
      field.classList.toggle('valido', isValid);
      field.classList.toggle('invalido', !isValid);
    }
  };

  const validateField = (field) => {
    const fn = validators[field.name || field.id];
    if (!fn) return true;
    const errorMsg = fn(field.value);
    setFieldState(field, !errorMsg, errorMsg);
    return !errorMsg;
  };

  // Eventos de validación en tiempo real
  form.querySelectorAll('input, select').forEach(input => {
    const eventType = (input.type === 'radio' || input.type === 'checkbox' || input.tagName === 'SELECT') ? 'change' : 'input';
    input.addEventListener(eventType, () => validateField(input));
    input.addEventListener('blur', () => validateField(input));
  });

  // Envío del Formulario
  const btnSubmit = document.getElementById('btnSubmit');
  const registroExito = document.getElementById('registroExito');
  const successSummary = document.getElementById('successSummary');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    Object.keys(validators).forEach(key => {
      const field = form.elements[key] || document.getElementById(key);
      if (field) {
        const valid = validateField(field instanceof RadioNodeList ? field[0] : field);
        if (!valid) isFormValid = false;
      }
    });

    if (!isFormValid) {
      form.querySelector('.invalido, :invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const data = {
      nombre: form.nombreCompleto.value.trim(),
      correo: form.correo.value.trim(),
      telefono: form.telefono.value.trim(),
      edad: form.edad.value.trim(),
      programa: form.programa.options[form.programa.selectedIndex].text,
      modalidad: form.modalidad.options[form.modalidad.selectedIndex].text,
      turno: form.querySelector('input[name="turno"]:checked')?.parentElement.textContent.trim(),
      fecha: new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    if (btnSubmit) {
      btnSubmit.disabled = true;
      const txtBtn = btnSubmit.querySelector('.txt-btn');
      const originalText = txtBtn ? txtBtn.textContent : 'Enviar';
      if (txtBtn) txtBtn.textContent = 'Enviando postulación...';

      setTimeout(() => {
        btnSubmit.disabled = false;
        if (txtBtn) txtBtn.textContent = originalText;

        if (successSummary) {
          successSummary.innerHTML = `
            <p><strong>Postulante:</strong> ${data.nombre}</p>
            <p><strong>Correo electrónico:</strong> ${data.correo}</p>
            <p><strong>Teléfono:</strong> ${data.telefono}</p>
            <p><strong>Edad:</strong> ${data.edad} años</p>
            <p><strong>Programa Académico:</strong> ${data.programa}</p>
            <p><strong>Modalidad:</strong> ${data.modalidad}</p>
            <p><strong>Turno:</strong> ${data.turno}</p>
            <p><strong>Fecha y Hora:</strong> ${data.fecha}</p>
          `;
        }

        form.classList.add('hidden');
        registroExito?.classList.remove('hidden');
        registroExito?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    }
  });

  // Botón "Registrar otro postulante"
  document.getElementById('btnNuevoRegistro')?.addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.valido, .invalido').forEach(el => el.classList.remove('valido', 'invalido'));
    form.querySelectorAll('.msj-error').forEach(el => el.textContent = '');
    registroExito?.classList.add('hidden');
    form.classList.remove('hidden');
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Modal Legal (<dialog>)
  const legalModal = document.getElementById('legalModal');
  if (legalModal) {
    const toggleModal = (open) => open ? legalModal.showModal?.() || legalModal.setAttribute('open', '') : legalModal.close?.() || legalModal.removeAttribute('open');
    document.querySelectorAll('#openTermsLink, #openPrivacyLink').forEach(el => el.addEventListener('click', (e) => { e.preventDefault(); toggleModal(true); }));
    document.querySelectorAll('#closeModalBtn, #modalAcceptBtn').forEach(el => el.addEventListener('click', () => toggleModal(false)));
    legalModal.addEventListener('click', (e) => {
      const rect = legalModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) toggleModal(false);
    });
  }

});
