(function () {
  "use strict";

  /* The example list names the day the visitor's next list would be for:
     today until early afternoon, tomorrow after that. Without JavaScript
     it reads Tuesday. */
  var LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var now = new Date();
  var day = (now.getDay() + (now.getHours() >= 14 ? 1 : 0)) % 7;
  document.querySelectorAll("[data-day]").forEach(function (el) {
    el.textContent = el.getAttribute("data-day") === "short" ? SHORT[day] : LONG[day];
  });

  /* Contact form */
  var form = document.getElementById("form");
  if (!form || !window.fetch) return;

  var ENDPOINT = "https://formsubmit.co/ajax/tooeyteam@gmail.com";
  var status = document.getElementById("form-status");
  var sent = document.getElementById("sent");
  var button = form.querySelector("button[type=submit]");
  var label = button.querySelector(".btn__label");
  var required = Array.prototype.slice.call(form.querySelectorAll("[required]"));

  function check(input) {
    var ok = input.value.trim() !== "" && (input.type !== "email" || input.validity.valid);
    var err = document.getElementById(input.id + "-err");
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    if (err) {
      if (!err.dataset.empty) err.dataset.empty = err.textContent;
      err.textContent = input.type === "email" && input.value.trim() !== ""
        ? "That email address doesn’t look complete."
        : err.dataset.empty;
      err.hidden = ok;
    }
    return ok;
  }

  required.forEach(function (input) {
    input.addEventListener("blur", function () {
      if (input.getAttribute("aria-invalid") === "true" || input.value) check(input);
    });
    input.addEventListener("input", function () {
      if (input.getAttribute("aria-invalid") === "true") check(input);
    });
  });

  function setStatus(html, isError) {
    status.innerHTML = html;
    status.classList.toggle("is-error", !!isError);
  }

  function done() {
    form.hidden = true;
    sent.hidden = false;
    sent.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var bad = required.filter(function (input) { return !check(input); });
    if (bad.length) {
      setStatus("", false);
      bad[0].focus();
      return;
    }

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = String(value).trim(); });

    // A filled honeypot means a bot. Look finished, send nothing.
    if (data._honey) { done(); return; }

    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    label.textContent = "Sending…";
    setStatus("", false);

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (body) {
          if (!res.ok || String(body.success) !== "true") throw new Error("not sent");
        });
      })
      .then(done)
      .catch(function () {
        setStatus(
          'That didn’t go through. Your message is still here, so you can try again, or email us at <a href="mailto:tooeyteam@gmail.com">tooeyteam@gmail.com</a>.',
          true
        );
      })
      .then(function () {
        button.disabled = false;
        button.removeAttribute("aria-busy");
        label.textContent = "Send";
      });
  });
})();
