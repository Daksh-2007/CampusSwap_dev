// back tot top

let backToTopBtn = document.querySelector('.back-to-top')

window.onscroll = () => {
    if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
        backToTopBtn.style.display = 'flex'
    } else {
        backToTopBtn.style.display = 'none'
    }
}

// top nav menu

let menuItems = document.getElementsByClassName('menu-item')

Array.from(menuItems).forEach((item, index) => {
    item.onclick = (e) => {
        let currMenu = document.querySelector('.menu-item.active')
        currMenu.classList.remove('active')
        item.classList.add('active')
    }
})

// food category

let foodMenuList = document.querySelector('.food-item-wrap')

let foodCategory = document.querySelector('.food-category')

let categories = foodCategory.querySelectorAll('button')
const itemSearchInput = document.getElementById('item-search')
const clearItemSearchBtn = document.getElementById('clear-item-search')

function applyItemSearch() {
    if (!foodMenuList) return

    const query = itemSearchInput ? itemSearchInput.value.trim().toLocaleLowerCase() : ''
    const activeCategory = foodCategory.querySelector('button.active')
    const categoryType = activeCategory ? activeCategory.getAttribute('data-food-type') : 'all'
    const items = foodMenuList.querySelectorAll('.food-item')
    let visibleCount = 0

    items.forEach((item) => {
        const title = item.querySelector('.item-info h3')
        const itemName = title ? title.textContent.trim().toLocaleLowerCase() : ''
        const matchesName = !query || itemName.includes(query)
        const matchesCategory = categoryType === 'all' || item.classList.contains(categoryType + '-type')
        const isVisible = matchesName && matchesCategory

        if (query) {
            item.style.display = isVisible ? 'block' : 'none'
        } else {
            item.style.removeProperty('display')
        }
        if (isVisible) visibleCount++
    })

    let emptyMessage = document.getElementById('item-search-empty')
    if (!emptyMessage) {
        emptyMessage = document.createElement('p')
        emptyMessage.id = 'item-search-empty'
        emptyMessage.className = 'item-search-empty'
        emptyMessage.textContent = 'No items found. Try a different name or category.'
        foodMenuList.insertAdjacentElement('afterend', emptyMessage)
    }
    emptyMessage.hidden = !query || visibleCount > 0

    if (clearItemSearchBtn) clearItemSearchBtn.hidden = !query
}

Array.from(categories).forEach((item) => {
    item.onclick = (e) => {
        const selectedCategory = e.currentTarget
        const currCat = foodCategory.querySelector('button.active')
        if (currCat) currCat.classList.remove('active')
        selectedCategory.classList.add('active')
        foodMenuList.className = 'food-item-wrap ' + selectedCategory.getAttribute('data-food-type')
        applyItemSearch()
    }
})

if (itemSearchInput) itemSearchInput.addEventListener('input', applyItemSearch)
if (clearItemSearchBtn) {
    clearItemSearchBtn.addEventListener('click', () => {
        itemSearchInput.value = ''
        applyItemSearch()
        itemSearchInput.focus()
    })
}

// on scroll animation

let scroll = window.requestAnimationFrame || function(callback) {window.setTimeout(callback, 1000/60)}

let elToShow = document.querySelectorAll('.play-on-scroll')

const isElInViewPort = (el) => {
    let rect = el.getBoundingClientRect()

    return (
        (rect.top <= 0 && rect.bottom >= 0)
        ||
        (rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) && rect.top <= (window.innerHeight || document.documentElement.clientHeight))
        ||
        (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight))
    )
}

const loop = () => {
    elToShow.forEach((item, index) => {
        if (isElInViewPort(item)) {
            item.classList.add('start')
        } else {
            item.classList.remove('start')
        }
    })

    scroll(loop)
}

loop()

// mobile nav

let bottomNavItems = document.querySelectorAll('.mb-nav-item')

let bottomMove = document.querySelector('.mb-move-item')

bottomNavItems.forEach((item, index) => {
    item.onclick = (e) => {
        let crrItem = document.querySelector('.mb-nav-item.active')
        if (crrItem) crrItem.classList.remove('active')
        item.classList.add('active')
        bottomMove.style.left = index * 20 + '%'
    }
})

// ==========================================
// CART & PRODUCT MODAL FUNCTIONALITY
// ==========================================

let cart = JSON.parse(localStorage.getItem('campus_swap_cart')) || []

const cartIconBtn = document.getElementById('cart-icon-btn')
const cartOverlay = document.getElementById('cart-overlay')
const cartSidebar = document.getElementById('cart-sidebar')
const closeCartBtn = document.getElementById('close-cart-btn')
const cartBadge = document.getElementById('cart-badge')
const cartItemsContainer = document.getElementById('cart-items')
const cartTotalPrice = document.getElementById('cart-total-price')
const toast = document.getElementById('toast')
const checkoutBtn = document.getElementById('checkout-btn')

// Product Modal elements
const productModalOverlay = document.getElementById('product-modal-overlay')
const productModal = document.getElementById('product-modal')
const closeProductModalBtn = document.getElementById('close-product-modal')
const modalProductImg = document.getElementById('modal-product-img')
const modalProductCategory = document.getElementById('modal-product-category')
const modalProductCondition = document.getElementById('modal-product-condition')
const modalConditionDetail = document.getElementById('modal-condition-detail')
const modalProductTitle = document.getElementById('modal-product-title')
const modalProductPrice = document.getElementById('modal-product-price')
const modalProductDesc = document.getElementById('modal-product-desc')
const modalQtyVal = document.getElementById('modal-qty-val')
const modalQtyMinus = document.getElementById('modal-qty-minus')
const modalQtyPlus = document.getElementById('modal-qty-plus')
const modalAddCartBtn = document.getElementById('modal-add-cart-btn')

let currentModalItem = null

// Product conditions supported
const conditionOptions = [
    { label: "Unused (Brand New)", badge: "Brand New", color: "#10b981", bg: "#d1fae5" },
    { label: "Excellent (Like a New)", badge: "Like New", color: "#0ea5e9", bg: "#e0f2fe" },
    { label: "Good", badge: "Good Condition", color: "#6366f1", bg: "#e0e7ff" },
    { label: "Fair", badge: "Fair", color: "#d97706", bg: "#fef3c7" },
    { label: "Acceptable", badge: "Acceptable", color: "#64748b", bg: "#f1f5f9" }
]

// Product descriptions mapped by food type or defaults
const descriptions = {
    salad: "A vibrant, refreshing blend of fresh seasonal greens, crisp vegetables, and a signature dressing crafted to perfection.",
    lorem: "Freshly baked artisan specialty made with premium spices and herbs, delivering rich flavors in every bite.",
    ipsum: "A savory gourmet delight cooked to tender perfection, seasoned with house herbs and served fresh and hot.",
    dolor: "Chef's special preparation packed with authentic, bold flavors, served piping hot with delicious accompaniments."
}

// Toast notification function
function showToast(message) {
    if (!toast) return
    toast.textContent = message
    toast.classList.add('show')
    setTimeout(() => {
        toast.classList.remove('show')
    }, 2200)
}

// Open / Close Product Modal
function openProductModal(itemData) {
    currentModalItem = itemData

    if (modalProductImg) modalProductImg.src = itemData.image
    if (modalProductTitle) modalProductTitle.textContent = itemData.title
    if (modalProductPrice) modalProductPrice.textContent = `₹ ${itemData.price}`
    if (modalProductCategory) modalProductCategory.textContent = itemData.category || 'Special Dish'
    if (modalProductDesc) modalProductDesc.textContent = itemData.description

    // Display Condition
    const condition = itemData.condition || conditionOptions[0]
    if (modalProductCondition) {
        modalProductCondition.textContent = condition.badge
        modalProductCondition.style.color = condition.color
        modalProductCondition.style.backgroundColor = condition.bg
    }
    if (modalConditionDetail) {
        modalConditionDetail.textContent = condition.label
        modalConditionDetail.style.color = condition.color
    }

    // Update modal button state if already in cart
    const isAlreadyInCart = cart.some(item => item.title === itemData.title && item.image === itemData.image)
    if (modalAddCartBtn) {
        if (isAlreadyInCart) {
            modalAddCartBtn.innerHTML = "<i class='bx bx-check'></i> Already in Cart"
            modalAddCartBtn.style.opacity = '0.75'
        } else {
            modalAddCartBtn.innerHTML = "<i class='bx bx-cart-alt'></i> Add to Cart"
            modalAddCartBtn.style.opacity = '1'
        }
    }

    if (productModal && productModalOverlay) {
        productModal.classList.add('active')
        productModalOverlay.classList.add('active')
    }
}

function closeProductModal() {
    if (productModal && productModalOverlay) {
        productModal.classList.remove('active')
        productModalOverlay.classList.remove('active')
    }
    currentModalItem = null
}

if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal)
if (productModalOverlay) productModalOverlay.addEventListener('click', closeProductModal)

if (modalAddCartBtn) {
    modalAddCartBtn.addEventListener('click', () => {
        if (!currentModalItem) return
        addItemToCart(currentModalItem)
        closeProductModal()
    })
}

// Helper to add unique (single-piece) item to cart
function addItemToCart(itemData) {
    const existingIndex = cart.findIndex(item => item.title === itemData.title && item.image === itemData.image)
    if (existingIndex !== -1) {
        showToast(`"${itemData.title}" is already in your cart!`)
        return
    }

    cart.push({
        title: itemData.title,
        price: itemData.price,
        image: itemData.image,
        quantity: 1
    })
    saveCart()
    showToast(`Added "${itemData.title}" to cart!`)
}

// Toggle Cart Sidebar
function openCart() {
    cartSidebar.classList.add('active')
    cartOverlay.classList.add('active')
}

function closeCart() {
    cartSidebar.classList.remove('active')
    cartOverlay.classList.remove('active')
}

if (cartIconBtn) {
    cartIconBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        openCart()
    })
}

if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart)
if (cartOverlay) cartOverlay.addEventListener('click', closeCart)

// Save to LocalStorage & update UI
function saveCart() {
    localStorage.setItem('campus_swap_cart', JSON.stringify(cart))
    renderCart()
}

// Render Cart UI
function renderCart() {
    // Total quantity count for badge
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0)
    if (cartBadge) {
        cartBadge.textContent = totalCount
        cartBadge.style.transform = 'scale(1.25)'
        setTimeout(() => {
            cartBadge.style.transform = 'scale(1)'
        }, 150)
    }

    if (!cartItemsContainer) return

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>'
        if (cartTotalPrice) cartTotalPrice.textContent = '₹ 0'
        return
    }

    let totalPrice = 0
    cartItemsContainer.innerHTML = ''

    cart.forEach((item, index) => {
        totalPrice += item.price

        const itemEl = document.createElement('div')
        itemEl.className = 'cart-item-card'
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.src='assets/calculator.png'">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">₹ ${item.price}</div>
            </div>
            <button class="remove-item-btn" data-index="${index}" title="Remove item">
                <i class='bx bx-trash'></i>
            </button>
        `
        cartItemsContainer.appendChild(itemEl)
    })

    if (cartTotalPrice) {
        cartTotalPrice.textContent = `₹ ${totalPrice}`
    }

    // Attach event listeners inside cart (remove only, since each item is unique)
    cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index)
            cart.splice(idx, 1)
            saveCart()
        })
    })
}

// Helper to extract item information from a .food-item DOM element
function getItemDataFromElement(foodEl, index = 0) {
    const titleEl = foodEl.querySelector('.item-info h3')
    const priceEl = foodEl.querySelector('.item-info span')
    const imgHolder = foodEl.querySelector('.img-holder')

    const title = titleEl ? titleEl.textContent.trim() : 'College Essential'

    let price = 150
    if (priceEl) {
        const numeric = priceEl.textContent.replace(/[^\d.]/g, '')
        if (numeric) price = parseFloat(numeric)
    }

    let image = 'assets/calculator.png'
    if (imgHolder && imgHolder.style.backgroundImage) {
        const match = imgHolder.style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)
        if (match && match[1]) {
            image = match[1]
        }
    }

    // Determine category and description
    let category = foodEl.getAttribute('data-category') || 'College Essential'
    let desc = foodEl.getAttribute('data-desc')

    if (!desc) {
        if (foodEl.classList.contains('tech-type')) {
            category = 'Electronics & Tech'
            desc = "Fully functional campus electronic essential, battery checked and verified for student daily use."
        } else if (foodEl.classList.contains('books-type')) {
            category = 'Books & Notes'
            desc = "Curriculum-aligned textbook and study reference material for university semester courses."
        } else if (foodEl.classList.contains('stationery-type')) {
            category = 'Stationery & Tools'
            desc = "Essential academic drafting and stationery tool for assignments, exams, and projects."
        } else if (foodEl.classList.contains('cables-type')) {
            category = 'Cables & Adapters'
            desc = "Tested connectivity cable and adapter, ideal for laptop displays, phone charging, and data transfer."
        } else {
            desc = "Quality pre-loved college essential verified and ready for student handoff on campus."
        }
    }

    // Determine condition (from data attribute or cyclical distribution among supported options)
    const conditionAttr = foodEl.getAttribute('data-condition')
    let condition = null
    if (conditionAttr) {
        condition = conditionOptions.find(c => c.label.toLowerCase().includes(conditionAttr.toLowerCase()))
    }
    if (!condition) {
        condition = conditionOptions[index % conditionOptions.length]
    }

    return {
        title,
        price,
        image,
        category,
        description: desc,
        condition: condition
    }
}

// Attach Item Click (Modal) & Quick Add To Cart events
function setupFoodItemInteractions() {
    const foodItems = document.querySelectorAll('.food-item')

    foodItems.forEach((foodEl, index) => {
        // Quick add to cart button inside item card
        const cartBtn = foodEl.querySelector('.cart-btn')
        if (cartBtn) {
            cartBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                const data = getItemDataFromElement(foodEl, index)
                addItemToCart(data)
            })
        }

        // Clicking the item card opens the product details modal
        const itemWrap = foodEl.querySelector('.item-wrap')
        if (itemWrap) {
            itemWrap.addEventListener('click', (e) => {
                // If clicked button or icon inside cart-btn, do not open modal
                if (e.target.closest('.cart-btn')) return
                const data = getItemDataFromElement(foodEl, index)
                openProductModal(data)
            })
        }
    })
}

// Checkout button handler
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!')
            return
        }
        alert('Thank you for your order!')
        cart = []
        saveCart()
        closeCart()
    })
}

// Initialize Cart on Load
document.addEventListener('DOMContentLoaded', () => {
    setupFoodItemInteractions()
    renderCart()
    initAuthAndListingSystem()
})

// Run immediately in case DOM is already loaded
setupFoodItemInteractions()
renderCart()
initAuthAndListingSystem()

// ========================================================
// AUTHENTICATION, LISTING REQUESTS & ADMIN DASHBOARD SYSTEM
// ========================================================

const ADMIN_CREDENTIALS = {
    email: 'admin@campusswap.com',
    password: 'admin123'
}

// Global state stored in LocalStorage
let currentUser = JSON.parse(localStorage.getItem('cs_current_user')) || null
let listingRequests = JSON.parse(localStorage.getItem('cs_listing_requests')) || [
    {
        id: 'REQ-101',
        title: 'Apple iPad 9th Gen (64GB WiFi)',
        category: 'tech',
        price: 18500,
        condition: 'Excellent (Like a New)',
        description: 'Used for only one semester with screen protector and case. Battery health 96%. Comes with original charger.',
        image: 'assets/calculator.png',
        email: 'rahul.cse@campus.edu',
        phone: '+91 9876541230',
        address: 'Boys Hostel 2, Room 314',
        status: 'pending',
        date: new Date().toLocaleDateString()
    },
    {
        id: 'REQ-102',
        title: 'Digital Electronics Morris Mano',
        category: 'books',
        price: 290,
        condition: 'Good',
        description: 'Standard textbook for 3rd semester EE/ECE/CSE. Minor pencil annotations, all pages intact.',
        image: 'assets/book.png',
        email: 'sneha.ece@campus.edu',
        phone: '+91 9811223344',
        address: 'Girls Hostel 1, Block A',
        status: 'pending',
        date: new Date().toLocaleDateString()
    }
]

let activeAdminTab = 'requests' // 'requests' or 'listings'

// Initialize all DOM bindings for User / Admin / Form
function initAuthAndListingSystem() {
    updateNavUserLabel()
    setupListingForm()
    setupUserModalEvents()
    setupAdminEditModal()
    setupSubscribeForm()
}

// Setup Footer Email Subscription Form
function setupSubscribeForm() {
    const subscribeForm = document.getElementById('subscribe-form')
    const emailInput = document.getElementById('subscribe-email-input')
    const successMsg = document.getElementById('subscribe-success-msg')

    if (!subscribeForm) return

    subscribeForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const email = emailInput ? emailInput.value.trim() : ''

        if (email) {
            // Save to localStorage list of subscribers
            const subscribers = JSON.parse(localStorage.getItem('cs_subscribers')) || []
            if (!subscribers.includes(email)) {
                subscribers.push(email)
                localStorage.setItem('cs_subscribers', JSON.stringify(subscribers))
            }

            if (successMsg) {
                successMsg.style.display = 'flex'
            }

            if (emailInput) {
                emailInput.value = ''
            }

            showToast('Subscribed! You will get campus listing alerts.')
        }
    })
}

// Update Top Navbar Profile Label
function updateNavUserLabel() {
    const navUserLabel = document.getElementById('nav-user-label')
    if (!navUserLabel) return

    if (!currentUser) {
        navUserLabel.textContent = 'Login / Profile'
    } else if (currentUser.isAdmin) {
        navUserLabel.innerHTML = "<i class='bx bx-shield-quarter'></i> Admin"
    } else {
        navUserLabel.textContent = currentUser.name.split(' ')[0] || 'Profile'
    }
}

// Top level window functions to ensure instant availability from HTML onclick
function openUserModal() {
    const userModalOverlay = document.getElementById('user-modal-overlay')
    const userModal = document.getElementById('user-modal')
    if (!userModal || !userModalOverlay) {
        console.error('Modal elements not found')
        return
    }
    renderUserModalView()
    userModalOverlay.style.display = 'block'
    userModal.style.display = 'block'
    setTimeout(() => {
        userModalOverlay.classList.add('active')
        userModal.classList.add('active')
    }, 10)
}

function closeUserModal() {
    const userModalOverlay = document.getElementById('user-modal-overlay')
    const userModal = document.getElementById('user-modal')
    if (!userModal || !userModalOverlay) return
    userModal.classList.remove('active')
    userModalOverlay.classList.remove('active')
    setTimeout(() => {
        userModal.style.display = 'none'
        userModalOverlay.style.display = 'none'
    }, 300)
}

window.openUserModal = openUserModal
window.closeUserModal = closeUserModal

// Setup User & Profile Modal
function setupUserModalEvents() {
    const navProfileBtn = document.getElementById('nav-profile-btn')
    const mbProfileBtn = document.getElementById('mb-profile-btn')
    const userModalOverlay = document.getElementById('user-modal-overlay')
    const closeUserModalBtn = document.getElementById('close-user-modal')

    if (navProfileBtn) navProfileBtn.addEventListener('click', openUserModal)
    if (mbProfileBtn) mbProfileBtn.addEventListener('click', (e) => {
        e.preventDefault()
        openUserModal()
    })
    if (closeUserModalBtn) closeUserModalBtn.addEventListener('click', closeUserModal)
    if (userModalOverlay) userModalOverlay.addEventListener('click', closeUserModal)

    // Login Form Handler
    const loginForm = document.getElementById('login-form')
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault()
            const email = document.getElementById('login-email').value.trim()
            const password = document.getElementById('login-password').value.trim()

            // Check if Admin
            if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
                currentUser = {
                    id: 'ADMIN-001',
                    name: 'Campus Administrator',
                    email: ADMIN_CREDENTIALS.email,
                    phone: '+91 9999988888',
                    address: 'Administration Block, Room 101',
                    isAdmin: true
                }
                showToast('Welcome, Administrator! Admin console unlocked.')
            } else {
                // Any regular student login
                const randomId = 'CS-' + Math.floor(10000 + Math.random() * 90000)
                const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ')
                const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1)

                currentUser = {
                    id: randomId,
                    name: formattedName || 'Student Buyer',
                    email: email,
                    phone: '+91 9876543210',
                    address: 'University Campus Hostel',
                    isAdmin: false
                }
                showToast(`Welcome back, ${currentUser.name}!`)
            }

            localStorage.setItem('cs_current_user', JSON.stringify(currentUser))
            updateNavUserLabel()
            renderUserModalView()
        })
    }

    // Edit Profile Form Handler
    const profileEditForm = document.getElementById('profile-edit-form')
    if (profileEditForm) {
        profileEditForm.addEventListener('submit', (e) => {
            e.preventDefault()
            if (!currentUser) return

            currentUser.name = document.getElementById('profile-name-input').value.trim()
            currentUser.phone = document.getElementById('profile-phone-input').value.trim()
            currentUser.address = document.getElementById('profile-address-input').value.trim()

            localStorage.setItem('cs_current_user', JSON.stringify(currentUser))
            updateNavUserLabel()
            renderUserModalView()
            showToast('Profile updated successfully!')
        })
    }

    // Logout Handlers
    const logoutBtn = document.getElementById('logout-btn')
    const adminLogoutBtn = document.getElementById('admin-logout-btn')

    function handleLogout() {
        currentUser = null
        localStorage.removeItem('cs_current_user')
        updateNavUserLabel()
        renderUserModalView()
        showToast('Logged out successfully.')
    }

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout)
    if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', handleLogout)
}

// Render Appropriate Modal View (Login, Student Profile, or Admin Dashboard)
function renderUserModalView() {
    const loginView = document.getElementById('login-view')
    const profileView = document.getElementById('profile-view')
    const adminView = document.getElementById('admin-view')

    if (!loginView || !profileView || !adminView) return

    loginView.style.display = 'none'
    profileView.style.display = 'none'
    adminView.style.display = 'none'

    if (!currentUser) {
        loginView.style.display = 'block'
    } else if (currentUser.isAdmin) {
        adminView.style.display = 'block'
        renderAdminDashboard()
    } else {
        profileView.style.display = 'block'
        renderStudentProfile()
    }
}

// Render Student Profile Details & Their Listings
function renderStudentProfile() {
    if (!currentUser) return

    document.getElementById('profile-display-name').textContent = currentUser.name
    document.getElementById('profile-avatar-initials').textContent = (currentUser.name.charAt(0) || 'S').toUpperCase()
    document.getElementById('profile-user-id').textContent = `User ID: ${currentUser.id}`

    document.getElementById('profile-name-input').value = currentUser.name
    document.getElementById('profile-email-input').value = currentUser.email
    document.getElementById('profile-phone-input').value = currentUser.phone
    document.getElementById('profile-address-input').value = currentUser.address

    // Show listings submitted by this student email
    const container = document.getElementById('my-listings-container')
    if (!container) return

    const userListings = listingRequests.filter(req => req.email.toLowerCase() === currentUser.email.toLowerCase())

    if (userListings.length === 0) {
        container.innerHTML = '<p class="empty-state-text">You haven\'t submitted any listing requests yet. Use the "Has Item to List?" form on the homepage!</p>'
        return
    }

    container.innerHTML = ''
    userListings.forEach(item => {
        const row = document.createElement('div')
        row.className = 'user-listing-row'
        row.innerHTML = `
            <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/calculator.png'">
            <div class="user-listing-info">
                <h4>${item.title}</h4>
                <span>₹ ${item.price} • ${item.condition}</span>
            </div>
            <span class="status-badge ${item.status}">${item.status.toUpperCase()}</span>
        `
        container.appendChild(row)
    })
}

// Setup Has Item to List Form
function setupListingForm() {
    const form = document.getElementById('item-listing-form')
    const fileInput = document.getElementById('list-item-file')
    const imgUrlInput = document.getElementById('list-item-img-url')
    const fileChosenName = document.getElementById('file-chosen-name')

    // If file chosen locally, convert to base64 or display file name
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0]
            if (file) {
                fileChosenName.textContent = `Selected: ${file.name}`
                const reader = new FileReader()
                reader.onload = (event) => {
                    imgUrlInput.value = event.target.result
                }
                reader.readAsDataURL(file)
            }
        })
    }

    if (!form) return

    // Pre-fill user email/phone/address if logged in
    if (currentUser && !currentUser.isAdmin) {
        const emailEl = document.getElementById('list-user-email')
        const phoneEl = document.getElementById('list-user-phone')
        const addrEl = document.getElementById('list-user-address')
        if (emailEl) emailEl.value = currentUser.email
        if (phoneEl) phoneEl.value = currentUser.phone
        if (addrEl) addrEl.value = currentUser.address
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault()

        const name = document.getElementById('list-item-name').value.trim()
        const category = document.getElementById('list-item-category').value
        const price = parseFloat(document.getElementById('list-item-price').value)
        const condition = document.getElementById('list-item-condition').value
        const desc = document.getElementById('list-item-desc').value.trim()
        const image = imgUrlInput.value.trim() || 'assets/calculator.png'
        const email = document.getElementById('list-user-email').value.trim()
        const phone = document.getElementById('list-user-phone').value.trim()
        const address = document.getElementById('list-user-address').value.trim()

        const newRequest = {
            id: 'REQ-' + Math.floor(100 + Math.random() * 900),
            title: name,
            category: category,
            price: price,
            condition: condition,
            description: desc,
            image: image,
            email: email,
            phone: phone,
            address: address,
            status: 'pending',
            date: new Date().toLocaleDateString()
        }

        listingRequests.unshift(newRequest)
        localStorage.setItem('cs_listing_requests', JSON.stringify(listingRequests))

        form.reset()
        if (fileChosenName) fileChosenName.textContent = 'Default: assets/calculator.png (or pick custom file/URL)'
        imgUrlInput.value = 'assets/calculator.png'

        showToast('Request submitted! It will be listed once approved by admin.')
    })
}

// Switch Admin Dashboard Tabs
window.switchAdminTab = function(tabName) {
    activeAdminTab = tabName
    const reqTabBtn = document.getElementById('tab-requests-btn')
    const listTabBtn = document.getElementById('tab-listings-btn')
    const reqContent = document.getElementById('admin-requests-tab')
    const listContent = document.getElementById('admin-listings-tab')

    if (tabName === 'requests') {
        reqTabBtn.classList.add('active')
        listTabBtn.classList.remove('active')
        reqContent.style.display = 'block'
        listContent.style.display = 'none'
    } else {
        reqTabBtn.classList.remove('active')
        listTabBtn.classList.add('active')
        reqContent.style.display = 'none'
        listContent.style.display = 'block'
    }
    renderAdminDashboard()
}

// Render Admin Dashboard Lists (Requests & Active Listings)
function renderAdminDashboard() {
    const pendingRequests = listingRequests.filter(r => r.status === 'pending')
    const reqBadge = document.getElementById('admin-requests-badge')
    if (reqBadge) reqBadge.textContent = pendingRequests.length

    const liveItems = document.querySelectorAll('.food-item-wrap .food-item')
    const listBadge = document.getElementById('admin-listings-badge')
    if (listBadge) listBadge.textContent = liveItems.length

    // Render Requests Tab
    const reqContainer = document.getElementById('admin-requests-list')
    if (reqContainer) {
        if (pendingRequests.length === 0) {
            reqContainer.innerHTML = '<p class="empty-state-text">No pending listing requests at the moment.</p>'
        } else {
            reqContainer.innerHTML = ''
            pendingRequests.forEach(req => {
                const card = document.createElement('div')
                card.className = 'admin-card'
                card.innerHTML = `
                    <img src="${req.image}" alt="${req.title}" class="admin-card-img" onerror="this.src='assets/calculator.png'">
                    <div class="admin-card-body">
                        <div class="admin-card-header">
                            <h4>${req.title}</h4>
                            <span class="admin-card-price">₹ ${req.price}</span>
                        </div>
                        <div class="admin-meta-row">
                            <span class="product-modal-tag">${req.category.toUpperCase()}</span>
                            <span class="product-condition-badge">${req.condition}</span>
                        </div>
                        <p style="font-size: 0.88rem; color: #475569; margin-bottom: 0.4rem;">${req.description}</p>
                        <div class="admin-contact-info">
                            <div><i class='bx bx-user'></i> <strong>Seller:</strong> ${req.email} | <i class='bx bx-phone'></i> ${req.phone}</div>
                            <div><i class='bx bx-map-pin'></i> <strong>Handoff:</strong> ${req.address}</div>
                        </div>
                    </div>
                    <div class="admin-actions">
                        <button class="admin-btn admin-btn-approve" onclick="approveListingRequest('${req.id}')">
                            <i class='bx bx-check'></i> Approve
                        </button>
                        <button class="admin-btn admin-btn-deny" onclick="denyListingRequest('${req.id}')">
                            <i class='bx bx-x'></i> Deny
                        </button>
                    </div>
                `
                reqContainer.appendChild(card)
            })
        }
    }

    // Render Active Listings Tab
    const listContainer = document.getElementById('admin-listings-list')
    if (listContainer) {
        listContainer.innerHTML = ''
        liveItems.forEach((itemEl, idx) => {
            const data = getItemDataFromElement(itemEl, idx)
            const card = document.createElement('div')
            card.className = 'admin-card'
            card.innerHTML = `
                <img src="${data.image}" alt="${data.title}" class="admin-card-img" onerror="this.src='assets/calculator.png'">
                <div class="admin-card-body">
                    <div class="admin-card-header">
                        <h4>${data.title}</h4>
                        <span class="admin-card-price">₹ ${data.price}</span>
                    </div>
                    <div class="admin-meta-row">
                        <span class="product-modal-tag">${data.category}</span>
                        <span class="product-condition-badge">${data.condition.badge}</span>
                    </div>
                    <p style="font-size: 0.88rem; color: #475569;">${data.description}</p>
                </div>
                <div class="admin-actions">
                    <button class="admin-btn admin-btn-edit" onclick="openAdminEditItem(${idx})">
                        <i class='bx bx-edit'></i> Edit
                    </button>
                    <button class="admin-btn admin-btn-delete" onclick="removeLiveListing(${idx})">
                        <i class='bx bx-trash'></i> Remove
                    </button>
                </div>
            `
            listContainer.appendChild(card)
        })
    }
}

// Approve Listing Request -> Convert to live item on the website
window.approveListingRequest = function(requestId) {
    const req = listingRequests.find(r => r.id === requestId)
    if (!req) return

    req.status = 'approved'
    localStorage.setItem('cs_listing_requests', JSON.stringify(listingRequests))

    // Inject into the main catalog DOM
    const catalogContainer = document.querySelector('.food-item-wrap')
    if (catalogContainer) {
        const newItem = document.createElement('div')
        newItem.className = `food-item ${req.category}-type`
        newItem.setAttribute('data-condition', req.condition)
        newItem.setAttribute('data-category', req.category)
        newItem.setAttribute('data-desc', req.description)

        newItem.innerHTML = `
            <div class="item-wrap bottom-up play-on-scroll">
                <div class="item-img">
                    <div class="img-holder bg-img" style="background-image: url('${req.image}');"></div>
                </div>
                <div class="item-info">
                    <div>
                        <h3>${req.title}</h3>
                        <span>₹ ${req.price}</span>
                    </div>
                    <div class="cart-btn">
                        <i class="bx bx-cart-alt"></i>
                    </div>
                </div>
            </div>
        `
        catalogContainer.insertBefore(newItem, catalogContainer.firstChild)
        setupFoodItemInteractions()
        applyItemSearch()
    }

    renderAdminDashboard()
    showToast(`Approved "${req.title}"! It is now live in the catalog.`)
}

// Deny Listing Request
window.denyListingRequest = function(requestId) {
    const req = listingRequests.find(r => r.id === requestId)
    if (!req) return

    req.status = 'denied'
    localStorage.setItem('cs_listing_requests', JSON.stringify(listingRequests))
    renderAdminDashboard()
    showToast(`Denied listing request for "${req.title}".`)
}

// Remove Live Listing
window.removeLiveListing = function(index) {
    const liveItems = document.querySelectorAll('.food-item-wrap .food-item')
    if (liveItems[index]) {
        const title = liveItems[index].querySelector('.item-info h3').textContent
        liveItems[index].remove()
        setupFoodItemInteractions()
        renderAdminDashboard()
        showToast(`Removed "${title}" from the website.`)
    }
}

// Open Admin Edit Item Modal
let editingItemIndex = null
window.openAdminEditItem = function(index) {
    editingItemIndex = index
    const liveItems = document.querySelectorAll('.food-item-wrap .food-item')
    const itemEl = liveItems[index]
    if (!itemEl) return

    const data = getItemDataFromElement(itemEl, index)

    document.getElementById('edit-item-title').value = data.title
    document.getElementById('edit-item-price').value = data.price
    document.getElementById('edit-item-desc').value = data.description
    document.getElementById('edit-item-image').value = data.image

    // match category
    let catVal = 'tech'
    if (itemEl.classList.contains('books-type')) catVal = 'books'
    else if (itemEl.classList.contains('stationery-type')) catVal = 'stationery'
    else if (itemEl.classList.contains('cables-type')) catVal = 'cables'
    document.getElementById('edit-item-category').value = catVal

    document.getElementById('edit-item-condition').value = data.condition.label

    const overlay = document.getElementById('admin-edit-overlay')
    const modal = document.getElementById('admin-edit-modal')
    if (overlay && modal) {
        overlay.classList.add('active')
        modal.classList.add('active')
    }
}

function setupAdminEditModal() {
    const overlay = document.getElementById('admin-edit-overlay')
    const modal = document.getElementById('admin-edit-modal')
    const closeBtn = document.getElementById('close-admin-edit')
    const form = document.getElementById('admin-edit-form')

    function closeEdit() {
        if (overlay && modal) {
            overlay.classList.remove('active')
            modal.classList.remove('active')
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closeEdit)
    if (overlay) overlay.addEventListener('click', closeEdit)

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault()
            const liveItems = document.querySelectorAll('.food-item-wrap .food-item')
            const itemEl = liveItems[editingItemIndex]
            if (!itemEl) return

            const newTitle = document.getElementById('edit-item-title').value.trim()
            const newPrice = document.getElementById('edit-item-price').value.trim()
            const newCat = document.getElementById('edit-item-category').value
            const newCond = document.getElementById('edit-item-condition').value
            const newImg = document.getElementById('edit-item-image').value.trim()
            const newDesc = document.getElementById('edit-item-desc').value.trim()

            // Update item in DOM
            itemEl.className = `food-item ${newCat}-type`
            itemEl.setAttribute('data-condition', newCond)
            itemEl.setAttribute('data-category', newCat)
            itemEl.setAttribute('data-desc', newDesc)

            const titleEl = itemEl.querySelector('.item-info h3')
            const priceEl = itemEl.querySelector('.item-info span')
            const imgHolder = itemEl.querySelector('.img-holder')

            if (titleEl) titleEl.textContent = newTitle
            if (priceEl) priceEl.textContent = `₹ ${newPrice}`
            if (imgHolder) imgHolder.style.backgroundImage = `url('${newImg}')`

            closeEdit()
            renderAdminDashboard()
            showToast(`Updated "${newTitle}" successfully!`)
        })
    }
}