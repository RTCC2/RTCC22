// Background image array
const backgrounds = [
    'url("background1.png")',
    'url("background2.png")',
    'url("background3.png")',
    'url("background4.png")'
];

let currentBackgroundIndex = 0;

// Function to switch background
function switchBackground() {
    currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
    document.body.style.backgroundImage = backgrounds[currentBackgroundIndex];
}

// Switch background every 3 seconds
setInterval(switchBackground, 3000);

// Element references
const dataLokasi = {
    utara: { infiltrasi: 10, mat: 2.5, intensitas: 120 },
    selatan: { infiltrasi: 15, mat: 3.0, intensitas: 110 },
    timur: { infiltrasi: 8, mat: 2.0, intensitas: 130 },
    barat: { infiltrasi: 12, mat: 2.8, intensitas: 115 },
};
const luasWilayahInput = document.getElementById("luasWilayah");
const luasTerpakaiInput = document.getElementById("luasTerpakai");
const satuanLuasWilayah = document.getElementById("satuanLuasWilayah");
const satuanLuasTerpakai = document.getElementById("satuanLuasTerpakai");
const lokasiInput = document.getElementById("lokasi");
const hitungButton = document.getElementById("hitungButton");
const outputLuas = document.getElementById("outputLuas");
const outputKoef = document.getElementById("outputKoef");
const outputVolume = document.getElementById("outputVolume");
const panjangInput = document.getElementById("panjang");
const lebarInput = document.getElementById("lebar");
const tinggiInput = document.getElementById("tinggi");

// Initial volume value
let calculatedVolume = 0;

// Helper function to convert Ha to m²
function convertToMeters(value, unit) {
    return unit === "ha" ? value * 10000 : value;
}

// Function to calculate the runoff coefficient
function calculateCoefficient(luasWilayah, luasTerpakai) {
    const koefTerpakai = 0.8; // Example value for built area
    const koefSisa = 0.2; // Example value for non-built area
    const luasSisa = luasWilayah - luasTerpakai;
    return ((luasTerpakai * koefTerpakai) + (luasSisa * koefSisa)) / luasWilayah;
}

// Function to calculate volume
function calculateVolume(coefficient, luasWilayah) {
    const rainfallIntensity = 0.1; // Example value for rainfall intensity (m)
    return coefficient * luasWilayah * rainfallIntensity;
}

// Event listener for the "Hitung" button
hitungButton.addEventListener("click", () => {
    const luasWilayah = convertToMeters(
        parseFloat(luasWilayahInput.value),
        satuanLuasWilayah.value
    );
    const luasTerpakai = convertToMeters(
        parseFloat(luasTerpakaiInput.value),
        satuanLuasTerpakai.value
    );

    if (isNaN(luasWilayah) || isNaN(luasTerpakai) || luasWilayah <= 0 || luasTerpakai <= 0) {
        alert("Harap masukkan nilai luas wilayah dan luas terpakai dengan benar.");
        return;
    }

    if (luasTerpakai > luasWilayah) {
        alert("Luas terpakai tidak boleh lebih besar dari luas wilayah.");
        return;
    }

    const coefficient = calculateCoefficient(luasWilayah, luasTerpakai);
    calculatedVolume = calculateVolume(coefficient, luasWilayah);

    outputLuas.textContent = `Luas Wilayah: ${luasWilayah.toFixed(2)} m²`;
    outputKoef.textContent = `Koefisien Limpasan: ${coefficient.toFixed(2)}`;
    outputVolume.textContent = `Volume Tampungan: ${calculatedVolume.toFixed(2)} m³`;

    // Set default dimensions based on calculated volume
    setDefaultDimensions(calculatedVolume);
});

// Function to set default dimensions
function setDefaultDimensions(volume) {
    const defaultPanjang = 10; // Example length (m)
    const defaultTinggi = 2; // Example height (m)
    const defaultLebar = volume / (defaultPanjang * defaultTinggi);

    panjangInput.value = defaultPanjang.toFixed(2);
    lebarInput.value = defaultLebar.toFixed(2);
    tinggiInput.value = defaultTinggi.toFixed(2);
}

// Function to adjust dimensions dynamically
function adjustDimensions(changedInput) {
    const panjang = parseFloat(panjangInput.value) || 0;
    const lebar = parseFloat(lebarInput.value) || 0;
    const tinggi = parseFloat(tinggiInput.value) || 0;

    if (calculatedVolume <= 0) {
        alert("Harap hitung volume terlebih dahulu.");
        return;
    }

    // Adjust dimensions based on the input that was changed
    if (changedInput === "panjang" && panjang > 0) {
        const newArea = calculatedVolume / tinggi;
        lebarInput.value = (newArea / panjang).toFixed(2);
    } else if (changedInput === "lebar" && lebar > 0) {
        const newArea = calculatedVolume / tinggi;
        panjangInput.value = (newArea / lebar).toFixed(2);
    } else if (changedInput === "tinggi" && tinggi > 0) {
        const newArea = calculatedVolume / tinggi;
        panjangInput.value = (newArea / lebar).toFixed(2);
        lebarInput.value = (calculatedVolume / (panjang * tinggi)).toFixed(2);
    }
}


// Event listeners for dimension adjustments
panjangInput.addEventListener("input", () => adjustDimensions("panjang"));
lebarInput.addEventListener("input", () => adjustDimensions("lebar"));
tinggiInput.addEventListener("input", () => adjustDimensions("tinggi"));

function evaluasiBozem(lokasi, tinggiBozem) {
    const mat = dataLokasi[lokasi].mat;
    const saranMaterialElement = document.getElementById("saranMaterial");
    const peringatanElement = document.getElementById("peringatan");

    if (tinggiBozem > mat) {
        saranMaterialElement.textContent = "Material yang disarankan: Beton.";
        peringatanElement.textContent = "Peringatan: Kedalaman bozem melebihi muka air tanah.";
    } else {
        saranMaterialElement.textContent = "Material yang disarankan: Tanah atau material sesuai karakter tanah setempat.";
        peringatanElement.textContent = "Kedalaman bozem berada dalam batas aman.";
    }
}
document.getElementById("hitungButton").addEventListener("click", () => {
    const lokasi = document.getElementById("lokasi").value;
    const tinggiBozem = parseFloat(document.getElementById("tinggi").value);

    if (lokasi && tinggiBozem) {
        evaluasiBozem(lokasi, tinggiBozem);
    }
});
