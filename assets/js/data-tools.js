(function () {
  const sourceData = document.getElementById("source-data");
  const resultData = document.getElementById("result-data");
  const jsonToCsvButton = document.getElementById("json-to-csv");
  const csvToJsonButton = document.getElementById("csv-to-json");
  const downloadButton = document.getElementById("download-result");
  const clearButton = document.getElementById("clear-data");
  const status = document.getElementById("data-status");
  let resultType = "txt";

  if (!sourceData || !resultData) {
    return;
  }

  jsonToCsvButton.addEventListener("click", function () {
    try {
      const parsed = JSON.parse(sourceData.value);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      if (!rows.length || rows.some(function (row) { return row === null || typeof row !== "object" || Array.isArray(row); })) {
        throw new Error("객체 또는 객체 배열 JSON만 CSV로 변환할 수 있습니다.");
      }

      const headers = Array.from(rows.reduce(function (set, row) {
        Object.keys(row).forEach(function (key) { set.add(key); });
        return set;
      }, new Set()));

      const csvRows = [headers.map(escapeCsv).join(",")].concat(rows.map(function (row) {
        return headers.map(function (header) {
          const value = row[header];
          return escapeCsv(value === undefined || value === null ? "" : stringifyCell(value));
        }).join(",");
      }));

      resultData.value = csvRows.join("\n");
      resultType = "csv";
      setStatus(rows.length + "개 행을 CSV로 변환했습니다.");
    } catch (error) {
      setStatus(error.message);
    }
  });

  csvToJsonButton.addEventListener("click", function () {
    try {
      const table = parseCsv(sourceData.value);
      if (table.length < 2) {
        throw new Error("헤더와 최소 1개 데이터 행이 필요합니다.");
      }

      const headers = table[0].map(function (header) { return header.trim(); });
      const rows = table.slice(1).filter(function (row) {
        return row.some(function (cell) { return cell.trim() !== ""; });
      }).map(function (row) {
        return headers.reduce(function (record, header, index) {
          record[header || "column_" + (index + 1)] = row[index] || "";
          return record;
        }, {});
      });

      resultData.value = JSON.stringify(rows, null, 2);
      resultType = "json";
      setStatus(rows.length + "개 행을 JSON으로 변환했습니다.");
    } catch (error) {
      setStatus(error.message);
    }
  });

  downloadButton.addEventListener("click", function () {
    if (!resultData.value.trim()) {
      setStatus("다운로드할 결과가 없습니다.");
      return;
    }

    const extension = resultType === "csv" ? "csv" : "json";
    const mime = resultType === "csv" ? "text/csv" : "application/json";
    downloadText(resultData.value, "converted." + extension, mime);
  });

  clearButton.addEventListener("click", function () {
    sourceData.value = "";
    resultData.value = "";
    resultType = "txt";
    setStatus("변환할 데이터를 입력하세요.");
  });

  function stringifyCell(value) {
    return typeof value === "object" ? JSON.stringify(value) : String(value);
  }

  function escapeCsv(value) {
    const text = String(value);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];

      if (char === '"' && inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        row.push(cell);
        cell = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") {
          index += 1;
        }
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }

    row.push(cell);
    rows.push(row);
    return rows;
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

  function setStatus(message) {
    status.textContent = message;
  }
})();
