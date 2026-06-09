(function () {
  const receiptFile = document.getElementById("receipt-file");
  const receiptText = document.getElementById("receipt-text");
  const receiptCsv = document.getElementById("receipt-csv");
  const parseReceiptButton = document.getElementById("parse-receipt");
  const downloadReceiptButton = document.getElementById("download-receipt-csv");
  const receiptStatus = document.getElementById("receipt-status");
  const storeName = document.getElementById("store-name");
  const mealName = document.getElementById("meal-name");
  const mealQuantity = document.getElementById("meal-quantity");
  const mealPrice = document.getElementById("meal-price");
  const addMealButton = document.getElementById("add-meal");
  const clearMealsButton = document.getElementById("clear-meals");
  const printReceiptButton = document.getElementById("print-receipt");
  const receiptStore = document.getElementById("receipt-store");
  const receiptDate = document.getElementById("receipt-date");
  const receiptLines = document.getElementById("receipt-lines");
  const receiptTotal = document.getElementById("receipt-total");
  const meals = [];

  if (!receiptText || !receiptCsv) {
    return;
  }

  receiptDate.textContent = new Date().toLocaleString("ko-KR");
  renderReceipt();

  receiptFile.addEventListener("change", function () {
    const file = receiptFile.files && receiptFile.files[0];
    if (!file) {
      return;
    }

    if (!file.type.match(/^text\//) && !/\.(txt|csv)$/i.test(file.name)) {
      setReceiptStatus("이미지/PDF 자동 OCR은 아직 포함되어 있지 않습니다. 영수증 텍스트를 붙여넣어 주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function () {
      receiptText.value = String(reader.result || "");
      setReceiptStatus(file.name + " 텍스트를 불러왔습니다.");
    };
    reader.readAsText(file);
  });

  parseReceiptButton.addEventListener("click", function () {
    const rows = parseReceiptText(receiptText.value);
    if (!rows.length) {
      setReceiptStatus("금액이 포함된 영수증 텍스트 줄을 찾지 못했습니다.");
      return;
    }

    const total = rows.reduce(function (sum, row) { return sum + row.amount; }, 0);
    receiptCsv.value = ["item,amount"].concat(rows.map(function (row) {
      return escapeCsv(row.item) + "," + row.amount;
    }), "total," + total).join("\n");
    setReceiptStatus(rows.length + "개 항목과 총합 " + formatWon(total) + "을 CSV로 만들었습니다.");
  });

  downloadReceiptButton.addEventListener("click", function () {
    if (!receiptCsv.value.trim()) {
      setReceiptStatus("다운로드할 CSV 결과가 없습니다.");
      return;
    }

    downloadText(receiptCsv.value, "receipt.csv", "text/csv");
  });

  addMealButton.addEventListener("click", function () {
    const name = mealName.value.trim();
    const quantity = Math.max(1, Math.round(Number(mealQuantity.value) || 1));
    const price = Math.max(0, Math.round(Number(mealPrice.value) || 0));

    if (!name || !price) {
      setMealStatus("메뉴명과 금액을 입력해 주세요.");
      return;
    }

    meals.push({ name: name, quantity: quantity, price: price });
    mealName.value = "";
    mealPrice.value = "";
    mealQuantity.value = "1";
    renderReceipt();
    setMealStatus(name + " 항목을 추가했습니다.");
  });

  clearMealsButton.addEventListener("click", function () {
    meals.splice(0, meals.length);
    renderReceipt();
    setMealStatus("식사 내역을 비웠습니다.");
  });

  printReceiptButton.addEventListener("click", function () {
    if (!meals.length) {
      setMealStatus("PDF로 저장할 식사 내역을 먼저 추가해 주세요.");
      return;
    }

    document.body.classList.add("receipt-print-mode");
    window.print();
  });

  window.addEventListener("afterprint", function () {
    document.body.classList.remove("receipt-print-mode");
  });

  storeName.addEventListener("input", renderReceipt);

  function parseReceiptText(text) {
    return text.split(/\n+/).map(function (line) {
      const cleaned = line.replace(/[,원]/g, " ").replace(/\s+/g, " ").trim();
      const match = cleaned.match(/(.+?)\s+(\d{2,})$/);
      if (!match || /총합|합계|total/i.test(match[1])) {
        return null;
      }

      return {
        item: match[1].trim(),
        amount: Number(match[2])
      };
    }).filter(Boolean);
  }

  function renderReceipt() {
    const total = meals.reduce(function (sum, meal) {
      return sum + meal.quantity * meal.price;
    }, 0);

    receiptStore.textContent = storeName.value.trim() || "오늘의 식사";
    receiptLines.innerHTML = "";

    if (!meals.length) {
      const empty = document.createElement("li");
      empty.innerHTML = "<span>내역 없음</span><span>0원</span>";
      receiptLines.appendChild(empty);
    } else {
      meals.forEach(function (meal) {
        const line = document.createElement("li");
        line.innerHTML = "<span>" + escapeHtml(meal.name) + " x " + meal.quantity + "</span><span>" + formatWon(meal.quantity * meal.price) + "</span>";
        receiptLines.appendChild(line);
      });
    }

    receiptTotal.textContent = formatWon(total);
  }

  function escapeCsv(value) {
    const text = String(value);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function downloadText(text, fileName, mime) {
    const blob = new Blob([text], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function formatWon(value) {
    return Number(value).toLocaleString("ko-KR") + "원";
  }

  function setReceiptStatus(message) {
    receiptStatus.textContent = message;
  }

  function setMealStatus(message) {
    document.getElementById("meal-status").textContent = message;
  }
})();
