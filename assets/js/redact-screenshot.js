(function () {
  const fileInput = document.getElementById("redact-file");
  const colorInput = document.getElementById("redact-color");
  const undoButton = document.getElementById("redact-undo");
  const downloadButton = document.getElementById("redact-download");
  const status = document.getElementById("redact-status");
  const canvas = document.getElementById("redact-canvas");
  const context = canvas.getContext("2d");
  const boxes = [];
  let image = null;
  let fileName = "redacted-screenshot.png";
  let dragging = false;
  let start = null;
  let draft = null;

  drawEmpty();

  fileInput.addEventListener("change", function () {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    loadImage(file).then(function (loaded) {
      image = loaded;
      fileName = file.name.replace(/\.[^.]+$/, "") + "-redacted.png";
      boxes.splice(0, boxes.length);
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      render();
      setStatus("숨길 영역을 드래그하세요.");
    }).catch(function () {
      setStatus("이미지를 읽을 수 없습니다.");
    });
  });

  canvas.addEventListener("mousedown", function (event) {
    if (!image) return;
    dragging = true;
    start = getCanvasPoint(event);
    draft = null;
  });

  canvas.addEventListener("mousemove", function (event) {
    if (!dragging || !start) return;
    const end = getCanvasPoint(event);
    draft = normalizeBox(start, end);
    render();
  });

  canvas.addEventListener("mouseup", finishDrag);
  canvas.addEventListener("mouseleave", finishDrag);

  undoButton.addEventListener("click", function () {
    boxes.pop();
    render();
    setStatus("마지막 가림 영역을 취소했습니다.");
  });

  downloadButton.addEventListener("click", function () {
    if (!image) {
      setStatus("먼저 스크린샷을 선택하세요.");
      return;
    }
    draft = null;
    render();
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = fileName;
    link.click();
  });

  function finishDrag() {
    if (!dragging) return;
    dragging = false;
    if (draft && draft.width > 2 && draft.height > 2) {
      boxes.push(draft);
      setStatus(boxes.length + "개 영역을 가렸습니다.");
    }
    draft = null;
    render();
  }

  function render() {
    if (!image) {
      drawEmpty();
      return;
    }
    context.drawImage(image, 0, 0);
    context.fillStyle = colorInput.value;
    boxes.forEach(fillBox);
    if (draft) {
      context.globalAlpha = 0.55;
      fillBox(draft);
      context.globalAlpha = 1;
    }
  }

  function fillBox(box) {
    context.fillRect(box.x, box.y, box.width, box.height);
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  function normalizeBox(a, b) {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      width: Math.abs(a.x - b.x),
      height: Math.abs(a.y - b.y)
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
    context.fillText("스크린샷을 선택하세요.", canvas.width / 2, canvas.height / 2);
    context.textAlign = "left";
  }

  function setStatus(message) {
    status.textContent = message;
  }
})();
