// Form input buku
const bookForm = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const yearInput = document.getElementById("year");
const isCompleteInput = document.getElementById("isComplete");

// Container daftar buku
const incompleteBooks = document.getElementById("incompleteBooks");
const completeBooks = document.getElementById("completeBooks");

// UI tambahan
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const searchInput = document.getElementById("searchBook");
const filterSelect = document.getElementById("filterStatus");
const darkToggle = document.getElementById("darkModeToggle");

// Menyimpan seluruh data buku
let books = [];

// Status Edit
let isEditMode = false;
let editingBookId = null;

//   Ambil data buku dari localStorage
function loadData() {
  const data = localStorage.getItem("BOOKSHELF_APPS");
  books = data ? JSON.parse(data) : [];
}

//   Simpan data buku ke localStorage
function saveData() {
  localStorage.setItem("BOOKSHELF_APPS", JSON.stringify(books));
}

// Tambah buku baru
function addBook(book) {
  books.push(book);
  saveData();
  renderBooks();

  showToast("Buku berhasil ditambahkan 📚");
}

// Hapus buku berdasarkan id
function deleteBook(id) {
  if (!confirm("Yakin ingin menghapus buku ini?")) return;

  books = books.filter((book) => book.id !== id);
  saveData();
  renderBooks();
}

// Ubah status selesai / belum dibaca
function toggleBookStatus(id) {
  if (isEditMode) return;
  const book = books.find((book) => book.id === id);
  if (!book) return;

  book.isComplete = !book.isComplete;
  saveData();
  renderBooks();
}

// Handle submit form (tambah / edit buku)
bookForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (isEditMode) {
    updateBook();
  } else {
    addBook({
      id: Date.now(),
      title: titleInput.value.trim(),
      author: authorInput.value.trim(),
      year: Number(yearInput.value),
      isComplete: isCompleteInput.checked,
    });

    bookForm.reset();
  }
});

// Render daftar buku ke UI
function renderBooks() {
  incompleteBooks.innerHTML = "";
  completeBooks.innerHTML = "";

  const keyword = searchInput.value.toLowerCase();
  const filter = filterSelect.value;
  books
    .filter((book) => {
      const matchSearch =
        book.title.toLowerCase().includes(keyword) ||
        book.author.toLowerCase().includes(keyword);

      const matchFilter =
        filter === "all" ||
        (filter === "complete" && book.isComplete) ||
        (filter === "incomplete" && !book.isComplete);

      return matchSearch && matchFilter;
    })

    .forEach((book) => {
      const card = createBookCard(book);

      if (book.isComplete) {
        completeBooks.append(card);
      } else {
        incompleteBooks.append(card);
      }
    });
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "book-card";
  card.dataset.id = book.id;

  card.innerHTML = `
    <div class="book-info">
      <h3>${book.title}</h3>
      <p>Penulis: ${book.author}</p>
      <p>Tahun: ${book.year}</p>
    </div>
    <div class="action-buttons">
      <button class="move-btn">
        ${book.isComplete ? "Belum Dibaca" : "Selesai"}
      </button>
      <button class="delete-btn">Hapus</button>
      <button class="edit-btn">Edit</button>
    </div>
  `;

  if (book.id === editingBookId) {
    card.classList.add("editing");
  }

  card
    .querySelector(".move-btn")
    .addEventListener("click", () => toggleBookStatus(book.id));

  card
    .querySelector(".delete-btn")
    .addEventListener("click", () => deleteBook(book.id));

  card
    .querySelector(".edit-btn")
    .addEventListener("click", () => handleEditBook(book.id));

  return card;
}

// Masuk ke mode edit
function handleEditBook(id) {
  if (isEditMode) return;

  const book = books.find((b) => b.id === id);
  if (!book) return;

  isEditMode = true;
  editingBookId = id;

  titleInput.value = book.title;
  authorInput.value = book.author;
  yearInput.value = book.year;
  isCompleteInput.checked = book.isComplete;

  submitBtn.textContent = "Simpan Perubahan";
  cancelEditBtn.hidden = false;

  document.body.classList.add("editing");

  document
    .querySelectorAll(".book-card")
    .forEach((card) => card.classList.remove("editing"));

  const activeCard = document.querySelector(`[data-id="${id}"]`);
  if (activeCard) activeCard.classList.add("editing");

  bookForm.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  titleInput.focus();
}

function updateBook() {
  const book = books.find((b) => b.id === editingBookId);
  if (!book) return;

  book.title = titleInput.value.trim();
  book.author = authorInput.value.trim();
  book.year = Number(yearInput.value);
  book.isComplete = isCompleteInput.checked;

  saveData();
  renderBooks();

  showToast("Buku berhasil diperbarui ✏️");

  cancelEdit();
}

cancelEditBtn.addEventListener("click", cancelEdit);

function cancelEdit() {
  isEditMode = false;
  editingBookId = null;

  bookForm.reset();
  submitBtn.textContent = "Tambah Buku";
  cancelEditBtn.hidden = true;

  document.body.classList.remove("editing");

  document
    .querySelectorAll(".book-card")
    .forEach((card) => card.classList.remove("editing"));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Dark mode
if (darkToggle) {
  if (localStorage.getItem("DARK_MODE") === "true") {
    document.body.classList.add("dark");
    darkToggle.textContent = "☀️";
  }

  darkToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("DARK_MODE", isDark);
    darkToggle.textContent = isDark ? "☀️" : "🌙";
  });
}

// Realitime search & filter
searchInput.addEventListener("input", renderBooks);
filterSelect.addEventListener("change", renderBooks);

// Inisialisasi aplikasi
loadData();
renderBooks();
