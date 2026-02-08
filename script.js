const navLinks = document.querySelectorAll('.menu a');
const sections = document.querySelectorAll('main section[id]');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  },
  { threshold: 0.2 }
);

sections.forEach((section) => observer.observe(section));
