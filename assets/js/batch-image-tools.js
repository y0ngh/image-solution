(function () {
  const fileInput = document.getElementById("batch-files");
  const widthInput = document.getElementById("batch-width");
  const heightInput = document.getElementById("batch-height");
  const formatInput = document.getElementById("batch-format");
  const qualityInput = document.getElementById("batch-quality");
  const runButton = document.getElementById("batch-run");
  const clearButton = document.getElementById("batch-clear");
  const downloads = document.getElementById("batch-downloads");
  const status = document.getElementById("batch-status");

  runButton.addEventListener("click", async function () {
    const files = Array.from(fileInput.files || []).filter(function (file) { return file.type.match(/^image\//); });
    if (!files.length) {
      setStatus("처리할 이미지를 선택하세요.");
      return;
    }
    clearDownloads();
    for (const file of files) {
      const image = await loadImage(file);
      const blob = await resizeAndConvert(image);
      addDownload(URL.createObjectURL(blob), withExtension(file.name, formatInput.value));
    }
    setStatus(files.length + "개 이미지를 처리했습니다.");
  });

  clearButton.addEventListener("click", function () {
    fileInput.value = "";
    clearDownloads();
    setStatus("처리할 이미지를 선택하세요.");
  });

  function resizeAndConvert(image) {
    const maxWidth = Number(widthInput.value) || image.naturalWidth;
    const maxHeight = Number(heightInput.value) || image.naturalHeight;
    const scale = Math.min(1, maxWidth / image.naturalWidth, maxHeight / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise(function (resolve) {
      const mime = formatInput.value;
      canvas.toBlob(resolve, mime, mime === "image/png" ? undefined : Number(qualityInput.value) / 100 || 0.88);
    });
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = function () { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = reject;
      image.src = url;
    });
  }

  function withExtension(name, mime) {
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    return name.replace(/\.[^.]+$/, "") + "-batch." + ext;
  }

  function addDownload(url, name) {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.textContent = name + " 다운로드";
    downloads.appendChild(link);
  }

  function clearDownloads() {
    downloads.querySelectorAll("a").forEach(function (link) { URL.revokeObjectURL(link.href); });
    downloads.innerHTML = "";
  }

  function setStatus(message) {
    status.textContent = message;
  }
})();
