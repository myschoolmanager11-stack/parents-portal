const viewerContainer = document.getElementById("viewerContainer");
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const input = document.getElementById("driveLink");
const messageBox = document.getElementById("message");
const downloadContainer = document.getElementById("downloadContainer");
const downloadBtn = document.getElementById("downloadBtn");
const selectedTitle = document.getElementById("selectedTitle");

let currentItemKey = "";
let currentItemName = "";
let qrScanner = null;

/* ===============================
   القائمة
================================ */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.style.display = (menu.style.display === "block") ? "none" : "block";
}

/* ===============================
   عند الضغط على عنصر
================================ */
function openModalForItem(name) {
    document.getElementById("dropdownMenu").style.display = "none";

    currentItemName = name;
    currentItemKey = "drive_item_" + name;

    selectedTitle.textContent = name;

    const savedLink = localStorage.getItem(currentItemKey);

    if (savedLink) {
        loadFile(savedLink);
    } else {
        openModal(name); // ← الفتح الإجباري
    }
}

/* ===============================
   فتح النافذة (الحل هنا)
================================ */
function openModal(title) {
    modalTitle.textContent = "إدخال رابط: " + title;
    input.value = "";
    messageBox.textContent = "";
    document.getElementById("qr-reader").innerHTML = "";

    modal.style.display = "flex"; // ✅ الحل الصحيح
}

/* ===============================
   إغلاق النافذة
================================ */
function closeModal() {
    stopQR();
    modal.style.display = "none";
}

/* ===============================
   حفظ الرابط
================================ */
function saveLink() {
    const link = input.value.trim();

    if (!link) {
        showMessage("يرجى إدخال رابط صحيح", true);
        return;
    }

    localStorage.setItem(currentItemKey, link);
    closeModal();
    loadFile(link);
}

/* ===============================
   تحميل الملف
================================ */
function loadFile(link) {
    viewerContainer.innerHTML = "";
    downloadContainer.style.display = "none";

    const iframe = document.createElement("iframe");
    iframe.src = link;
    iframe.width = "100%";
    iframe.height = "600";

    viewerContainer.appendChild(iframe);

    downloadBtn.href = link;
    downloadContainer.style.display = "block";
}

/* ===============================
   QR
================================ */
function startQR() {
    const qrDiv = document.getElementById("qr-reader");
    qrDiv.innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        decodedText => {
            input.value = decodedText;
            localStorage.setItem(currentItemKey, decodedText);
            stopQR();
            closeModal();
            loadFile(decodedText);
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
   مسح جميع الروابط
================================ */
function clearAllLinks() {
    if (!confirm("هل تريد مسح جميع الروابط؟")) return;
    localStorage.clear();
    location.reload();
}

/* ===============================
   رسائل
================================ */
function showMessage(text, isError) {
    messageBox.textContent = text;
    messageBox.style.display = "block";
    messageBox.style.color = isError ? "#c62828" : "#2e7d32";

    setTimeout(() => {
        messageBox.style.display = "none";
    }, 3000);
}
