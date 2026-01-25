const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewer");
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

    if (link === "") {
        showMessage("يرجى إدخال رابط ملف من Google Drive", true);
        return;
    }

    localStorage.setItem("drive_link", link);
    loadFile(link);
}

/* مسح الرابط */
function clearLink() {
    localStorage.removeItem("drive_link");
    input.value = "";
    viewer.src = "";
    showMessage("تم مسح الرابط بنجاح", false);
}

/* تشغيل قارئ QR */
function startQR() {
    document.getElementById("qr-reader").innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");

    qrScanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: 250
        },
        qrCodeMessage => {
            input.value = qrCodeMessage;
            localStorage.setItem("drive_link", qrCodeMessage);
            loadFile(qrCodeMessage);

            qrScanner.stop();
            showMessage("تم قراءة الرابط من QR بنجاح", false);
        },
        errorMessage => { }
    );
}

/* تحميل وعرض الملف */
function loadFile(link) {
    const fileId = extractFileId(link);

    if (!fileId) {
        showMessage("الرابط غير صالح، يرجى إدخال رابط ملف وليس مجلد", true);
        return;
    }

    // رابط المعاينة (أفضل لعرض PDF داخل iframe)
    const previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";

    viewer.src = previewUrl;
    showMessage("تم تحميل الملف وعرضه بنجاح", false);
}

/* استخراج File ID من الرابط */
function extractFileId(link) {
    // يدعم:
    // /file/d/FILE_ID/view
    // uc?id=FILE_ID
    let match = link.match(/\/file\/d\/([^\/]+)/);
    if (match) return match[1];

    match = link.match(/id=([^&]+)/);
    if (match) return match[1];

    return null;
}

/* عرض رسالة داخل الصفحة */
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
