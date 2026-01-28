<script setup>
import { ref, computed } from 'vue'
import { menuItems, categories } from '../utils/menuData.js'

// State
const activeCategory = ref('semua')
const orderItems = ref([])
const invoiceNumber = ref('')
const showInvoiceModal = ref(false)
const invoiceData = ref(null)
const customerName = ref('')
const paymentAmount = ref('')

// Filter menu items by category
const filteredMenuItems = computed(() => {
  if (activeCategory.value === 'semua') {
    return menuItems
  }
  return menuItems.filter(item => item.category === activeCategory.value)
})

// Calculate total price
const totalPrice = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

// Calculate change
const changeAmount = computed(() => {
  const payment = parseFloat(paymentAmount.value) || 0
  return payment - totalPrice.value
})

// Add item to order
const addToOrder = (menuItem) => {
  const existingItem = orderItems.value.find(item => item.id === menuItem.id)
  if (existingItem) {
    existingItem.quantity++
  } else {
    orderItems.value.push({ ...menuItem, quantity: 1 })
  }
}

// Remove item from order
const removeFromOrder = (itemId) => {
  const index = orderItems.value.findIndex(item => item.id === itemId)
  if (index > -1) {
    orderItems.value.splice(index, 1)
  }
}

// Update quantity
const updateQuantity = (itemId, delta) => {
  const item = orderItems.value.find(item => item.id === itemId)
  if (item) {
    item.quantity += delta
    if (item.quantity <= 0) {
      removeFromOrder(itemId)
    }
  }
}

// Generate invoice
const createInvoice = () => {
  if (orderItems.value.length === 0) {
    alert('Pesanan masih kosong!')
    return
  }
  const now = new Date()
  invoiceNumber.value = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  invoiceData.value = {
    invoiceNumber: invoiceNumber.value,
    date: now.toLocaleString('id-ID'),
    customerName: customerName.value || 'Umum',
    items: [...orderItems.value],
    totalPrice: totalPrice.value,
    payment: parseFloat(paymentAmount.value) || 0,
    change: changeAmount.value
  }
  showInvoiceModal.value = true
}

// Print invoice
const printInvoice = () => {
  window.print()
}

// Clear order
const clearOrder = () => {
  if (confirm('Apakah Anda yakin ingin membatalkan pesanan?')) {
    orderItems.value = []
    customerName.value = ''
    paymentAmount.value = ''
  }
}

// Close modal
const closeModal = () => {
  showInvoiceModal.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 shadow-soft sticky top-0 z-40">
      <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <span class="text-xl">🏪</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-slate-800">Kasir POS System</h1>
              <p class="text-xs text-slate-500">Modern Point of Sale</p>
            </div>
          </div>
          <div class="hidden sm:block">
            <div class="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-sm font-medium text-slate-600">
                {{ new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex h-[calc(100vh-64px)]">
      <!-- Left Panel: Menu Items -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="p-4 sm:p-6 overflow-y-auto flex-1">
          <!-- Category Filter -->
          <div class="mb-6 flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="activeCategory = category.id"
              :class="[
                'btn text-sm transition-all duration-200',
                activeCategory === category.id ? 'btn-primary shadow-sm' : 'btn-secondary'
              ]"
            >
              {{ category.name }}
            </button>
          </div>

          <!-- Section Title -->
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-700">Menu Items</h2>
            <span class="badge badge-primary">{{ filteredMenuItems.length }} items</span>
          </div>

          <!-- Menu Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <button
              v-for="item in filteredMenuItems"
              :key="item.id"
              @click="addToOrder(item)"
              class="card-hover group text-left p-4 animate-fade-in"
            >
              <div class="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-xl bg-slate-50 group-hover:bg-primary-50 transition-colors duration-300">
                <span class="text-3xl">{{ item.image }}</span>
              </div>
              <h3 class="font-semibold text-slate-800 text-center group-hover:text-primary-600 transition-colors duration-200">
                {{ item.name }}
              </h3>
              <p class="text-center text-primary-600 font-bold mt-1">
                Rp {{ item.price.toLocaleString('id-ID') }}
              </p>
              <div class="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
                <span class="capitalize bg-slate-100 px-2 py-1 rounded-full group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors duration-200">
                  {{ item.category }}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Panel: Order Summary -->
      <div class="w-full max-w-md bg-white border-l border-slate-200 shadow-card flex flex-col">
        <!-- Order Header -->
        <div class="p-4 border-b border-slate-100 bg-slate-50/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <span class="text-lg">📋</span>
              </div>
              <h2 class="text-lg font-bold text-slate-800">Pesanan</h2>
            </div>
            <span class="badge badge-primary">{{ orderItems.length }} item(s)</span>
          </div>
        </div>

        <!-- Customer Name Input -->
        <div class="p-4 border-b border-slate-100">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">Nama Pelanggan</label>
          <input v-model="customerName" type="text" placeholder="Contoh: Budi, Andi, ..." class="input-field" />
        </div>

        <!-- Order Items List -->
        <div class="flex-1 overflow-y-auto p-4">
          <div v-if="orderItems.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <div class="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span class="text-4xl">🛒</span>
            </div>
            <p class="text-slate-500 font-medium">Belum ada pesanan</p>
            <p class="text-sm text-slate-400 mt-1">Klik menu di sebelah kiri untuk menambahkan</p>
          </div>

          <div v-else class="space-y-3">
            <div v-for="item in orderItems" :key="item.id" class="card p-3 animate-slide-up">
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">{{ item.image }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-semibold text-slate-800 truncate">{{ item.name }}</h4>
                  <p class="text-sm text-primary-600 font-medium">Rp {{ item.price.toLocaleString('id-ID') }}</p>
                </div>
                <button @click="removeFromOrder(item.id)" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors duration-200" title="Hapus">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <button @click="updateQuantity(item.id, -1)" class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="w-10 text-center font-bold text-slate-700">{{ item.quantity }}</span>
                  <button @click="updateQuantity(item.id, 1)" class="w-8 h-8 rounded-lg bg-primary-100 hover:bg-primary-200 text-primary-600 flex items-center justify-center transition-colors duration-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                <div class="text-right">
                  <p class="font-bold text-slate-800">Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Footer -->
        <div class="border-t border-slate-100 bg-slate-50/50 p-4 space-y-4">
          <!-- Payment Input -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">Jumlah Bayar</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
              <input v-model="paymentAmount" type="number" placeholder="0" class="input-field pl-12" />
            </div>
          </div>

          <!-- Total -->
          <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
            <span class="text-sm font-medium text-slate-600">Total</span>
            <span class="text-xl font-bold text-primary-600">Rp {{ totalPrice.toLocaleString('id-ID') }}</span>
          </div>

          <!-- Change Display -->
          <div v-if="paymentAmount && parseFloat(paymentAmount) >= totalPrice" class="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100 animate-fade-in">
            <span class="text-sm font-medium text-emerald-700">Kembalian</span>
            <span class="font-bold text-emerald-600">Rp {{ changeAmount.toLocaleString('id-ID') }}</span>
          </div>

          <!-- Action Buttons -->
          <div class="grid grid-cols-2 gap-3">
            <button @click="clearOrder" class="btn btn-danger" :disabled="orderItems.length === 0">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Batal
            </button>
            <button @click="createInvoice" class="btn btn-primary shadow-lg hover:shadow-xl" :disabled="orderItems.length === 0">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Buat Invoice
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Invoice Modal -->
    <div v-if="showInvoiceModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <!-- Invoice Header -->
        <div class="p-6 border-b border-slate-100 text-center bg-slate-50/50">
          <div class="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">🧾</span>
          </div>
          <h2 class="text-2xl font-bold text-slate-800">INVOICE</h2>
          <p class="text-slate-500 text-sm mt-1">{{ invoiceData?.invoiceNumber }}</p>
        </div>

        <!-- Invoice Content -->
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-slate-400 block text-xs">Tanggal</span>
              <span class="font-medium text-slate-700">{{ invoiceData?.date }}</span>
            </div>
            <div>
              <span class="text-slate-400 block text-xs">Pelanggan</span>
              <span class="font-medium text-slate-700">{{ invoiceData?.customerName }}</span>
            </div>
          </div>

          <hr class="border-slate-100" />

          <!-- Items -->
          <div class="space-y-3">
            <div v-for="item in invoiceData?.items" :key="item.id" class="flex justify-between items-start text-sm">
              <div class="flex-1 pr-4">
                <span class="font-medium text-slate-700">{{ item.name }}</span>
                <span class="text-slate-400 ml-2">x{{ item.quantity }}</span>
              </div>
              <span class="font-semibold text-slate-800 whitespace-nowrap">Rp {{ (item.price * item.quantity).toLocaleString('id-ID') }}</span>
            </div>
          </div>

          <hr class="border-slate-100" />

          <!-- Total -->
          <div class="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-100">
            <span class="text-lg font-bold text-slate-800">TOTAL</span>
            <span class="text-xl font-bold text-primary-600">Rp {{ invoiceData?.totalPrice.toLocaleString('id-ID') }}</span>
          </div>

          <!-- Payment Info -->
          <div v-if="invoiceData?.payment > 0" class="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-100">
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Bayar</span>
              <span class="font-medium text-slate-700">Rp {{ invoiceData?.payment.toLocaleString('id-ID') }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-slate-500">Kembalian</span>
              <span class="font-bold text-emerald-600">Rp {{ invoiceData?.change.toLocaleString('id-ID') }}</span>
            </div>
          </div>
        </div>

        <!-- Invoice Footer -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <button @click="closeModal" class="btn btn-secondary flex-1">Tutup</button>
          <button @click="printInvoice" class="btn btn-primary flex-1 shadow-lg">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

