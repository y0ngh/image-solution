(function () {
  const fileInput = document.getElementById("edit-file");
  const cropX = document.getElementById("crop-x");
  const cropY = document.getElementById("crop-y");
  const cropWidth = document.getElementById("crop-width");
  const cropHeight = document.getElementById("crop-height");
  const rotateInput = document.getElementById("edit-rotate");
  const flipX = document.getElementById("flip-x");
  const flipY = document.getElementById("flip-y");
  const renderButton = document.getElementById("edit-render");
  const downloadButton = document.getElementById("edit-download");
  const status = document.getElementById("edit-status");
  const canvas = document.getElementById("edit-canvas");
  const context = canvas.getContext("2d");
  let image = null;
  let fileName = "edited-image.png";

  drawEmpty();

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    loadImage(file).then(function (loaded) {
      image = loaded;
      fileName = file.name.replace(/\.[^.]+$/, "") + "-edited.png";
      cropX.value = "0";
      cropY.value = "0";
      cropWidth.value = String(image.naturalWidth);
      cropHeight.value = String(image.naturalHeight);
      render();
      setStatus(file.name + " 선택됨.");
    }).catch(function () {
      setStatus("이미지를 읽을 수 없습니다.");
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
    const sx = clamp(Number(cropX.value) || 0, 0, image.naturalWidth - 1);
    const sy = clamp(Number(cropY.value) || 0, 0, image.naturalHeight - 1);
    const sw = clamp(Number(cropWidth.value) || image.naturalWidth, 1, image.naturalWidth - sx);
    const sh = clamp(Number(cropHeight.value) || image.naturalHeight, 1, image.naturalHeight - sy);
    const rotate = Number(rotateInput.value);
    const rotated = rotate === 90 || rotate === 270;

    canvas.width = rotated ? sh : sw;
    canvas.height = rotated ? sw : sh;
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.rotate(rotate * Math.PI / 180);
    context.scale(flipX.checked ? -1 : 1, flipY.checked ? -1 : 1);
    context.drawImage(image, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);
    context.restore();
    setStatus("편집 미리보기를 만들었습니다.");
  }

  function drawEmpty() {
    canvas.width = 800;
    canvas.height = 450;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#5e626b";
    context.font = "22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.textAlign = "center";
    context.fillText("이미지를 선택하세요.", canvas.width / 2, canvas.height / 2);
  }

  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const loaded = new Image();
      loaded.onload = function () { URL.revokeObjectURL(url); resolve(loaded); };
      loaded.onerror = reject;
      loaded.src = url;
    });
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function setStatus(message) {
    status.textContent = message;
  }
})();
