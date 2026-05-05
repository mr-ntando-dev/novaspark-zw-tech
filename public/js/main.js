// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== MOBILE NAV TOGGLE =====
function toggleNav() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}

// Close nav when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('active');
  });
});

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.style.borderColor = type === 'success' ? 'var(--success)' : 'var(--danger)';
  toast.style.color = type === 'success' ? 'var(--success)' : 'var(--danger)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== CAREER FORM SUBMISSION =====
const careerForm = document.getElementById('careerForm');
if (careerForm) {
  // File name display
  const cvInput = document.getElementById('cv');
  const fileName = document.getElementById('fileName');
  if (cvInput) {
    cvInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        fileName.textContent = '📎 ' + e.target.files[0].name;
        fileName.style.display = 'block';
      }
    });
  }

  careerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(careerForm);
    
    try {
      const res = await fetch('/careers/apply', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast('Application submitted successfully! We\'ll be in touch.');
        careerForm.reset();
        fileName.style.display = 'none';
      } else {
        showToast(data.message || 'Something went wrong', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
  });
}

// ===== CONTACT FORM SUBMISSION =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    try {
      const res = await fetch('/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        showToast('Message sent! We\'ll get back to you within 24 hours.');
        contactForm.reset();
      } else {
        showToast(result.message || 'Something went wrong', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
  });
}

// ===== SCROLL ANIMATIONS =====
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Animate service cards and pricing cards on scroll
document.querySelectorAll('.service-card, .pricing-card, .vacancy-card, .stat-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// ===== ACTIVE NAV LINK =====
const currentPath = window.location.pathname;
document.querySelectorAll('.nav-links a').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.classList.add('active');
  }
});
