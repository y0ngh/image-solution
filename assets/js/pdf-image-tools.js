import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.mjs";

const imageFiles = document.getElementById("pdf-image-files");
const buildPrintButton = document.getElementById("pdf-build-print");
const printButton = document.getElementById("pdf-print");
const printArea = document.getElementById("pdf-print-area");
const imageStatus = document.getElementById("pdf-image-status");
const pdfFile = document.getElementById("pdf-file");
const pdfScale = document.getElementById("pdf-scale");
const renderButton = document.getElementById("pdf-render");
const renderStatus = document.getElementById("pdf-render-status");
const downloads = document.getElementById("pdf-downloads");

buildPrintButton.addEventListener("click", async function () {
  const files = Array.from(imageFiles.files || []).filter(function (file) { return file.type.match(/^image\//); });
  if (!files.length) {
    imageStatus.textContent = "PDF로 묶을 이미지를 선택하세요.";
    return;
  }
  printArea.innerHTML = "";
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const page = document.createElement("div");
    page.className = "pdf-print-page";
    const image = document.createElement("img");
    image.src = url;
    image.alt = file.name;
    page.appendChild(image);
    printArea.appendChild(page);
  }
  imageStatus.textContent = files.length + "개 이미지를 인쇄용 페이지로 만들었습니다.";
});

printButton.addEventListener("click", function () {
  if (!printArea.children.length) {
    imageStatus.textContent = "먼저 PDF 미리보기를 만드세요.";
    return;
  }
  window.print();
});

renderButton.addEventListener("click", async function () {
  const file = pdfFile.files && pdfFile.files[0];
  if (!file) {
    renderStatus.textContent = "PDF 파일을 선택하세요.";
    return;
  }
  downloads.innerHTML = "";
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const scale = Number(pdfScale.value) || 1.5;
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport: viewport }).promise;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name.replace(/\.pdf$/i, "") + "-page-" + pageNumber + ".png";
    link.textContent = pageNumber + "페이지 PNG 다운로드";
    downloads.appendChild(link);
  }
  renderStatus.textContent = pdf.numPages + "개 페이지를 PNG로 렌더링했습니다.";
});
