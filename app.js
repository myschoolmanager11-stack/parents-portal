const input = document.getElementById("driveLink");
const viewerContainer = document.getElementById("viewerContainer");
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const selectedTitle = document.getElementById("selectedTitle");
const editLinkBtn = document.getElementById("editLinkBtn");
const downloadContainer = document.getElementById("downloadContainer");
const downloadBtn = document.getElementById("downloadBtn");

let currentItemKey = null;
let qrScanner = null;

/* ===============================
   عند تحميل الصفحة
=============================== */
window.onload = function () {
    viewerContainer.innerHTML = "";
    document.getElementById("subTitle").textContent = "";
    editLinkBtn.style.display = "none";
    downloadContainer.style.display = "none";
};

/* ===============================
   القائمة
=============================== */
function toggleMenu() {
    document.getElementById("dropdownMenu").classList.toggle("show");
}

/* ===============================
   فتح العنصر مباشرة أو عرض نافذة
=============================== */
function openItem(itemName) {
    currentItemKey = "drive_item_" + itemName;
    const link = localStorage.getItem(currentItemKey);

    if (link) {
        selectedTitle.textContent = itemName;
        document.getElementById("subTitle").textContent = itemName;
        editLinkBtn.style.display = "inline-block";
        loadFile(link);
    } else {
        openModal(itemName);
    }
}

/* ===============================
   تعديل الرابط الحالي
=============================== */
function editCurrentLink() {
    openModal(selectedTitle.textContent);
}

/* ===============================
   فتح نافذة إدخال الرابط
=============================== */
function openModal(itemName) {
    currentItemKey = "drive_item_" + itemName;
    modalTitle.textContent = "إدخال رابط: " + itemName;
    input.value = localStorage.getItem(currentItemKey) || "";
    modal.style.display = "flex";
}

/* ===============================
   إغلاق النافذة
=============================== */
function closeModal() {
    modal.style.display = "none";
    stopQR();
}

/* ===============================
   حفظ الرابط
=============================== */
function saveLink() {
    const link = input.value.trim();
    if (!link) return;

    localStorage.setItem(currentItemKey, link);
    selectedTitle.textContent = currentItemKey.replace("drive_item_", "");
    document.getElementById("subTitle").textContent = selectedTitle.textContent;
    editLinkBtn.style.display = "inline-block";

    closeModal();
    loadFile(link);
}

/* ===============================
   QR Scanner
=============================== */
function startQR() {
    const qrDiv = document.getElementById("qr-reader");
    qrDiv.innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        qrCodeMessage => {
            input.value = qrCodeMessage;
            localStorage.setItem(currentItemKey, qrCodeMessage);
            stopQR();
            closeModal();
            openItem(selectedTitle.textContent);
        }
    );
}

function stopQR() {
    if (qrScanner) {
        qrScanner.stop().catch(() => {});
        qrScanner = null;
    }
}

/* ===============================
   تحميل الملف حسب نوعه
=============================== */
function loadFile(link) {
    viewerContainer.innerHTML = "";
    downloadContainer.style.display = "none";

    const fileId = extractFileId(link);
    if (!fileId) {
        showMessage("رابط Google Drive غير صالح", true);
        return;
    }

    const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;

    const extMatch = link.match(/\.(pdf|txt|docx|doc|xlsx|xls|jpg|jpeg|png|gif)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "pdf";

    if (["pdf", "doc", "docx", "xls", "xlsx"].includes(ext)) {
        const iframe = document.createElement("iframe");
        iframe.src = "https://docs.google.com/viewer?embedded=true&url=" + encodeURIComponent(downloadUrl);
        viewerContainer.appendChild(iframe);
        downloadContainer.style.display = "block";
        downloadBtn.href = downloadUrl;
    } else if (ext === "txt") {
        fetch(downloadUrl)
            .then(r => r.text())
            .then(txt => {
                const pre = document.createElement("pre");
                pre.textContent = txt;
                viewerContainer.appendChild(pre);
                downloadContainer.style.display = "block";
                downloadBtn.href = downloadUrl;
            })
            .catch(() => showMessage("تعذر تحميل الملف النصي", true));
    } else if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
        const img = document.createElement("img");
        img.src = downloadUrl;
        viewerContainer.appendChild(img);
        downloadContainer.style.display = "block";
        downloadBtn.href = downloadUrl;
    } else {
        showMessage("نوع الملف غير مدعوم", true);
    }
}

/* ===============================
   استخراج File ID
=============================== */
function extractFileId(link) {
    let match = link.match(/\/file\/d\/([^\/]+)/);
    if (match) return match[1];
    match = link.match(/id=([^&]+)/);
    if (match) return match[1];
    return null;
}

/* ===============================
   الرسائل
=============================== */
function showMessage(text, isError) {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.style.display = "block";
    msg.style.background = isError ? "#ffebee" : "#e8f5e9";
    msg.style.color = isError ? "#c62828" : "#2e7d32";
    msg.style.border = isError ? "1px solid #ef9a9a" : "1px solid #a5d6a7";

    setTimeout(() => { msg.style.display = "none"; }, 3000);
}

/* ===============================
   مسح جميع الروابط
=============================== */
function clearAllLinks() {
    if (!confirm("هل تريد مسح جميع الروابط المحفوظة؟")) return;
    for (let key in localStorage) {
        if (key.startsWith("drive_item_")) localStorage.removeItem(key);
    }
    viewerContainer.innerHTML = "";
    selectedTitle.textContent = "";
    document.getElementById("subTitle").textContent = "";
    editLinkBtn.style.display = "none";
    downloadContainer.style.display = "none";
}

/* ===============================
   إغلاق القائمة عند الضغط خارجها
=============================== */
document.addEventListener("click", function (e) {
    const menu = document.getElementById("dropdownMenu");
    const menuBtn = document.querySelector(".menu-btn");
    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove("show");
    }
});
