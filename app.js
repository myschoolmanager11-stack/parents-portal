const modal = document.getElementById("linkModal");
const modalTitle = document.getElementById("modalTitle");
const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewerContainer");
const viewerToolbar = document.getElementById("viewerToolbar");
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

/* ===== اختيار عنصر ===== */
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

/* ===== نافذة الرابط ===== */
function openModal(title) {
    modalTitle.textContent = "إدخال رابط: " + title;
    input.value = "";
    messageBox.textContent = "";
    document.getElementById("qr-reader").innerHTML = "";
    modal.style.display = "flex";
}

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

/* ===== عرض الملف ===== */
function toPreviewLink(link) {
    const match = link.match(/\/d\/([^/]+)/);
    if (!match) return link;
    return `https://drive.google.com/file/d/${match[1]}/preview`;
}

function loadFile(link) {
    viewer.innerHTML = "";
    viewerToolbar.style.display = "flex";

    const iframe = document.createElement("iframe");
    iframe.src = toPreviewLink(link);
    viewer.appendChild(iframe);
}

/* ===== أزرار المعاينة ===== */
function editCurrentLink() {
    openModal("تعديل الرابط");
    input.value = localStorage.getItem(currentKey) || "";
}

function downloadCurrentFile() {
    const link = localStorage.getItem(currentKey);
    if (link) window.open(link, "_blank");
}

function deleteCurrentLink() {
    if (confirm("هل تريد حذف هذا الرابط؟")) {
        localStorage.removeItem(currentKey);
        viewer.innerHTML = "";
        viewerToolbar.style.display = "none";
        selectedTitle.textContent = "تم حذف الملف";
        subTitle.textContent = "";
    }
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
    document.getElementById("dropdownMenu").style.display = "none";
    if (confirm("⚠️ هل تريد مسح جميع الروابط المحفوظة؟")) {
        localStorage.clear();
        location.reload();
    }
}

function openContact() {
    document.getElementById("dropdownMenu").style.display = "none";

    const contactMessage =
        "📞 الهاتف: 0550 00 00 00\n\n" +
        "📧 البريد الإلكتروني: myschoolmanager11@gmail.com\n\n" +
        "💬 WhatsApp: https://wa.me/213550000000";

    alert(contactMessage);
}
