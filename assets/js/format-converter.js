(function () {
  const fileInput = document.getElementById("format-files");
  const outputInput = document.getElementById("format-output");
  const qualityInput = document.getElementById("format-quality");
  const runButton = document.getElementById("format-run");
  const clearButton = document.getElementById("format-clear");
  const downloads = document.getElementById("format-downloads");
  const status = document.getElementById("format-status");

  runButton.addEventListener("click", async function () {
    const files = Array.from(fileInput.files || []).filter(function (file) { return file.type.match(/^image\//); });
    if (!files.length) {
      setStatus("변환할 이미지를 선택하세요.");
      return;
    }
    clearDownloads();
    for (const file of files) {
      const image = await loadImage(file);
      const blob = await renderImage(image, outputInput.value, Number(qualityInput.value) / 100 || 0.9);
      addDownload(URL.createObjectURL(blob), withExtension(file.name, outputInput.value));
    }
    setStatus(files.length + "개 이미지를 변환했습니다.");
  });

  clearButton.addEventListener("click", function () {
    fileInput.value = "";
    clearDownloads();
    setStatus("변환할 이미지를 선택하세요.");
  });

  function renderImage(image, mime, quality) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext("2d").drawImage(image, 0, 0);
    return new Promise(function (resolve) {
      canvas.toBlob(resolve, mime, mime === "image/png" ? undefined : quality);
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
    return name.replace(/\.[^.]+$/, "") + "." + ext;
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
