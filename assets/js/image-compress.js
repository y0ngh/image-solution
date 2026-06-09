(function () {
  const fileInput = document.getElementById("compress-file");
  const formatInput = document.getElementById("compress-format");
  const qualityInput = document.getElementById("compress-quality");
  const targetInput = document.getElementById("compress-target");
  const widthInput = document.getElementById("compress-width");
  const runButton = document.getElementById("compress-run");
  const downloadButton = document.getElementById("compress-download");
  const preview = document.getElementById("compress-preview");
  const status = document.getElementById("compress-status");
  let sourceImage = null;
  let sourceFile = null;
  let resultBlob = null;
  let resultUrl = "";

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    loadImage(file).then(function (loaded) {
      sourceFile = file;
      sourceImage = loaded;
      setStatus(file.name + " 선택됨. 원본 " + formatBytes(file.size) + ", " + loaded.naturalWidth + " x " + loaded.naturalHeight + "px");
    }).catch(function () {
      setStatus("이미지를 읽을 수 없습니다.");
    });
  });

  runButton.addEventListener("click", async function () {
    if (!sourceImage) {
      setStatus("먼저 이미지를 선택하세요.");
      return;
    }

    const mime = formatInput.value;
    const targetKb = Number(targetInput.value);
    let quality = clamp(Number(qualityInput.value) / 100 || 0.82, 0.01, 1);

    if (targetKb > 0 && mime !== "image/png") {
      resultBlob = await compressToTarget(sourceImage, mime, targetKb * 1024);
    } else {
      resultBlob = await renderToBlob(sourceImage, mime, quality);
    }

    if (resultUrl) URL.revokeObjectURL(resultUrl);
    resultUrl = URL.createObjectURL(resultBlob);
    preview.src = resultUrl;
    preview.hidden = false;
    setStatus("압축 완료: " + formatBytes(sourceFile.size) + " -> " + formatBytes(resultBlob.size));
  });

  downloadButton.addEventListener("click", function () {
    if (!resultBlob || !resultUrl) {
      setStatus("먼저 압축 결과를 만드세요.");
      return;
    }
    downloadUrl(resultUrl, withExtension(sourceFile.name, formatInput.value));
  });

  async function compressToTarget(image, mime, targetBytes) {
    let low = 0.05;
    let high = 0.95;
    let best = await renderToBlob(image, mime, high);

    for (let i = 0; i < 8; i += 1) {
      const mid = (low + high) / 2;
      const blob = await renderToBlob(image, mime, mid);
      if (blob.size > targetBytes) {
        high = mid;
      } else {
        best = blob;
        low = mid;
      }
    }
    return best;
  }

  function renderToBlob(image, mime, quality) {
    const maxWidth = Number(widthInput.value);
    const scale = maxWidth > 0 && image.naturalWidth > maxWidth ? maxWidth / image.naturalWidth : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return new Promise(function (resolve) {
      canvas.toBlob(resolve, mime, mime === "image/png" ? undefined : quality);
    });
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = function () {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = reject;
      image.src = url;
    });
  }

  function withExtension(name, mime) {
    const ext = mime === "image/webp" ? "webp" : "jpg";
    return name.replace(/\.[^.]+$/, "") + "-compressed." + ext;
  }

  function downloadUrl(url, name) {
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
  }

  function formatBytes(bytes) {
    return bytes < 1024 * 1024 ? Math.round(bytes / 1024) + "KB" : (bytes / 1024 / 1024).toFixed(2) + "MB";
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setStatus(message) {
    status.textContent = message;
  }
})();
