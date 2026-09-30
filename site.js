(function () {
  document.documentElement.classList.add("js");

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  
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
      if (window.innerWidth > 760) setOpen(false);
    });
  }

  // The phone's bottom Talk to us bar shows once the page's own button
  // (or the page head) has scrolled away, and hides while the contact
  // section, the page's closing button, or the footer is on screen.
  const bar = document.querySelector(".cta-bar");
  if (bar && header && "IntersectionObserver" in window) {
    const headerH = header.offsetHeight;
    const start =
      document.querySelector(".hero-actions .btn-primary") ||
      document.querySelector(".page-head .btn-primary") ||
      document.querySelector(".page-head");
    const ends = [
      document.getElementById("contact"),
      document.querySelector(".page-cta"),
      document.querySelector(".site-footer")
    ].filter(Boolean);
    let passed = false;
    const visible = new Set();
    function update() {
      bar.classList.toggle("is-on", passed && visible.size === 0);
    }
    if (start) {
      new IntersectionObserver(
        function (entries) {
          const e = entries[0];
          passed = !e.isIntersecting && e.boundingClientRect.top < headerH;
          update();
        },
        { rootMargin: -headerH + "px 0px 0px 0px" }
      ).observe(start);
    }
    const endIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      update();
    });
    ends.forEach(function (el) {
      endIo.observe(el);
    });
  }

  // The example email is always for tomorrow.
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const tomorrow = days[(new Date().getDay() + 1) % 7];
  document.querySelectorAll("[data-tomorrow]").forEach(function (el) {
    el.textContent = tomorrow;
  });

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
