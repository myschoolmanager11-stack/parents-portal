const input = document.getElementById("driveLink");
const viewerContainer = document.getElementById("viewerContainer");
const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const selectedTitle = document.getElementById("selectedTitle");

let currentItemKey = null;
let qrScanner = null;

const clearAllBtn = document.getElementById("clearAllBtn");
const clearCurrentBtn = document.querySelector(".clear-current");

/* ===== عند تحميل الصفحة ===== */
window.onload = function () {
    viewerContainer.innerHTML = "";
    document.getElementById("subTitle").textContent = "";
    updateButtonsState();
};

/* ===== القائمة العلوية ===== */
function toggleMenu() {
    const menu = document.getElementById("dropdownMenu");
    menu.classList.toggle("show");
}

/* ===== فتح المودال ===== */
function openModal(itemName) {
    currentItemKey = "drive_item_" + itemName;
    modalTitle.textContent = "إدخال رابط: " + itemName;

    let allLinks = JSON.parse(localStorage.getItem("drive_links") || "{}");
    input.value = allLinks[currentItemKey] || "";

    updateButtonsState();
    modal.style.display = "flex";
}

/* ===== إغلاق المودال ===== */
function closeModal() {
    modal.style.display = "none";
    stopQR();
}

/* ===== حفظ الرابط ===== */
function saveLink() {
    const link = input.value.trim();
    if (!link) { clearCurrentLink(); showMessage("يرجى إدخال رابط صالح", true); return; }

    let allLinks = JSON.parse(localStorage.getItem("drive_links") || "{}");
    allLinks[currentItemKey] = link;
    localStorage.setItem("drive_links", JSON.stringify(allLinks));

    closeModal();
    loadFile(link);
    updateTitle(link);
    updateButtonsState();
}

/* ===== QR Scanner ===== */
function startQR() {
    const qrDiv = document.getElementById("qr-reader");
    qrDiv.innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        qrCodeMessage => {
            if (!qrCodeMessage.trim()) return;

            input.value = qrCodeMessage;
            let allLinks = JSON.parse(localStorage.getItem("drive_links") || "{}");
            allLinks[currentItemKey] = qrCodeMessage;
            localStorage.setItem("drive_links", JSON.stringify(allLinks));

            stopQR();
            closeModal();
            loadFile(qrCodeMessage);
            updateTitle(qrCodeMessage);
            updateButtonsState();
        }
    );
}

function stopQR() {
    if (qrScanner) { qrScanner.stop().catch(() => {}); qrScanner = null; }
}

/* ===== تحميل الملف حسب نوعه ===== */
function loadFile(link) {
    viewerContainer.innerHTML = "";

    const fileId = extractFileId(link);
    if (!fileId) { showMessage("رابط Google Drive غير صالح", true); return; }

    const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
    const extMatch = link.match(/\.(pdf|txt|docx|doc|xlsx|xls|jpg|jpeg|png|gif)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "pdf";

    if (["pdf","doc","docx","xls","xlsx"].includes(ext)) {
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
            }).catch(()=>showMessage("تعذر تحميل الملف النصي", true));

    } else if (["jpg","jpeg","png","gif"].includes(ext)) {
        const img = document.createElement("img");
        img.src = downloadUrl;
        img.style.maxWidth = "100%";
        viewerContainer.appendChild(img);

    } else {
        showMessage("نوع الملف غير مدعوم", true);
    }
}

/* ===== استخراج File ID ===== */
function extractFileId(link) {
    let match = link.match(/\/file\/d\/([^\/]+)/);
    if (match) return match[1];

    match = link.match(/id=([^&]+)/);
    if (match) return match[1];

    return null;
}

/* ===== الرسائل ===== */
function showMessage(text, isError) {
    const msg = document.getElementById("message");
    if (!msg) return;

    msg.textContent = text;
    msg.style.display = "block";
    msg.style.background = isError ? "#ffebee" : "#e8f5e9";
    msg.style.color = isError ? "#c62828" : "#2e7d32";
    msg.style.border = isError ? "1px solid #ef9a9a" : "1px solid #a5d6a7";

    setTimeout(()=>{ msg.style.display = "none"; }, 3000);
}

/* ===== مسح الرابط الحالي ===== */
function clearCurrentLink() {
    if (!currentItemKey) return;
    let allLinks = JSON.parse(localStorage.getItem("drive_links") || "{}");
    delete allLinks[currentItemKey];
    localStorage.setItem("drive_links", JSON.stringify(allLinks));

    input.value = "";
    selectedTitle.textContent = "مرحبا بكم في فضاء خدماتنا الرقمية 👋";
    document.getElementById("subTitle").textContent = "";
    viewerContainer.innerHTML = "";

    showMessage("تم مسح الرابط الحالي", false);
    updateButtonsState();
}

/* ===== مسح جميع الروابط ===== */
function clearAllLinks() {
    let allLinks = JSON.parse(localStorage.getItem("drive_links") || "{}");
    if (!Object.keys(allLinks).length) return;

    if (confirm("هل تريد مسح جميع الروابط المحفوظة؟")) {
        localStorage.removeItem("drive_links");
        selectedTitle.textContent = "مرحبا بكم في فضاء خدماتنا الرقمية 👋";
        document.getElementById("subTitle").textContent = "";
        viewerContainer.innerHTML = "";
        showMessage("تم مسح جميع الروابط", false);
        updateButtonsState();
    }
}

/* ===== تحديث العنوان بعد اختيار رابط ===== */
function updateTitle(link) {
    let itemName = currentItemKey.replace("drive_item_", "");
    selectedTitle.textContent = itemName || "مرحبا بكم في فضاء خدماتنا الرقمية 👋";
    document.getElementById("subTitle").textContent = itemName || "";
}

/* ===== تحديث حالة الأزرار ===== */
function updateButtonsState() {
    let allLinks = JSON.parse(localStorage.getItem("drive_links") || "{}");
    const hasLinks = Object.keys(allLinks).length > 0;

    if (hasLinks) clearAllBtn.classList.remove("disabled");
    else clearAllBtn.classList.add("disabled");

    if (currentItemKey && allLinks[currentItemKey]) clearCurrentBtn.disabled = false;
    else clearCurrentBtn.disabled = true;
}

/* ===== إغلاق القائمة عند الضغط خارجها ===== */
document.addEventListener("click", function(e){
    const menu = document.getElementById("dropdownMenu");
    const menuBtn = document.querySelector(".menu-btn");
    if(!menu.contains(e.target) && !menuBtn.contains(e.target)){
        menu.classList.remove("show");
    }
});
