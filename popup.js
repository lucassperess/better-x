(() => {
  "use strict";

  const inputs = [...document.querySelectorAll("input[data-setting]")];
  const status = document.querySelector("#status");
  const toggleAll = document.querySelector("#toggle-all");
  const defaults = Object.fromEntries(inputs.map((input) => [
    input.dataset.setting,
    input.dataset.default !== "false"
  ]));
  let statusTimer;

  const updateBulkButton = () => {
    const allEnabled = inputs.every((input) => input.checked);
    toggleAll.textContent = allEnabled ? "Mostrar tudo" : "Ocultar tudo";
  };

  const showSaved = () => {
    window.clearTimeout(statusTimer);
    status.textContent = "Salvo";
    statusTimer = window.setTimeout(() => { status.textContent = ""; }, 1200);
  };

  chrome.storage.sync.get(defaults, (stored) => {
    inputs.forEach((input) => {
      input.checked = stored[input.dataset.setting] !== false;
    });
    updateBulkButton();
  });

  inputs.forEach((input) => {
    input.addEventListener("change", () => {
      chrome.storage.sync.set({ [input.dataset.setting]: input.checked }, showSaved);
      updateBulkButton();
    });
  });

  toggleAll.addEventListener("click", () => {
    const nextValue = !inputs.every((input) => input.checked);
    const update = {};
    inputs.forEach((input) => {
      input.checked = nextValue;
      update[input.dataset.setting] = nextValue;
    });
    chrome.storage.sync.set(update, showSaved);
    updateBulkButton();
  });

})();
