(function () {
  const sideMenuToggle = document.getElementById("side-menu-toggle");
  const sideMenu = document.getElementById("side-menu");
  const sideMenuClose = document.getElementById("side-menu-close");
  const sideTabOverlay = document.getElementById("side-tab-overlay");
  const imageInput = document.getElementById("image-input");
  const dropZone = document.getElementById("drop-zone");
  const previewImage = document.getElementById("preview-image");
  const emptyPreview = document.getElementById("empty-preview");
  const statusMessage = document.getElementById("status-message");
  const widthInput = document.getElementById("width-input");
  const heightInput = document.getElementById("height-input");
  const outputFormat = document.getElementById("output-format");
  const outputQuality = document.getElementById("output-quality");
  const ratioLock = document.getElementById("ratio-lock");
  const resetButton = document.getElementById("reset-button");
  const convertButton = document.getElementById("convert-button");
  const resizeForm = document.getElementById("resize-form");
  const resizeControls = document.getElementById("resize-controls");
  const persistentSideMenu = Boolean(sideMenu);
  const sideMenuScrollKey = "everything-you-need-side-menu-scroll";

  const state = {
    file: null,
    image: null,
    objectUrl: "",
    naturalWidth: 0,
    naturalHeight: 0,
    lastEdited: null
  };

  function openSideMenu() {
    if (!sideMenu || !sideMenuToggle || !sideTabOverlay) {
      return;
    }

    sideMenu.classList.add("is-open");
    sideMenu.setAttribute("aria-hidden", "false");
    sideMenuToggle.setAttribute("aria-expanded", "true");
    sideTabOverlay.hidden = false;
  }

  function closeSideMenu() {
    if (!sideMenu || !sideMenuToggle || !sideTabOverlay) {
      return;
    }

    if (persistentSideMenu) {
      sideMenu.classList.add("is-open");
      sideMenu.setAttribute("aria-hidden", "false");
      sideMenuToggle.setAttribute("aria-expanded", "true");
      sideTabOverlay.hidden = true;
      return;
    }

    sideMenu.classList.remove("is-open");
    sideMenu.setAttribute("aria-hidden", "true");
    sideMenuToggle.setAttribute("aria-expanded", "false");
    sideTabOverlay.hidden = true;
  }

  if (sideMenuToggle) {
    sideMenuToggle.setAttribute("aria-expanded", "true");
    sideMenu.classList.add("is-open");
    sideMenu.setAttribute("aria-hidden", "false");
    sideTabOverlay.hidden = true;

    sideMenuToggle.addEventListener("click", function () {
      const isOpen = sideMenu && sideMenu.classList.contains("is-open");
      if (isOpen) {
        closeSideMenu();
      } else {
        openSideMenu();
      }
    });
  }

  if (sideMenu) {
    try {
      const savedScrollTop = Number(sessionStorage.getItem(sideMenuScrollKey));
      if (Number.isFinite(savedScrollTop)) {
        sideMenu.scrollTop = savedScrollTop;
      }
    } catch (error) {
      // Continue without scroll restoration when browser storage is unavailable.
    }

    window.addEventListener("pagehide", function () {
      try {
        sessionStorage.setItem(sideMenuScrollKey, String(sideMenu.scrollTop));
      } catch (error) {
        // Continue navigation when browser storage is unavailable.
      }
    });
  }

  if (sideMenuClose) {
    sideMenuClose.addEventListener("click", closeSideMenu);
  }

  if (sideTabOverlay) {
    sideTabOverlay.addEventListener("click", closeSideMenu);
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeSideMenu();
    }
  });

  document.querySelectorAll("[data-action]").forEach(function (control) {
    control.addEventListener("click", function () {
      const action = control.getAttribute("data-action");
      closeSideMenu();

      if (action === "open-upload" && imageInput) {
        imageInput.click();
      }

      if (action === "download-png" && convertButton && !convertButton.disabled) {
        convertImage();
      }

      if (action === "focus-resize" && resizeControls) {
        resizeControls.scrollIntoView({ behavior: "smooth", block: "center" });
        if (widthInput) {
          widthInput.focus();
        }
      }

      if (action === "reset-size") {
        resetSize();
      }
    });
  });

  if (!imageInput || !dropZone) {
    return;
  }

  if (outputFormat) {
    outputFormat.addEventListener("change", updateConvertButtonLabel);
  }

  imageInput.addEventListener("change", function () {
    const file = imageInput.files && imageInput.files[0];
    if (file) {
      loadFile(file);
    }
  });

  ["dragenter", "dragover"].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function (event) {
      event.preventDefault();
      dropZone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach(function (eventName) {
    dropZone.addEventListener(eventName, function (event) {
      event.preventDefault();
      dropZone.classList.remove("is-dragging");
    });
  });

  dropZone.addEventListener("drop", function (event) {
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) {
      loadFile(file);
    }
  });

  widthInput.addEventListener("input", function () {
    updateLinkedDimension("width");
  });

  heightInput.addEventListener("input", function () {
    updateLinkedDimension("height");
  });

  resetButton.addEventListener("click", resetSize);

  resizeForm.addEventListener("submit", function (event) {
    event.preventDefault();
    convertImage();
  });

  function loadFile(file) {
    if (!file.type.match(/^image\/(jpe?g|png|webp)$/i) && !/\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
      setStatus("JPG, PNG 또는 WebP 파일만 선택할 수 있습니다.");
      return;
    }

    if (state.objectUrl) {
      URL.revokeObjectURL(state.objectUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = function () {
      state.file = file;
      state.image = image;
      state.objectUrl = objectUrl;
      state.naturalWidth = image.naturalWidth;
      state.naturalHeight = image.naturalHeight;
      state.lastEdited = null;

      previewImage.src = objectUrl;
      previewImage.hidden = false;
      emptyPreview.hidden = true;
      widthInput.value = String(image.naturalWidth);
      heightInput.value = String(image.naturalHeight);
      setControlsDisabled(false);
      setStatus(file.name + " 선택됨. 원본 크기: " + image.naturalWidth + " x " + image.naturalHeight + "px");
    };

    image.onerror = function () {
      URL.revokeObjectURL(objectUrl);
      setStatus("이미지를 읽을 수 없습니다. 다른 이미지 파일을 선택해 주세요.");
    };

    image.src = objectUrl;
  }

  function updateLinkedDimension(changedField) {
    if (!state.naturalWidth || !state.naturalHeight || !ratioLock.checked) {
      return;
    }

    if (state.lastEdited === changedField) {
      return;
    }

    state.lastEdited = changedField;

    if (changedField === "width") {
      const width = Number(widthInput.value);
      if (width > 0) {
        heightInput.value = String(Math.max(1, Math.round(width * state.naturalHeight / state.naturalWidth)));
      }
    } else {
      const height = Number(heightInput.value);
      if (height > 0) {
        widthInput.value = String(Math.max(1, Math.round(height * state.naturalWidth / state.naturalHeight)));
      }
    }

    state.lastEdited = null;
  }

  function resetSize() {
    if (!state.image) {
      return;
    }

    widthInput.value = String(state.naturalWidth);
    heightInput.value = String(state.naturalHeight);
    setStatus("원본 크기 " + state.naturalWidth + " x " + state.naturalHeight + "px로 되돌렸습니다.");
  }

  function convertImage() {
    if (!state.image) {
      setStatus("먼저 이미지를 선택해 주세요.");
      return;
    }

    const targetWidth = Math.round(Number(widthInput.value));
    const targetHeight = Math.round(Number(heightInput.value));

    if (!targetWidth || !targetHeight || targetWidth < 1 || targetHeight < 1) {
      setStatus("너비와 높이는 1px 이상의 숫자로 입력해 주세요.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const mimeType = outputFormat ? outputFormat.value : "image/png";
    const quality = outputQuality ? Math.max(0.01, Math.min(1, Number(outputQuality.value) / 100 || 0.9)) : 0.9;
    if (mimeType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, targetWidth, targetHeight);
    }
    context.drawImage(state.image, 0, 0, targetWidth, targetHeight);

    canvas.toBlob(function (blob) {
      if (!blob) {
        setStatus("이미지 파일을 생성하지 못했습니다. 이미지를 다시 선택해 주세요.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = buildDownloadName(state.file.name, mimeType);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setStatus(getFormatLabel(mimeType) + " 변환 완료: " + targetWidth + " x " + targetHeight + "px 파일을 다운로드했습니다.");
    }, mimeType, mimeType === "image/png" ? undefined : quality);
  }

  function buildDownloadName(fileName, mimeType) {
    const baseName = fileName.replace(/\.[^.]+$/, "").trim() || "converted-image";
    const extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : "png";
    return baseName.replace(/[\\/:*?"<>|]+/g, "-") + "." + extension;
  }

  function getFormatLabel(mimeType) {
    if (mimeType === "image/jpeg") return "JPG";
    if (mimeType === "image/webp") return "WebP";
    return "PNG";
  }

  function updateConvertButtonLabel() {
    if (convertButton && outputFormat) {
      convertButton.textContent = getFormatLabel(outputFormat.value) + "로 변환";
    }
  }

  function setControlsDisabled(disabled) {
    widthInput.disabled = disabled;
    heightInput.disabled = disabled;
    resetButton.disabled = disabled;
    convertButton.disabled = disabled;
  }

  function setStatus(message) {
    statusMessage.textContent = message;
  }
})();
