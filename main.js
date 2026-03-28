const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const importFile = document.getElementById('importFile');

// 1. READ: Ambil data dari LocalStorage saat load (atau array kosong jika baru)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// 2. CREATE: Fungsi tambah transaksi (Update: Tambah Properti Date)
function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
        alert('Mohon isi deskripsi dan jumlah');
        return;
    }

    const transaction = {
        id: generateID(),
        text: text.value,
        amount: +amount.value,
        date: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }) // Format: 29 Mar 2026
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();

    text.value = '';
    amount.value = '';
}
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// 3. DELETE: Fungsi hapus transaksi berdasarkan ID
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

// Menampilkan transaksi ke layar
function addTransactionDOM(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

    item.innerHTML = `
        <div>
            ${transaction.text} 
            <small style="display: block; color: #777; font-size: 10px;">${transaction.date || ''}</small>
        </div>
        <span>${sign}${Math.abs(transaction.amount).toLocaleString('id-ID')}</span>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    list.appendChild(item);
}

// Update Saldo & Dashboard
function updateValues() {
    const amounts = transactions.map(t => t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1);

    balance.innerText = `Rp ${total.toLocaleString('id-ID')}`;
    money_plus.innerText = `+Rp ${income.toLocaleString('id-ID')}`;
    money_minus.innerText = `-Rp ${expense.toLocaleString('id-ID')}`;
}

// 4. UPDATE (Save to JSON): Simpan ke LocalStorage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Fungsi Download File JSON (Opsional)
function downloadJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(transactions));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "catatan_keuangan.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Inisialisasi App
function init() {
    list.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    updateValues();
}

init();
form.addEventListener('submit', addTransaction);

// ... (kode yang sudah ada tetap di sini)

// 5. IMPORT: Fungsi untuk membaca file JSON yang diunggah
function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validasi sederhana apakah data berupa array
            if (Array.isArray(importedData)) {
                // Gabungkan dengan transaksi yang sudah ada atau ganti semua?
                // Di sini kita ganti semua data dengan data dari file backup
                transactions = importedData;
                
                updateLocalStorage();
                init();
                alert('Data berhasil di-import!');
            } else {
                alert('Format file JSON tidak sesuai.');
            }
        } catch (err) {
            alert('Gagal membaca file. Pastikan file adalah JSON yang valid.');
        }
    };
    reader.readAsText(file);
}

// Event Listener untuk input file
importFile.addEventListener('change', importJSON);