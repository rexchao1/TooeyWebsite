(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Phone menu */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    var setOpen = function (open) {
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.textContent = open ? "Close" : "Menu";
      nav.classList.toggle("is-open", open);
    };
    menuBtn.addEventListener("click", function () {
      setOpen(menuBtn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        menuBtn.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (menuBtn.getAttribute("aria-expanded") === "true" && !e.target.closest(".masthead")) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) setOpen(false);
    });
  }

  /* Key: light up a column of the sample sheet */
  var sheet = document.getElementById("sheet");
  var keys = document.querySelectorAll(".key-btn");
  if (sheet && keys.length) {
    var pinned = "";
    var show = function (col) {
      sheet.setAttribute("data-hl", col || "");
    };
    keys.forEach(function (btn) {
      var col = btn.getAttribute("data-col");
      btn.addEventListener("mouseenter", function () { show(col); });
      btn.addEventListener("mouseleave", function () { show(pinned); });
      btn.addEventListener("focus", function () { show(col); });
      btn.addEventListener("blur", function () { show(pinned); });
      btn.addEventListener("click", function () {
        pinned = pinned === col ? "" : col;
        keys.forEach(function (b) {
          b.setAttribute("aria-pressed", b.getAttribute("data-col") === pinned ? "true" : "false");
        });
        show(pinned || col);
      });
    });
  }

  /* Print the example sheet */
  var printBtn = document.getElementById("print-btn");
  if (printBtn && window.print) {
    printBtn.hidden = false;
    printBtn.addEventListener("click", function () {
      document.body.classList.add("print-sheet");
      window.print();
    });
    window.addEventListener("afterprint", function () {
      document.body.classList.remove("print-sheet");
    });
  }

  /* Reveal: the overnight line and the chart, once, when they come into view */
  var seen = document.querySelectorAll(".timeline, .fig-chart");
  if (reduce || !("IntersectionObserver" in window)) {
    seen.forEach(function (el) { el.classList.add("is-seen"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-seen");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0.2 });
    seen.forEach(function (el) { io.observe(el); });
  }

  /* Chart: say the value of the bar under the pointer */
  var tip = document.querySelector(".chart-tip");
  if (tip) {
    document.querySelectorAll(".bar").forEach(function (bar) {
      bar.addEventListener("mouseenter", function () {
        tip.textContent = bar.getAttribute("data-tip");
        tip.classList.add("is-on");
      });
      bar.addEventListener("mouseleave", function () {
        tip.classList.remove("is-on");
      });
    });
  }

  /* Contact form */
  var form = document.getElementById("contact");
  if (form) {
    form.noValidate = true;
    var submit = document.getElementById("f-submit");
    var status = document.getElementById("f-status");
    var required = ["f-name", "f-rest", "f-email"];
    var messages = {
      "f-name": "Please add your name.",
      "f-rest": "Please add your restaurant’s name.",
      "f-email": "Please add an email we can reply to."
    };

    var clearError = function (input) {
      input.removeAttribute("aria-invalid");
      var err = document.getElementById(input.id + "-err");
      if (err) err.remove();
      var hint = input.getAttribute("data-hint");
      if (hint) input.setAttribute("aria-describedby", hint);
      else input.removeAttribute("aria-describedby");
    };
    var setError = function (input, text) {
      clearError(input);
      input.setAttribute("aria-invalid", "true");
      var p = document.createElement("p");
      p.className = "err";
      p.id = input.id + "-err";
      p.textContent = text;
      input.insertAdjacentElement("afterend", p);
      input.setAttribute("aria-describedby", p.id);
    };

    required.forEach(function (id) {
      var input = document.getElementById(id);
      input.addEventListener("input", function () {
        if (input.getAttribute("aria-invalid") === "true" && input.value.trim()) clearError(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.className = "form-status";
      status.textContent = "";

      var firstBad = null;
      required.forEach(function (id) {
        var input = document.getElementById(id);
        var v = input.value.trim();
        var bad = !v || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
        if (bad) {
          setError(input, input.type === "email" && v ? "That email doesn’t look right." : messages[id]);
          if (!firstBad) firstBad = input;
        } else {
          clearError(input);
        }
      });
      if (firstBad) {
        firstBad.focus();
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) { data[key] = typeof value === "string" ? value.trim() : value; });

      submit.disabled = true;
      submit.textContent = "Sending…";

      var fail = function () {
        submit.disabled = false;
        submit.textContent = "Send";
        status.className = "form-status is-err";
        status.innerHTML = "That didn’t go through. Your message is still here, so you can try again, or <a href=\"mailto:tooeyteam@gmail.com\">email tooeyteam@gmail.com</a> instead.";
      };

      fetch("https://formsubmit.co/ajax/tooeyteam@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res.json();
        })
        .then(function (json) {
          if (json && (json.success === false || json.success === "false")) throw new Error("Rejected");
          form.reset();
          submit.disabled = false;
          submit.textContent = "Send";
          status.className = "form-status is-ok";
          status.textContent = "Thank you. Someone on the team will write back from tooeyteam@gmail.com.";
          status.setAttribute("tabindex", "-1");
          status.focus();
        })
        .catch(fail);
    });
  }
})();
