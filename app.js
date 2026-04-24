const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("file-input");
const previewSection = document.getElementById("preview-section");
const previewImage = document.getElementById("preview-image");
const fileNameEl = document.getElementById("file-name");
const fileSizeEl = document.getElementById("file-size");
const clearButton = document.getElementById("clear-button");
const statusEl = document.getElementById("status");
const networkStatusEl = document.getElementById("network-status");

let currentObjectUrl = null;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function showPreview(file) {
  if (currentObjectUrl) URL.revokeObjectURL(currentObjectUrl);
  currentObjectUrl = URL.createObjectURL(file);

  previewImage.src = currentObjectUrl;
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  previewSection.classList.remove("hidden");
  setStatus("Image ready.");
}

function clearPreview() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
  previewImage.removeAttribute("src");
  fileNameEl.textContent = "";
  fileSizeEl.textContent = "";
  previewSection.classList.add("hidden");
  fileInput.value = "";
  setStatus("");
}

function handleFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setStatus("Please select a valid image file.", true);
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setStatus("Image exceeds the 10 MB size limit.", true);
    return;
  }

  showPreview(file);
}

fileInput.addEventListener("change", (event) => {
  const [file] = event.target.files;
  handleFile(file);
});

clearButton.addEventListener("click", clearPreview);

["dragenter", "dragover"].forEach((type) => {
  dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropzone.classList.add("is-dragover");
  });
});

["dragleave", "drop"].forEach((type) => {
  dropzone.addEventListener(type, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropzone.classList.remove("is-dragover");
  });
});

dropzone.addEventListener("drop", (event) => {
  const file = event.dataTransfer?.files?.[0];
  handleFile(file);
});

function updateNetworkStatus() {
  const online = navigator.onLine;
  networkStatusEl.textContent = online ? "Online" : "Offline";
  networkStatusEl.classList.toggle("offline", !online);
}

window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
updateNetworkStatus();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}
