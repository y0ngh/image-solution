(function () {
  const fileInput = document.getElementById("watermark-file");
  const textInput = document.getElementById("watermark-text");
  const positionInput = document.getElementById("watermark-position");
  const sizeInput = document.getElementById("watermark-size");
  const opacityInput = document.getElementById("watermark-opacity");
  const colorInput = document.getElementById("watermark-color");
  const marginInput = document.getElementById("watermark-margin");
  const renderButton = document.getElementById("watermark-render");
  const downloadButton = document.getElementById("watermark-download");
  const status = document.getElementById("watermark-status");
  const canvas = document.getElementById("watermark-canvas");
  const context = canvas.getContext("2d");
  let image = null;
  let fileName = "watermarked.png";

  drawEmpty();

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    loadImage(file).then(function (loaded) {
      image = loaded;
      fileName = file.name.replace(/\.[^.]+$/, "") + "-watermark.png";
      render();
      setStatus(file.name + " 선택됨.");
    }).catch(function () {
      setStatus("이미지를 읽을 수 없습니다.");
    });
  });

  [textInput, positionInput, sizeInput, opacityInput, colorInput, marginInput].forEach(function (input) {
    input.addEventListener("input", function () {
      if (image) render();
    });
  });

  renderButton.addEventListener("click", render);

  downloadButton.addEventListener("click", function () {
    if (!image) {
      setStatus("먼저 이미지를 선택하세요.");
      return;
    }
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
  });

  function render() {
    if (!image) {
      drawEmpty();
      return;
    }
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);
    const text = textInput.value.trim();
    if (!text) {
      setStatus("워터마크 텍스트를 입력하세요.");
      return;
    }
    const size = Math.max(8, Number(sizeInput.value) || 48);
    const margin = Math.max(0, Number(marginInput.value) || 0);
    const transparencyValue = Number(opacityInput.value);
    const transparency = Number.isFinite(transparencyValue) ? Math.max(0, Math.min(1, transparencyValue / 100)) : 0.55;
    const opacity = 1 - transparency;
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0");
    context.save();
    context.font = "700 " + size + "px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.fillStyle = colorInput.value + alpha;
    context.textBaseline = "top";
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = size * 1.2;
    const point = getPoint(positionInput.value, textWidth, textHeight, margin);
    context.shadowColor = "rgba(0, 0, 0, " + (0.35 * opacity) + ")";
    context.shadowBlur = Math.max(2, size / 12);
    context.fillText(text, point.x, point.y);
    context.restore();
    setStatus("워터마크를 적용했습니다.");
  }

  function getPoint(position, textWidth, textHeight, margin) {
    const left = margin;
    const right = canvas.width - textWidth - margin;
    const top = margin;
    const bottom = canvas.height - textHeight - margin;
    if (position === "top-left") return { x: left, y: top };
    if (position === "top-right") return { x: right, y: top };
    if (position === "bottom-left") return { x: left, y: bottom };
    if (position === "center") return { x: (canvas.width - textWidth) / 2, y: (canvas.height - textHeight) / 2 };
    return { x: right, y: bottom };
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const loaded = new Image();
      loaded.onload = function () {
        URL.revokeObjectURL(url);
        resolve(loaded);
      };
      loaded.onerror = reject;
      loaded.src = url;
    });
  }

  function drawEmpty() {
    canvas.width = 900;
    canvas.height = 520;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#5e626b";
    context.font = "22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.textAlign = "center";
    context.fillText("이미지를 선택하세요.", canvas.width / 2, canvas.height / 2);
    context.textAlign = "left";
  }

  function setStatus(message) {
    status.textContent = message;
  }
})();
