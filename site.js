(function () {
  document.documentElement.classList.add("js");

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function setOpen(open) {
    if (!header || !toggle) return;
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setOpen(!header.classList.contains("is-open"));
    });
    header.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });
    document.addEventListener("click", function (e) {
      if (!header.classList.contains("is-open")) return;
      if (header.contains(e.target)) return;
      setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) setOpen(false);
    });
  }

  const tickRoot = document.querySelector("[data-tick-root]");
  if (tickRoot) tick(tickRoot);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );

    document.querySelectorAll(".sequence > .reveal").forEach(function (el, i) {
      if (!reduce.matches) el.style.transitionDelay = i * 0.06 + "s";
    });

    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("visible");
    });
  }

  function tick(root) {
    if (reduce.matches) return;
    root.querySelectorAll("[data-tick]").forEach(function (el) {
      const end = parseInt(el.getAttribute("data-tick"), 10);
      if (isNaN(end)) return;
      const start = performance.now();
      const dur = 640;
      function frame(now) {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    });
  }

  const form = document.getElementById("contactForm");
  if (!form) return;

  const note = document.getElementById("contactNote");
  const submit = document.getElementById("contactSubmit");
  const defaultNote = note ? note.innerHTML : "";

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    submit.disabled = true;
    submit.textContent = "Sending…";
    if (note) {
      note.innerHTML = defaultNote;
      note.classList.remove("is-ok", "is-err");
    }

    const data = Object.fromEntries(new FormData(form).entries());
    if (data._honey) {
      submit.textContent = "Send";
      submit.disabled = false;
      if (note) {
        note.textContent = "Thank you. We will write back from tooeyteam@gmail.com.";
        note.classList.add("is-ok");
      }
      form.reset();
      return;
    }
    delete data._honey;

    fetch("https://formsubmit.co/ajax/tooeyteam@gmail.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json();
      })
      .then(function () {
        form.reset();
        submit.textContent = "Send";
        submit.disabled = false;
        if (note) {
          note.textContent = "Thank you. We will write back from tooeyteam@gmail.com.";
          note.classList.add("is-ok");
        }
      })
      .catch(function () {
        submit.textContent = "Send";
        submit.disabled = false;
        if (note) {
          note.textContent =
            "The message did not go through. Email tooeyteam@gmail.com directly.";
          note.classList.add("is-err");
        }
      });
  });
})();
