(function () {
  const fileInput = document.getElementById("background-file");
  const toleranceInput = document.getElementById("background-tolerance");
  const applyButton = document.getElementById("background-apply");
  const resetButton = document.getElementById("background-reset");
  const downloadButton = document.getElementById("background-download");
  const chip = document.getElementById("background-chip");
  const status = document.getElementById("background-status");
  const canvas = document.getElementById("background-canvas");
  const context = canvas.getContext("2d");
  let image = null;
  let selected = null;
  let fileName = "background-removed.png";

  drawEmpty();

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    loadImage(file).then(function (loaded) {
      image = loaded;
      fileName = file.name.replace(/\.[^.]+$/, "") + "-transparent.png";
      selected = null;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      drawOriginal();
      setStatus("제거할 배경색을 이미지 위에서 클릭하세요.");
    }).catch(function () {
      setStatus("이미지를 읽을 수 없습니다.");
    });
  });

  canvas.addEventListener("click", function (event) {
    if (!image) return;
    const point = getCanvasPoint(event);
    const pixel = context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
    selected = { r: pixel[0], g: pixel[1], b: pixel[2] };
    chip.style.background = "rgb(" + selected.r + "," + selected.g + "," + selected.b + ")";
    setStatus("선택 색상 rgb(" + selected.r + ", " + selected.g + ", " + selected.b + "). 배경 제거를 누르세요.");
  });

  applyButton.addEventListener("click", function () {
    if (!image || !selected) {
      setStatus("이미지를 선택하고 제거할 배경색을 클릭하세요.");
      return;
    }
    drawOriginal();
    const tolerance = Number(toleranceInput.value) || 0;
    const data = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < data.data.length; index += 4) {
      const dr = data.data[index] - selected.r;
      const dg = data.data[index + 1] - selected.g;
      const db = data.data[index + 2] - selected.b;
      if (Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance) {
        data.data[index + 3] = 0;
      }
    }
    context.putImageData(data, 0, 0);
    setStatus("선택한 색상과 가까운 배경을 투명하게 처리했습니다.");
  });

  resetButton.addEventListener("click", function () {
    if (!image) return;
    drawOriginal();
    setStatus("원본 이미지를 다시 표시했습니다.");
  });

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

  function drawOriginal() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
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
