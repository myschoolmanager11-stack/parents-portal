const input = document.getElementById("driveLink");
const viewerContainer = document.getElementById("viewerContainer");
let qrScanner;

/* تحميل الرابط المحفوظ تلقائيًا */
window.onload = function () {
    const savedLink = localStorage.getItem("drive_link");
    if (savedLink) {
        input.value = savedLink;
        loadFile(savedLink);
    }
};

/* حفظ الرابط */
function saveLink() {
    const link = input.value.trim();
    if (!link) return showMessage("يرجى إدخال رابط من Google Drive", true);

    localStorage.setItem("drive_link", link);
    loadFile(link);
}

/* مسح الرابط */
function clearLink() {
    localStorage.removeItem("drive_link");
    input.value = "";
    viewerContainer.innerHTML = "";
    showMessage("تم مسح الرابط بنجاح", false);
}

/* تشغيل QR */
function startQR() {
    document.getElementById("qr-reader").innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
            input.value = qrCodeMessage;
            localStorage.setItem("drive_link", qrCodeMessage);
            loadFile(qrCodeMessage);
            qrScanner.stop();
            showMessage("تم قراءة الرابط من QR بنجاح", false);
        },
        errorMessage => {}
    );
}

/* تحميل الملف وعرضه حسب نوعه */
function loadFile(link) {
    const fileId = extractFileId(link);
    if (!fileId) return showMessage("الرابط غير صالح", true);

    const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;

    // تحديد نوع الملف من الرابط
    const extensionMatch = link.match(/\.(pdf|txt|docx|doc|xlsx|xls|jpg|jpeg|png|gif)/i);
    const ext = extensionMatch ? extensionMatch[1].toLowerCase() : "pdf";

    viewerContainer.innerHTML = "";

    if (ext === "pdf" || ext === "docx" || ext === "doc" || ext === "xlsx" || ext === "xls") {
        const iframe = document.createElement("iframe");
        iframe.src = "https://docs.google.com/viewer?embedded=true&url=" + encodeURIComponent(downloadUrl);
        viewerContainer.appendChild(iframe);
    } else if (ext === "txt") {
        fetch(downloadUrl)
            .then(r => r.text())
            .then(txt => {
                const pre = document.createElement("pre");
                pre.textContent = txt;
                viewerContainer.appendChild(pre);
            })
            .catch(() => showMessage("فشل تحميل الملف النصي", true));
    } else if (["jpg","jpeg","png","gif"].includes(ext)) {
        const img = document.createElement("img");
        img.src = downloadUrl;
        viewerContainer.appendChild(img);
    } else {
        showMessage("نوع الملف غير مدعوم", true);
    }

    showMessage("تم تحميل الملف بنجاح", false);
}

/* استخراج File ID */
function extractFileId(link) {
    let match = link.match(/\/file\/d\/([^\/]+)/);
    if (match) return match[1];
    match = link.match(/id=([^&]+)/);
    if (match) return match[1];
    return null;
}

/* عرض رسالة */
function showMessage(text, isError) {
    const msg = document.getElementById("message");
    if (!msg) return;
    msg.style.display = "block";
    msg.textContent = text;
    if (isError) {
        msg.style.background = "#ffebee";
        msg.style.color = "#c62828";
        msg.style.border = "1px solid #ef9a9a";
    } else {
        msg.style.background = "#e8f5e9";
        msg.style.color = "#2e7d32";
        msg.style.border = "1px solid #a5d6a7";
    }
}
