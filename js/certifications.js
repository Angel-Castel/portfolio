// Certifications: cards are rendered from this data array. To add a credential, add an entry here.
//   featured  - true for the wide highlighted card (shown first, full width)
//   label     - small amber label (featured card)
//   badge     - badge image shown on the featured card; clicking it opens `image.full` in the lightbox
//   logo      - small issuer logo (grid cards)
//   image     - certificate thumbnail (`src`) and the full-size version for the lightbox (`full`)
//   verifyUrl - "Verify credential" link; omit or set to null to hide the link
const CERTIFICATIONS = [
  {
    featured: true,
    label: "Industry certification",
    title: "Microsoft Certified: Azure Fundamentals (AZ-900)",
    issuer: "Microsoft",
    year: 2021,
    description: "Validates foundational knowledge of cloud concepts and Azure services, workloads, security, and governance.",
    tags: ["Cloud Concepts", "Azure Services", "Security & Compliance", "Pricing & Support"],
    badge: { src: "img/profile/az900-badge.webp", width: 196, height: 202, alt: "Microsoft Certified: Azure Fundamentals badge" },
    image: { full: "img/profile/az900-1301.webp", alt: "Angel Castellanos's Microsoft Certified: Azure Fundamentals certificate" },
    verifyUrl: null
  },
  {
    title: "Web Design Specialization",
    issuer: "University of Michigan · Coursera",
    year: 2020,
    tags: ["HTML5", "CSS3", "JavaScript", "Responsive Design", "Accessibility"],
    logo: { src: "img/profile/logo-michigan.webp", width: 150, height: 150, alt: "University of Michigan" },
    image: {
      src: "img/profile/WebDesignSpecialization-800.webp",
      full: "img/profile/WebDesignSpecialization-1015.webp",
      width: 1015, height: 692,
      alt: "Angel Castellanos's Web Design for Everybody Specialization certificate"
    },
    verifyUrl: "https://www.coursera.org/account/accomplishments/specialization/certificate/HLZYDKSFUEZT"
  },
  {
    title: "Web Applications Specialization",
    issuer: "University of Michigan · Coursera",
    year: 2020,
    tags: ["PHP", "SQL", "JavaScript", "jQuery", "JSON"],
    logo: { src: "img/profile/logo-michigan.webp", width: 150, height: 150, alt: "University of Michigan" },
    image: {
      src: "img/profile/WebApplicationsSpecialization-800.webp",
      full: "img/profile/WebApplicationsSpecialization-1033.webp",
      width: 1033, height: 679,
      alt: "Angel Castellanos's Web Applications for Everybody Specialization certificate"
    },
    verifyUrl: "https://www.coursera.org/account/accomplishments/specialization/certificate/5CCU5G3GLL65"
  },
  {
    title: "Java Programming: Arrays, Lists, and Structured Data",
    issuer: "Duke University · Coursera",
    year: 2021,
    tags: ["Java", "Arrays", "Lists", "Structured Data"],
    logo: { src: "img/profile/logo-duke.webp", width: 221, height: 108, alt: "Duke University" },
    image: {
      src: "img/profile/JavaProgramming-800.webp",
      full: "img/profile/JavaProgramming-1003.webp",
      width: 1003, height: 847,
      alt: "Angel Castellanos's Java Programming: Arrays, Lists, and Structured Data certificate"
    },
    verifyUrl: "https://www.coursera.org/account/accomplishments/certificate/4AEZAY8BF68K"
  }
];

(function () {
  const section = document.getElementById("section5");
  const list = section && section.querySelector(".ct-list");
  if (!list) return;

  // Small DOM helper: el("p", { className: "x" }, child, "text", ...)
  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === "className" || key === "textContent") node[key] = value;
      else node.setAttribute(key, value === true ? "" : value);
    });
    children.forEach(child => child && node.append(child));
    return node;
  }

  function tags(cert) {
    return el("ul", { className: "ct-tags", "aria-label": "Skills" },
      ...cert.tags.map(tag => el("li", { className: "ct-tag", textContent: tag })));
  }

  function verifyLink(cert) {
    if (!cert.verifyUrl) return null;
    return el("a", { className: "ct-verify", href: cert.verifyUrl, target: "_blank", rel: "noopener noreferrer" },
      "Verify credential ",
      el("span", { "aria-hidden": "true", textContent: "↗" }),
      el("span", { className: "visually-hidden", textContent: " (opens in a new tab)" }));
  }

  function lightboxAttrs(cert) {
    return {
      "data-lightbox": true,
      "data-full": cert.image.full,
      "data-caption": cert.title,
      "data-alt": cert.image.alt,
      "aria-haspopup": "dialog",
      "aria-label": `View certificate: ${cert.title}`
    };
  }

  function featuredCard(cert) {
    const badge = el("button", { type: "button", className: "ct-badge", ...lightboxAttrs(cert) },
      el("img", { src: cert.badge.src, width: cert.badge.width, height: cert.badge.height, alt: cert.badge.alt, decoding: "async" }));

    return el("article", { className: "ct-card ct-card--featured xp-card" },
      badge,
      el("div", { className: "ct-body" },
        el("p", { className: "xp-subhead", textContent: cert.label }),
        el("h3", { className: "ct-title", textContent: cert.title }),
        el("p", { className: "ct-issuer", textContent: `${cert.issuer} · ${cert.year}` }),
        el("p", { className: "ct-desc", textContent: cert.description }),
        tags(cert),
        verifyLink(cert)));
  }

  function card(cert) {
    return el("article", { className: "ct-card xp-card" },
      cert.logo && el("img", { className: "ct-logo", src: cert.logo.src, width: cert.logo.width, height: cert.logo.height, alt: cert.logo.alt, loading: "lazy", decoding: "async" }),
      el("h3", { className: "ct-title", textContent: cert.title }),
      el("p", { className: "ct-issuer", textContent: `${cert.issuer} · ${cert.year}` }),
      tags(cert),
      el("figure", { className: "ct-thumb" },
        el("button", { type: "button", className: "xp-figure-trigger", ...lightboxAttrs(cert) },
          el("img", {
            src: cert.image.src, width: cert.image.width, height: cert.image.height, alt: cert.image.alt,
            loading: "lazy", decoding: "async"
          }))),
      verifyLink(cert));
  }

  // Featured credential first, then the rest in their listed order
  const ordered = [...CERTIFICATIONS.filter(c => c.featured), ...CERTIFICATIONS.filter(c => !c.featured)];
  ordered.forEach((cert, i) => {
    const node = cert.featured ? featuredCard(cert) : card(cert);
    node.style.setProperty("--i", i);
    list.append(node);
  });

  // Entrance: fade and rise once per page load when the cards first come into view
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("IntersectionObserver" in window)) return;

  section.classList.add("is-armed");
  const observer = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    observer.disconnect();
    section.classList.add("is-revealed");
    section.classList.remove("is-armed");
  }, { threshold: 0.15 });
  observer.observe(list);
})();
