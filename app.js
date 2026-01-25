const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewer");
let qrScanner;
let viewerInteractive = false;

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
        { fps: 10, qrbox: 250 },
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

    // رابط مباشر + Google Docs Viewer
    const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
    const viewerUrl = "https://docs.google.com/viewer?embedded=true&url=" + encodeURIComponent(downloadUrl);

    viewer.src = viewerUrl;
    showMessage("تم تحميل الملف وعرضه بنجاح", false);
}

/* استخراج File ID من الرابط */
function extractFileId(link) {
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

/* تفعيل أو تعطيل التفاعل مع iframe (الهاتف) */
function toggleViewerInteraction() {
    viewerInteractive = !viewerInteractive;

    if (viewerInteractive) {
        viewer.style.pointerEvents = "auto";
        showMessage("تم تفعيل التفاعل مع الملف (يمكنك التمرير والتكبير)", false);
    } else {
        viewer.style.pointerEvents = "none";
        showMessage("تم إيقاف التفاعل مع الملف للعودة للأزرار", false);
    }
}
