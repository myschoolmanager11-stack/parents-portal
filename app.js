const input = document.getElementById("driveLink");
const viewerContainer = document.getElementById("viewerContainer");
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const selectedTitle = document.getElementById("selectedTitle");

let currentItemKey = null;
let qrScanner = null;

/* تحميل الصفحة */
window.onload = function () {
    viewerContainer.innerHTML = "";
};

/* القائمة */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
}

/* فتح المودال */
function openModal(itemName) {
    currentItemKey = "drive_item_" + itemName;
    modalTitle.textContent = "إدخال رابط: " + itemName;
    input.value = localStorage.getItem(currentItemKey) || "";
    modal.style.display = "flex";
    document.getElementById("dropdownMenu").classList.remove("show");
}

/* إغلاق المودال */
function closeModal() {
    modal.style.display = "none";
    stopQR();
}

/* حفظ الرابط */
function saveLink() {
    const link = input.value.trim();
    if (!link) {
        showMessage("يرجى إدخال رابط صالح", true);
        return;
    }

    localStorage.setItem(currentItemKey, link);
    selectedTitle.textContent = currentItemKey.replace("drive_item_", "");
    closeModal();
    loadFile(link);
}

/* QR */
function startQR() {
    const qrDiv = document.getElementById("qr-reader");
    qrDiv.innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        qrCodeMessage => {
            input.value = qrCodeMessage;
            saveLink();
        }
    );
}

function stopQR() {
    if (qrScanner) {
        qrScanner.stop().catch(() => {});
        qrScanner = null;
    }
}

/* تحميل الملف */
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

    // زر التحميل
    downloadBtn.href = downloadUrl;
    downloadContainer.style.display = "block";
}

/* استخراج File ID */
function extractFileId(link) {
    let match = link.match(/\/file\/d\/([^\/]+)/);
    if (match) return match[1];

    match = link.match(/id=([^&]+)/);
    if (match) return match[1];

    return null;
}

/* الرسائل */
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

/* إغلاق القائمة عند النقر خارجها */
document.addEventListener("click", function (e) {
    const menu = document.getElementById("dropdownMenu");
    const btn = document.querySelector(".menu-btn");

    if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.remove("show");
    }
});

/* مسح جميع الروابط */
function clearAllLinks() {
    Object.keys(localStorage).forEach(k => {
        if (k.startsWith("drive_item_")) {
            localStorage.removeItem(k);
        }
    });
    viewerContainer.innerHTML = "";
    selectedTitle.textContent = "تم مسح جميع الروابط";
}

