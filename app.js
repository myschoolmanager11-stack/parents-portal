/* ===============================
   عناصر الصفحة
================================ */
const viewer = document.getElementById("viewerContainer");
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const input = document.getElementById("driveLink");
const selectedTitle = document.getElementById("selectedTitle");
const subTitle = document.getElementById("subTitle");

const downloadContainer = document.getElementById("downloadContainer");
const downloadBtn = document.getElementById("downloadBtn");

let currentItemKey = null;
let qrScanner = null;

/* ===============================
   عند تحميل الصفحة
================================ */
window.onload = function () {
    viewer.innerHTML = "";
    selectedTitle.textContent = "مرحبا بكم في فضاء خدماتنا الرقمية 👋";
    subTitle.textContent = "";
    downloadContainer.style.display = "none";
};

/* ===============================
   القائمة
================================ */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
}

document.addEventListener("click", function (e) {
    const menu = document.getElementById("dropdownMenu");
    const menuBtn = document.querySelector(".menu-btn");

    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove("show");
    }
});

/* ===============================
   فتح نافذة الرابط
================================ */
function openModal(itemName) {
    currentItemKey = "drive_item_" + itemName;

    modalTitle.textContent = itemName;
    input.value = localStorage.getItem(currentItemKey) || "";

    modal.style.display = "flex";
    toggleMenu();
}

/* ===============================
   إغلاق النافذة
================================ */
function closeModal() {
    modal.style.display = "none";
    stopQR();
}

/* ===============================
   حفظ الرابط
================================ */
function saveLink() {
    const link = input.value.trim();
    if (!link) {
        showMessage("يرجى إدخال رابط صالح", true);
        return;
    }

    localStorage.setItem(currentItemKey, link);

    selectedTitle.textContent = modalTitle.textContent;
    subTitle.textContent = modalTitle.textContent;

    closeModal();
    loadFile(link);
}

/* ===============================
   مسح جميع الروابط
================================ */
function clearAllLinks() {
    if (!confirm("هل تريد مسح جميع الروابط المحفوظة؟")) return;

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("drive_item_")) {
            localStorage.removeItem(key);
        }
    });

    viewer.innerHTML = "";
    selectedTitle.textContent = "مرحبا بكم في فضاء خدماتنا الرقمية 👋";
    subTitle.textContent = "";
    downloadContainer.style.display = "none";
}

/* ===============================
   QR Scanner
================================ */
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

            selectedTitle.textContent = modalTitle.textContent;
            subTitle.textContent = modalTitle.textContent;

            stopQR();
            closeModal();
            loadFile(qrCodeMessage);
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
   تحميل ومعاينة الملف
================================ */
function loadFile(link) {
    viewer.innerHTML = "";
    downloadContainer.style.display = "none";

    const fileId = extractFileId(link);
    if (!fileId) {
        viewer.innerHTML = "<p>❌ رابط غير صالح</p>";
        return;
    }

    const downloadUrl =
        "https://drive.google.com/uc?export=download&id=" + fileId;

    const iframe = document.createElement("iframe");
    iframe.src =
        "https://docs.google.com/viewer?embedded=true&url=" +
        encodeURIComponent(downloadUrl);

    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";

    viewer.appendChild(iframe);

    downloadBtn.href = downloadUrl;
    downloadContainer.style.display = "block";
}

/* ===============================
   استخراج File ID
================================ */
function extractFileId(link) {
    let match = link.match(/\/file\/d\/([^\/]+)/);
    if (match) return match[1];

    match = link.match(/id=([^&]+)/);
    if (match) return match[1];

    return null;
}

/* ===============================
   الرسائل
================================ */
function showMessage(text, isError) {
    const msg = document.getElementById("message");
    if (!msg) return;

    msg.textContent = text;
    msg.style.display = "block";

    msg.style.background = isError ? "#ffebee" : "#e8f5e9";
    msg.style.color = isError ? "#c62828" : "#2e7d32";

    setTimeout(() => {
        msg.style.display = "none";
    }, 3000);
}
