/* Finrise Assets — branded notifications and accessible dialog helpers. */
(function () {
  "use strict";
  if (window.FinriseNotify) return;

  let host;
  function ensureHost() {
    if (host && host.isConnected) return host;
    host = document.createElement("div");
    host.className = "finrise-toast-host";
    host.setAttribute("aria-live", "polite");
    host.setAttribute("aria-relevant", "additions");
    document.body.appendChild(host);
    return host;
  }

  function notify(message, type = "info", duration = 4200) {
    const box = document.createElement("div");
    box.className = "finrise-toast finrise-toast-" + (["success","error","warning","info"].includes(type) ? type : "info");
    const icon = document.createElement("span");
    icon.className = "finrise-toast-icon";
    icon.textContent = ({success:"✓", error:"!", warning:"⚠", info:"i"})[type] || "i";
    const text = document.createElement("div");
    text.className = "finrise-toast-message";
    text.textContent = String(message ?? "");
    const close = document.createElement("button");
    close.className = "finrise-toast-close";
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss notification");
    close.textContent = "×";
    close.addEventListener("click", () => box.remove());
    box.append(icon, text, close);
    ensureHost().appendChild(box);
    requestAnimationFrame(() => box.classList.add("finrise-toast-visible"));
    const timer = window.setTimeout(() => {
      box.classList.remove("finrise-toast-visible");
      window.setTimeout(() => box.remove(), 250);
    }, Math.max(1500, duration));
    close.addEventListener("click", () => clearTimeout(timer), { once: true });
    return box;
  }

  function dialog({title = "Finrise Assets", message = "", input = false, defaultValue = "", confirmText = "Continue", cancelText = "Cancel", danger = false} = {}) {
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.className = "finrise-dialog-overlay";
      const panel = document.createElement("section");
      panel.className = "finrise-dialog";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      const heading = document.createElement("h2");
      heading.textContent = title;
      const body = document.createElement("p");
      body.textContent = String(message ?? "");
      panel.append(heading, body);
      let field;
      if (input) {
        field = document.createElement("input");
        field.className = "finrise-dialog-input";
        field.type = "text";
        field.value = defaultValue;
        field.setAttribute("aria-label", title);
        panel.appendChild(field);
      }
      const actions = document.createElement("div");
      actions.className = "finrise-dialog-actions";
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "finrise-dialog-cancel";
      cancel.textContent = cancelText;
      const accept = document.createElement("button");
      accept.type = "button";
      accept.className = "finrise-dialog-confirm" + (danger ? " finrise-dialog-danger" : "");
      accept.textContent = confirmText;
      actions.append(cancel, accept);
      panel.appendChild(actions);
      overlay.appendChild(panel);
      document.body.appendChild(overlay);
      let finished = false;
      const finish = value => {
        if (finished) return;
        finished = true;
        document.removeEventListener("keydown", onKey);
        overlay.remove();
        resolve(value);
      };
      const onKey = event => {
        if (event.key === "Escape") finish(input ? null : false);
        if (event.key === "Enter" && input) finish(field.value);
      };
      cancel.addEventListener("click", () => finish(input ? null : false));
      accept.addEventListener("click", () => finish(input ? field.value : true));
      overlay.addEventListener("click", event => { if (event.target === overlay) finish(input ? null : false); });
      document.addEventListener("keydown", onKey);
      (field || accept).focus();
    });
  }

  window.FinriseNotify = {
    show: notify,
    success: message => notify(message, "success"),
    error: message => notify(message, "error", 6000),
    warning: message => notify(message, "warning", 5200),
    info: message => notify(message, "info"),
    confirm: options => dialog(options),
    prompt: options => dialog({...options, input: true})
  };

  // Keep existing validation and error-handling code working, but present alerts
  // as branded, non-blocking notifications instead of browser-origin popups.
  window.alert = function (message) { notify(message, "info"); };
})();
