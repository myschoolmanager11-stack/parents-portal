const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewerContainer");
const downloadBtn = document.getElementById("downloadBtn");
const downloadContainer = document.getElementById("downloadContainer");
const selectedTitle = document.getElementById("selectedTitle");
const subTitle = document.getElementById("subTitle");
const messageBox = document.getElementById("message");

let currentKey = "";
let qrScanner = null;

/* ===== القائمة ===== */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

/* ===== الضغط على عنصر ===== */
function handleItemClick(name) {
    document.getElementById("dropdownMenu").style.display = "none";

    currentKey = "drive_" + name;
    selectedTitle.textContent = name;
    subTitle.textContent = name;

    const savedLink = localStorage.getItem(currentKey);

    if (savedLink) {
        loadFile(savedLink);
    } else {
        openModal(name);
    }
}

/* ===== فتح النافذة ===== */
function openModal(title) {
    modalTitle.textContent = "إدخال رابط: " + title;
    input.value = "";
    messageBox.textContent = "";
    document.getElementById("qr-reader").innerHTML = "";
    modal.style.display = "flex";
}

/* ===== إغلاق ===== */
function closeModal() {
    stopQR();
    modal.style.display = "none";
}

/* ===== حفظ ===== */
function saveLink() {
    const link = input.value.trim();
    if (!link) {
        messageBox.textContent = "يرجى إدخال رابط صحيح";
        return;
    }

    localStorage.setItem(currentKey, link);
    closeModal();
    loadFile(link);
}

/* ===== تحويل رابط Drive ===== */
function toPreviewLink(link) {
    const match = link.match(/\/d\/([^/]+)/);
    if (!match) return link;
    return `https://drive.google.com/file/d/${match[1]}/preview`;
}

/* ===== عرض الملف ===== */
function loadFile(link) {
    viewer.innerHTML = "";
    downloadContainer.style.display = "none";

    const previewLink = toPreviewLink(link);

    const iframe = document.createElement("iframe");
    iframe.src = previewLink;
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "1px solid #ccc";
    iframe.style.borderRadius = "8px";

    viewer.appendChild(iframe);

    // زر التحميل دائمًا متوفر
    downloadBtn.href = link;
    downloadContainer.style.display = "block";
}

/* ===== QR ===== */
function startQR() {
    const qrDiv = document.getElementById("qr-reader");
    qrDiv.innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        text => {
            input.value = text;
            localStorage.setItem(currentKey, text);
            stopQR();
            closeModal();
            loadFile(text);
        }
    );
}

function stopQR() {
    if (qrScanner) {
        qrScanner.stop().catch(() => {});
        qrScanner = null;
    }
}

/* ===== مسح الكل ===== */
function clearAllLinks() {
    if (confirm("هل تريد مسح جميع الروابط؟")) {
        localStorage.clear();
        location.reload();
    }
}
