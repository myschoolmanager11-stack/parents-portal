const input = document.getElementById("driveLink");
const viewer = document.getElementById("viewer");
let qrScanner = null;

// ÚäÏ ÝÊÍ ÇáÕÝÍÉ
window.onload = function () {
    const savedLink = localStorage.getItem("drive_link");
    if (savedLink) {
        input.value = savedLink;
        loadFile(savedLink);
    }
};

function saveLink() {
    const link = input.value.trim();
    if (!link) {
        alert("ÃÏÎá ÑÇÈØðÇ ÕÍíÍðÇ");
        return;
    }
    localStorage.setItem("drive_link", link);
    loadFile(link);
}

function clearLink() {
    localStorage.removeItem("drive_link");
    input.value = "";
    viewer.src = "";
    document.getElementById("qr-reader").innerHTML = "";
}

function loadFile(link) {
    const fileId = extractFileId(link);
    if (!fileId) {
        alert("ÑÇÈØ Google Drive ÛíÑ ÕÇáÍ");
        return;
    }
    const url = "https://drive.google.com/uc?export=download&id=" + fileId;
    viewer.src = url;
}

function extractFileId(link) {
    const match = link.match(/\/d\/([^\/]+)/);
    return match ? match[1] : null;
}

// QR Code
function startQR() {
    const qrDiv = document.getElementById("qr-reader");
    qrDiv.innerHTML = "";

    qrScanner = new Html5Qrcode("qr-reader");

    qrScanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        qrText => {
            input.value = qrText;
            localStorage.setItem("drive_link", qrText);
            loadFile(qrText);
            qrScanner.stop();
        },
        error => {}
    );
}