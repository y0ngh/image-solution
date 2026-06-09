(function () {
  const fileInput = document.getElementById("merge-files");
  const fileList = document.getElementById("merge-file-list");
  const layoutSelect = document.getElementById("merge-layout");
  const rowsInput = document.getElementById("merge-rows");
  const columnsInput = document.getElementById("merge-columns");
  const gapInput = document.getElementById("merge-gap");
  const paddingInput = document.getElementById("merge-padding");
  const backgroundInput = document.getElementById("merge-background");
  const fitSelect = document.getElementById("merge-fit");
  const nameInput = document.getElementById("merge-name");
  const renderButton = document.getElementById("merge-render");
  const downloadButton = document.getElementById("merge-download");
  const clearButton = document.getElementById("merge-clear");
  const status = document.getElementById("merge-status");
  const canvas = document.getElementById("merge-canvas");
  const context = canvas.getContext("2d");
  const images = [];

  if (!fileInput || !canvas) {
    return;
  }

  drawEmptyCanvas();

  fileInput.addEventListener("change", function () {
    loadFiles(Array.from(fileInput.files || []));
  });

  layoutSelect.addEventListener("change", function () {
    const isGrid = layoutSelect.value === "grid";
    rowsInput.disabled = !isGrid;
    columnsInput.disabled = !isGrid;
    if (images.length) {
      renderMergedImage();
    }
  });

  [rowsInput, columnsInput, gapInput, paddingInput, backgroundInput, fitSelect].forEach(function (input) {
    input.addEventListener("input", function () {
      if (images.length) {
        renderMergedImage();
      }
    });
  });

  renderButton.addEventListener("click", renderMergedImage);

  downloadButton.addEventListener("click", function () {
    if (!images.length) {
      setStatus("다운로드할 합성 이미지가 없습니다.");
      return;
    }

    renderMergedImage();
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = buildFileName(nameInput.value);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setStatus("PNG 파일을 다운로드했습니다.");
  });

  clearButton.addEventListener("click", function () {
    images.splice(0, images.length).forEach(function (item) {
      URL.revokeObjectURL(item.url);
    });
    fileInput.value = "";
    fileList.innerHTML = "";
    drawEmptyCanvas();
    setStatus("합칠 스크린샷을 1개 이상 선택하세요.");
  });

  function loadFiles(files) {
    images.splice(0, images.length).forEach(function (item) {
      URL.revokeObjectURL(item.url);
    });
    fileList.innerHTML = "";

    const imageFiles = files.filter(function (file) {
      return file.type.match(/^image\//);
    });

    if (!imageFiles.length) {
      drawEmptyCanvas();
      setStatus("이미지 파일만 선택할 수 있습니다.");
      return;
    }

    Promise.all(imageFiles.map(readImageFile)).then(function (loadedImages) {
      images.push.apply(images, loadedImages);
      renderFileList();
      syncGridDefaults();
      renderMergedImage();
      setStatus(images.length + "개 스크린샷을 불러왔습니다.");
    }).catch(function () {
      drawEmptyCanvas();
      setStatus("일부 이미지를 읽지 못했습니다. 다시 선택해 주세요.");
    });
  }

  function readImageFile(file) {
    return new Promise(function (resolve, reject) {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = function () {
        resolve({
          file: file,
          image: image,
          url: url,
          width: image.naturalWidth,
          height: image.naturalHeight
        });
      };
      image.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("image load failed"));
      };
      image.src = url;
    });
  }

  function renderMergedImage() {
    if (!images.length) {
      drawEmptyCanvas();
      setStatus("합칠 스크린샷을 1개 이상 선택하세요.");
      return;
    }

    const gap = Math.max(0, Math.round(Number(gapInput.value) || 0));
    const padding = Math.max(0, Math.round(Number(paddingInput.value) || 0));
    const grid = getGrid(layoutSelect.value);
    const cellWidth = Math.max.apply(null, images.map(function (item) { return item.width; }));
    const cellHeight = Math.max.apply(null, images.map(function (item) { return item.height; }));

    canvas.width = padding * 2 + grid.columns * cellWidth + Math.max(0, grid.columns - 1) * gap;
    canvas.height = padding * 2 + grid.rows * cellHeight + Math.max(0, grid.rows - 1) * gap;
    context.fillStyle = backgroundInput.value || "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    images.forEach(function (item, index) {
      const row = Math.floor(index / grid.columns);
      const column = index % grid.columns;
      const x = padding + column * (cellWidth + gap);
      const y = padding + row * (cellHeight + gap);
      drawImageInCell(item.image, x, y, cellWidth, cellHeight, fitSelect.value);
    });

    setStatus(grid.rows + "행 x " + grid.columns + "열 레이아웃으로 미리보기를 만들었습니다.");
  }

  function getGrid(layout) {
    if (layout === "horizontal") {
      return { rows: 1, columns: images.length };
    }

    if (layout === "vertical") {
      return { rows: images.length, columns: 1 };
    }

    const rows = Math.max(1, Math.round(Number(rowsInput.value) || 1));
    const columns = Math.max(1, Math.round(Number(columnsInput.value) || 1));
    return {
      rows: Math.max(rows, Math.ceil(images.length / columns)),
      columns: columns
    };
  }

  function drawImageInCell(image, x, y, cellWidth, cellHeight, fit) {
    const scale = fit === "cover"
      ? Math.max(cellWidth / image.naturalWidth, cellHeight / image.naturalHeight)
      : Math.min(cellWidth / image.naturalWidth, cellHeight / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const drawX = x + (cellWidth - width) / 2;
    const drawY = y + (cellHeight - height) / 2;

    context.save();
    context.beginPath();
    context.rect(x, y, cellWidth, cellHeight);
    context.clip();
    context.drawImage(image, drawX, drawY, width, height);
    context.restore();
  }

  function syncGridDefaults() {
    if (layoutSelect.value !== "grid") {
      return;
    }

    const columns = Math.max(1, Math.ceil(Math.sqrt(images.length)));
    columnsInput.value = String(columns);
    rowsInput.value = String(Math.ceil(images.length / columns));
  }

  function renderFileList() {
    fileList.innerHTML = "";
    images.forEach(function (item, index) {
      const line = document.createElement("li");
      line.textContent = (index + 1) + ". " + item.file.name + " - " + item.width + " x " + item.height + "px";
      fileList.appendChild(line);
    });
  }

  function drawEmptyCanvas() {
    canvas.width = 960;
    canvas.height = 540;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#5e626b";
    context.font = "24px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    context.textAlign = "center";
    context.fillText("스크린샷을 선택하면 미리보기가 표시됩니다.", canvas.width / 2, canvas.height / 2);
  }

  function buildFileName(value) {
    const safeName = (value || "merged-screenshots.png").replace(/[\\/:*?"<>|]+/g, "-").trim();
    return safeName.toLowerCase().endsWith(".png") ? safeName : safeName + ".png";
  }

  function setStatus(message) {
    status.textContent = message;
  }
})();
