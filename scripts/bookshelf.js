document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/data/bookshelf-books.json');
    if (!response.ok) throw new Error('Failed to load bookshelf data');
    const data = await response.json();

    const container = document.querySelector('.bookshelf-container');
    container.innerHTML = '';

    data.shelves.forEach(shelf => {
      const section = document.createElement('div');
      section.className = 'shelf-section';
      section.innerHTML = `
        <div class="bookshelf-grid" id="${shelf.id}"></div>
        <div class="shelf-board">
          <div class="shelf-plaque">${shelf.label}</div>
        </div>
      `;
      container.appendChild(section);
    });

    data.books.forEach(book => {
      const grid = document.getElementById(book.shelf);
      if (!grid) return;
      grid.appendChild(createBookElement(book));
    });

  } catch (error) {
    console.error('Could not load bookshelf data:', error);
  }
});

function createBookElement(book) {
  const bookDiv = document.createElement('div');
  bookDiv.className = 'book';
  bookDiv.setAttribute('aria-label', `Book: ${book.title}`);
  bookDiv.setAttribute('role', 'article');
  bookDiv.setAttribute('tabindex', '0');

  if (book.spineColor) bookDiv.style.setProperty('--book-color', book.spineColor);
  if (book.width)      bookDiv.style.setProperty('--book-width', `${book.width}px`);
  if (book.height)     bookDiv.style.setProperty('--book-height', `${book.height}px`);

  const navigate = () => {
    if (!book.link) return;
    book.external ? window.open(book.link, '_blank') : (window.location.href = book.link);
  };
  if (book.link) {
    bookDiv.addEventListener('click', navigate);
    bookDiv.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
    });
  }

  // Logo icon
  if (book.coverImage) {
    const img = document.createElement('img');
    img.src = book.coverImage;
    img.alt = '';
    img.className = 'book-icon';
    img.loading = 'lazy';
    if (book.iconSize) {
      img.style.width = `${book.iconSize}px`;
      img.style.maxWidth = `${book.iconSize}px`;
    }
    bookDiv.appendChild(img);
  }

  // Label — image or text
  if (book.labelImage) {
    const labelImg = document.createElement('img');
    labelImg.src = book.labelImage;
    labelImg.alt = book.label || book.title;
    labelImg.className = 'book-label-image';
    labelImg.loading = 'lazy';
    if (book.labelImageSize) {
      labelImg.style.width = `${book.labelImageSize}px`;
    }
    const offset = book.labelImageOffset ?? 50;
    labelImg.style.bottom = `${offset}px`;
    bookDiv.appendChild(labelImg);
  } else {
    const label = document.createElement('span');
    label.className = 'book-label';
    label.textContent = book.label || book.title;
    const offset = book.labelOffset ?? 30;
    label.style.paddingBottom = `${offset}px`;
    bookDiv.appendChild(label);
  }

  return bookDiv;
}

// // JavaScript to be placed in your scripts/script.js file

// /**
//  * Bookshelf Class
//  * Manages the dynamic loading and rendering of book data.
//  */
// class BookshelfManager {
// //   constructor(containerId) {
// //     this.container = document.getElementById(containerId);
// //     this.books = [];
// //   }

//     constructor(containerId, dataPath = '/data/bookshelf-books.json') {
//         this.container = document.getElementById(containerId);
//         this.dataPath = dataPath;
//         this.books = [];
//     }

//   /**
//    * Fetches book data from a JSON file or an API.
//    * @returns {Promise<Array>} - Array of book objects.
//    */
// //   async fetchBooks() {
// //     try {
// //       // Option 1: Fetch from a local JSON file
// //       const response = await fetch('/data/bookshelf-books.json');
// //       if (!response.ok) throw new Error('Failed to load books data');
// //       const data = await response.json();
// //       return data.books;
// //     } catch (error) {
// //       console.warn('Could not load external JSON. Using inline fallback data.', error);
// //       // Option 2: Return static fallback data
// //       return this.getFallbackBooks();
// //     }
// //   }

//     async fetchBooks() {
//         try {
//             const response = await fetch(this.dataPath);
//             if (!response.ok) throw new Error('Failed to load books data');
//             const data = await response.json();
//             return data.books;
//         } catch (error) {
//             console.warn('Could not load external JSON. Using fallback.', error);
//             return this.getFallbackBooks();
//         }
//     }

//   /**
//    * Renders the books into the bookshelf grid.
//    * @param {Array} books - Array of book objects.
//    */
//   renderBooks(books) {
//     if (!this.container) return;
//     this.container.innerHTML = ''; // Clear existing content
//     books.forEach(book => {
//       const bookElement = this.createBookElement(book);
//       this.container.appendChild(bookElement);
//     });
//   }

//   /**
//    * Creates an individual book card DOM element.
//    * @param {Object} book - Book data.
//    * @returns {HTMLElement} - The book card element.
//    */
//   createBookElement(book) {
//   const bookDiv = document.createElement('div');
//   bookDiv.className = 'book';
//   bookDiv.setAttribute('aria-label', `Book: ${book.title}`);
//   bookDiv.setAttribute('role', 'article');
//   bookDiv.setAttribute('tabindex', '0');

//   // Apply per-book CSS custom properties
//   if (book.spineColor) bookDiv.style.setProperty('--book-color', book.spineColor);
//   if (book.width)      bookDiv.style.setProperty('--book-width', `${book.width}px`);
//   if (book.height)     bookDiv.style.setProperty('--book-height', `${book.height}px`);

//   // Click / keyboard navigation
//   if (book.link) {
//     const navigate = () => book.external
//       ? window.open(book.link, '_blank')
//       : (window.location.href = book.link);
//     bookDiv.addEventListener('click', navigate);
//     bookDiv.addEventListener('keydown', e => {
//       if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
//     });
//     bookDiv.style.cursor = 'pointer';
//   }

//   // Icon (your existing cover image, shown as spine icon)
//   if (book.coverImage) {
//     const img = document.createElement('img');
//     img.src = book.coverImage;
//     img.alt = '';                   // decorative; title is on aria-label
//     img.className = 'book-icon';
//     img.loading = 'lazy';
//     bookDiv.appendChild(img);
//   }

//   // Spine label
// //   const label = document.createElement('span');
// //   label.className = 'book-label';
// //   label.textContent = book.label || book.title;
// //   bookDiv.appendChild(label);
// if (book.labelImage) {
//   const labelImg = document.createElement('img');
//   labelImg.src = book.labelImage;
//   labelImg.alt = book.label || book.title;
//   labelImg.className = 'book-label-image';
//   labelImg.loading = 'lazy';
//   bookDiv.appendChild(labelImg);
// } else {
//     const label = document.createElement('span');
//     label.className = 'book-label';
//     label.textContent = book.label || book.title;
//     const offset = book.labelOffset ?? 50;   // defaults to 50px if not set
//     label.style.paddingBottom = `${offset}px`;
//     bookDiv.appendChild(label);
// }

//   return bookDiv;
// }

//   /**
//    * Provides fallback book data when external fetch fails.
//    * @returns {Array} - Fallback book objects.
//    */
//   getFallbackBooks() {
//     return [
//       {
//         title: "The Great Gatsby",
//         coverImage: "/assets/misc/books/great-gatsby.jpg",
//         link: "https://example.com/great-gatsby",
//         external: true
//       },
//       {
//         title: "1984",
//         coverImage: "/assets/misc/books/1984.jpg",
//         link: "https://example.com/1984",
//         external: true
//       },
//       {
//         title: "To Kill a Mockingbird",
//         coverImage: "/assets/misc/books/to-kill-a-mockingbird.jpg",
//         link: "https://example.com/to-kill-a-mockingbird",
//         external: true
//       },
//       {
//         title: "Pride and Prejudice",
//         coverImage: "/assets/misc/books/pride-and-prejudice.jpg",
//         link: "https://example.com/pride-and-prejudice",
//         external: true
//       },
//       {
//         title: "The Catcher in the Rye",
//         coverImage: "/assets/misc/books/catcher-in-the-rye.jpg",
//         link: "https://example.com/catcher-in-the-rye",
//         external: true
//       },
//       {
//         title: "Brave New World",
//         coverImage: "/assets/misc/books/brave-new-world.jpg",
//         link: "https://example.com/brave-new-world",
//         external: true
//       }
//     ];
//   }

//   /**
//    * Initializes the bookshelf by loading data and rendering.
//    */
//   async init() {
//     const booksData = await this.fetchBooks();
//     this.books = booksData;
//     this.renderBooks(this.books);
//   }
// }

// // Wait for the DOM to be fully loaded before initializing the bookshelf
// // document.addEventListener('DOMContentLoaded', () => {
// //   if (document.getElementById('bookshelfGrid')) {
// //     const bookshelf = new BookshelfManager('bookshelfGrid');
// //     bookshelf.init();
// //   }
// // });

// // document.addEventListener('DOMContentLoaded', () => {
// //   const shelves = [
// //     { gridId: 'leadershipGrid',  dataPath: '/data/books-leadership.json' },
// //     { gridId: 'speakingGrid',    dataPath: '/data/books-speaking.json' },
// //     { gridId: 'conferencesGrid', dataPath: '/data/books-conferences.json' },
// //   ];

// //   shelves.forEach(({ gridId, dataPath }) => {
// //     if (document.getElementById(gridId)) {
// //       const shelf = new BookshelfManager(gridId, dataPath);
// //       shelf.init();
// //     }
// //   });
// // });

// document.addEventListener('DOMContentLoaded', async () => {
//   try {
//     const response = await fetch('/data/bookshelf-books.json');
//     if (!response.ok) throw new Error('Failed to load bookshelf data');
//     const data = await response.json();

//     // 1. Build each shelf section dynamically from the "shelves" array
//     const container = document.querySelector('.bookshelf-container');
//     container.innerHTML = '';

//     data.shelves.forEach(shelf => {
//       const section = document.createElement('div');
//       section.className = 'shelf-section';
//       section.innerHTML = `
//         <div class="bookshelf-grid" id="${shelf.id}"></div>
//         <div class="shelf-board">
//           <div class="shelf-plaque">${shelf.label}</div>
//         </div>
//       `;
//       container.appendChild(section);
//     });

//     // 2. Drop each book into its shelf grid
//     data.books.forEach(book => {
//       const grid = document.getElementById(book.shelf);
//       if (!grid) return;
//       grid.appendChild(createBookElement(book));
//     });

//   } catch (error) {
//     console.error('Could not load bookshelf data:', error);
//   }
// });

// function createBookElement(book) {
//   const bookDiv = document.createElement('div');
//   bookDiv.className = 'book';
//   bookDiv.setAttribute('aria-label', `Book: ${book.title}`);
//   bookDiv.setAttribute('role', 'article');
//   bookDiv.setAttribute('tabindex', '0');

//   if (book.spineColor) bookDiv.style.setProperty('--book-color', book.spineColor);
//   if (book.width)      bookDiv.style.setProperty('--book-width', `${book.width}px`);
//   if (book.height)     bookDiv.style.setProperty('--book-height', `${book.height}px`);

//   const navigate = () => {
//     if (!book.link) return;
//     book.external ? window.open(book.link, '_blank') : (window.location.href = book.link);
//   };
//   if (book.link) {
//     bookDiv.addEventListener('click', navigate);
//     bookDiv.addEventListener('keydown', e => {
//       if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(); }
//     });
//   }

//   // Logo icon
//   if (book.coverImage) {
//     const img = document.createElement('img');
//     img.src = book.coverImage;
//     img.alt = '';
//     img.className = 'book-icon';
//     img.loading = 'lazy';
//     if (book.iconSize) {
//         img.style.width = `${book.iconSize}px`;
//         img.style.maxWidth = `${book.iconSize}px`;
//     }
//     bookDiv.appendChild(img);
//   }

//   // Label — image or text
//     // if (book.labelImage) {
//     //     const labelImg = document.createElement('img');
//     //     labelImg.src = book.labelImage;
//     //     labelImg.alt = book.label || book.title;
//     //     labelImg.className = 'book-label-image';
//     //     labelImg.loading = 'lazy';
//     //     if (book.labelImageSize) {
//     //         labelImg.style.width = `${book.labelImageSize}px`;
//     //         labelImg.style.maxWidth = `${book.labelImageSize}px`;
//     //     }
//     //     bookDiv.appendChild(labelImg);
//     // } else {
//     //     const label = document.createElement('span');
//     //     label.className = 'book-label';
//     //     label.textContent = book.label || book.title;
//     //     bookDiv.appendChild(label);
//     // }

//     if (book.labelImage) {
//         const labelImg = document.createElement('img');
//         labelImg.src = book.labelImage;
//         labelImg.alt = book.label || book.title;
//         labelImg.className = 'book-label-image';
//         labelImg.loading = 'lazy';

//         if (book.labelImageSize) {
//             labelImg.style.width = `${book.labelImageSize}px`;
//         }

//         // distance from bottom — defaults to 50px if not specified
//         const offset = book.labelImageOffset ?? 50;
//         labelImg.style.bottom = `${offset}px`;
//         bookDiv.appendChild(labelImg);
//     } else {
//         const label = document.createElement('span');
//         label.className = 'book-label';
//         label.textContent = book.label || book.title;
//         bookDiv.appendChild(label);
//     }

//   return bookDiv;
// }