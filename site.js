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

  // Count each prep number up as its row prints, starting at that row's
  // row-print delay in styles.css, measured from page start.
  const counts = document.querySelectorAll(".sheet-now .prep");
  if (counts.length && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    counts.forEach(function (el) {
      const end = parseInt(el.textContent, 10);
      if (!end) return;
      el.textContent = "0";
      const start = parseFloat(getComputedStyle(el.parentElement).animationDelay) * 1000 || 0;
      const length = 420;
      function tick(now) {
        const t = Math.min(1, Math.max(0, (now - start) / length));
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - t, 3))));
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  // The deal. On wide screens the pictures move out from under their terms
  // into the panel that stays put; the term crossing the middle of the
  // screen is lit and its picture plays. Narrower, each picture plays under
  // its term the first time it scrolls into view.
  const deal = document.querySelector(".deal");
  const stage = deal && deal.querySelector(".deal-stage");
  if (stage && "IntersectionObserver" in window) {
    const terms = Array.from(deal.querySelectorAll(".term"));
    const homes = terms.map(function (t) {
      return t.querySelector(".term-pic");
    });
    const pics = homes.map(function (h) {
      return h.querySelector(".pic");
    });
    const wide = window.matchMedia("(min-width: 981px)");
    let active = -1;

    function play(pic) {
      pic.classList.remove("is-playing");
      void pic.offsetWidth;
      pic.classList.add("is-playing");
    }
    function setActive(i) {
      if (i === active) return;
      active = i;
      terms.forEach(function (t, j) {
        t.classList.toggle("is-active", j === i);
      });
      pics.forEach(function (p, j) {
        p.classList.toggle("is-active", j === i);
      });
      play(pics[i]);
    }

    const middle = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) setActive(terms.indexOf(e.target));
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    // Replay the shown picture whenever the panel comes back into view.
    const onStage = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting && active > -1) play(pics[active]);
      },
      { threshold: 0.35 }
    );
    const inView = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          play(e.target.querySelector(".pic"));
          inView.unobserve(e.target);
        });
      },
      { threshold: 0.45 }
    );

    function layout() {
      middle.disconnect();
      onStage.disconnect();
      inView.disconnect();
      active = -1;
      if (wide.matches) {
        pics.forEach(function (p) {
          stage.appendChild(p);
        });
        deal.classList.add("is-staged");
        setActive(0);
        terms.forEach(function (t) {
          middle.observe(t);
        });
        onStage.observe(stage);
      } else {
        deal.classList.remove("is-staged");
        pics.forEach(function (p, i) {
          p.classList.remove("is-active");
          homes[i].appendChild(p);
        });
        terms.forEach(function (t) {
          t.classList.remove("is-active");
        });
        homes.forEach(function (h) {
          inView.observe(h);
        });
      }
    }
    layout();
    wide.addEventListener("change", layout);
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
