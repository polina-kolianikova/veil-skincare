import { setProductVariant } from "./scene.js?v=b34f8ddd70f5877bd51720c6598609de47932655ae386bb64ca67bfa3427fbcc";

const variants = {
  calm: { name: "Calm", description: "Calm / a comforting daily moisturiser." },
  dew: {
    name: "Dew",
    description: "Dew / a light gel cream for an easy, fresh finish.",
  },
  restore: {
    name: "Restore",
    description: "Restore / a richer cream for the end of your day.",
  },
};
const variantButtons = [...document.querySelectorAll(".variant")];
function selectVariant(value, syncForm = true) {
  if (!variants[value]) return;
  setProductVariant(value);
  document.body.dataset.variant = value;
  variantButtons.forEach((button) => {
    const active = button.dataset.variant === value;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#variant-description").textContent =
    variants[value].description;
  document.querySelector("#specimen-name").textContent =
    `0${Object.keys(variants).indexOf(value) + 1} / ${variants[value].name.toLowerCase()}`;
  if (syncForm) {
    document.querySelector(
      `input[name="product"][value="${variants[value].name}"]`,
    ).checked = true;
    updateRoutine();
  }
}
variantButtons.forEach((button) =>
  button.addEventListener("click", () => selectVariant(button.dataset.variant)),
);

const form = document.querySelector("#ritual-form");
let currentRoutine;
function updateRoutine() {
  const data = new FormData(form);
  const moment = data.get("moment");
  const feel = data.get("feel");
  const product = data.get("product");
  const steps =
    moment === "Morning"
      ? ["Gentle cleanse", `${product} moisturiser`, "Broad-spectrum SPF"]
      : ["Gentle cleanse", `${product} moisturiser`, "A moment to unwind"];
  const note =
    feel === "Dry"
      ? "Apply your cream while skin is still slightly damp."
      : feel === "Oily"
        ? "Start with a small amount. Add a little more if your skin wants it."
        : "Keep it consistent. Your routine can stay beautifully simple.";
  document.querySelector("#routine-label").textContent =
    `YOUR ${moment.toUpperCase()} RITUAL`;
  document.querySelector("#routine-steps").replaceChildren(
    ...steps.map((step, index) => {
      const li = document.createElement("li");
      const number = document.createElement("span");
      number.textContent = `0${index + 1}`;
      li.append(number, step);
      return li;
    }),
  );
  document.querySelector("#routine-note").textContent = note;
  currentRoutine = { moment, feel, product, steps, note };
  document.querySelector("#save-status").textContent =
    "Saves a simple text note to your device. No sign-up.";
}
form.addEventListener("change", (event) => {
  if (event.target.name === "product")
    selectVariant(event.target.value.toLowerCase(), false);
  updateRoutine();
});
document.querySelector("#save-ritual").addEventListener("click", () => {
  const r = currentRoutine;
  const text = `VEIL / YOUR DAILY RITUAL\n\n${r.moment}. Skin feels ${r.feel.toLowerCase()}.\n\n${r.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}\n\n${r.note}\n\nIndependent skincare concept by Polina Koljanikova.\nThis is an illustrative routine, not personalised medical advice.\n`;
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `veil-${r.moment.toLowerCase()}-ritual.txt`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector("#save-status").textContent =
    "Your ritual note is ready. Keep a little room for yourself.";
});
updateRoutine();
