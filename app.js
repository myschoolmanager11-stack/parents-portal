const input = document.getElementById("driveLink");
const viewerContainer = document.getElementById("viewerContainer");
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const selectedTitle = document.getElementById("selectedTitle");
const schoolModal = document.getElementById("schoolModal");
const schoolInput = document.getElementById("schoolInput");
const schoolNameDisplay = document.getElementById("schoolName");

let currentItemKey = null;
let qrScanner = null;

// ================================
// عند تحميل الصفحة
// ================================
window.onload = function () {
    // عرض اسم المؤسسة من localStorage إن وجد
    const savedSchool = localStorage.getItem("schoolName");
    if (savedSchool) {
        schoolNameDisplay.textContent = savedSchool;
    } else {
        // عرض نافذة اختيار المؤسسة
        schoolModal.style.display = "flex";
    }
    viewerContainer.innerHTML = "";
    document.getElementById("subTitle").textContent = "لم يتم اختيار أي وثيقة";
};

// ================================
// حفظ اسم المؤسسة
// ================================
function saveSchool() {
    const name = schoolInput.value.trim();
    if (!name) {
        alert("يرجى إدخال اسم المؤسسة");
        return;
    }
    localStorage.setItem("schoolName", name);
    schoolNameDisplay.textContent = name;
    schoolModal.style.display = "none";
}

// ================================
// القائمة العلوية
// ================================
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
}

// ================================
// فتح نافذة إدخال الرابط
// ================================
function openModal(itemName) {
    currentItemKey = "drive_item_" + itemName;

    modalTitle.textContent = "إدخال رابط: " + itemName;
    input.value = localStorage.getItem(currentItemKey) || "";
    document.getElementById("subTitle").textContent = itemName;
    modal.style.display = "flex";
    toggleMenu();
}

// ================================
// إغلاق النافذة
// ================================
function closeModal() {
    modal.style.display = "none";
    stopQR();
}

// ================================
// حفظ الرابط
// ================================
function saveLink() {
    const link = input.value.trim();
    if (!link) {
        showMessage("يرجى إدخال رابط صالح", true);
        return;
    }
    localStorage.setItem(currentItemKey, link);

    const itemName = currentItemKey.replace("drive_item_", "");
    selectedTitle.textContent = itemName;
    document.getElementById("subTitle").textContent = itemName;
    closeModal();
    loadFile(link);
}

// ================================
// QR Scanner
// ================================
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

// ================================
// تحميل الملف حسب نوعه
// ================================
function loadFile(link) {
    viewerContainer.innerHTML = "";
    const downloadContainer = document.getElementById("downloadContainer");
    const downloadBtn = document.getElementById("downloadBtn");

    const fileId = extractFileId(link);
    if (!fileId) {
        showMessage("رابط الملف الذي أدخلته غير صالح", true);
        downloadContainer.style.display = "none";
        return;
    }

    const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
    const extMatch = link.match(/\.(pdf|txt|docx|doc|xlsx|xls|jpg|jpeg|png|gif)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "pdf";

    if (["pdf", "doc", "docx", "xls", "xlsx"].includes(ext)) {
        const iframe = document.createElement("iframe");
        iframe.src = "https://docs.google.com/viewer?embedded=true&url=" + encodeURIComponent(downloadUrl);
        viewerContainer.appendChild(iframe);
        downloadBtn.href = downloadUrl;
        downloadContainer.style.display = "block";
    } else if (ext === "txt") {
        fetch(downloadUrl)
            .then(r => r.text())
            .then(txt => {
                const pre = document.createElement("pre");
                pre.textContent = txt;
                viewerContainer.appendChild(pre);
                downloadBtn.href = downloadUrl;
                downloadContainer.style.display = "block";
            })
            .catch(() => {
                showMessage("تعذر تحميل الملف النصي", true);
                downloadContainer.style.display = "none";
            });
    } else if (["jpg","jpeg","png","gif"].includes(ext)) {
        const img = document.createElement("img");
        img.src = downloadUrl;
        img.style.maxWidth = "100%";
        viewerContainer.appendChild(img);
        downloadBtn.href = downloadUrl;
        downloadContainer.style.display = "block";
    } else {
        showMessage("نوع الملف غير مدعوم", true);
        downloadContainer.style.display = "none";
    }
}

// ================================
// استخراج File ID
// ================================
function extractFileId(link) {
    let match = link.match(/\/file\/d\/([^\/]+)/);
    if (match) return match[1];
    match = link.match(/id=([^&]+)/);
    if (match) return match[1];
    return null;
}

// ================================
// الرسائل
// ================================
function showMessage(text, isError) {
    const msg = document.getElementById("message");
    if (!msg) return;

    msg.textContent = text;
    msg.style.display = "block";
    msg.style.background = isError ? "#ffebee" : "#e8f5e9";
    msg.style.color = isError ? "#c62828" : "#2e7d32";
    msg.style.border = isError ? "1px solid #ef9a9a" : "1px solid #a5d6a7";

    setTimeout(() => { msg.style.display = "none"; }, 3000);
}

// ================================
// إغلاق القائمة عند الضغط خارجها
// ================================
document.addEventListener("click", function (e) {
    const menu = document.getElementById("dropdownMenu");
    const menuBtn = document.querySelector(".menu-btn");

    if (!menu.contains(e.target) && !menuBtn.contains(e.target)) {
        menu.classList.remove("show");
    }
});

// ================================
// مسح جميع الروابط
// ================================
function clearAllLinks() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("drive_item_")) localStorage.removeItem(key);
    });
    viewerContainer.innerHTML = "";
    document.getElementById("selectedTitle").textContent = "مرحبا بكم في فضاء خدماتنا الرقمية 👋";
    document.getElementById("subTitle").textContent = "لم يتم اختيار أي وثيقة";
    document.getElementById("downloadContainer").style.display = "none";
}
