# @packages/components

Koleksi komponen Vue 3 yang dapat digunakan kembali (reusable) untuk proyek Vue.js dengan dukungan Tailwind CSS.

## Daftar Isi

- [BaseInput](#baseinput)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)

---

## BaseInput

Komponen input form yang mendukung `v-model`, validasi error, kustomisasi kelas, dan slot untuk tombol/icon di sisi kanan.

### Fitur

- ✅ Dukungan `v-model` untuk two-way binding
- ✅ Label opsional dengan styling yang konsisten
- ✅ State error dengan styling otomatis (warna merah)
- ✅ Kustomisasi kelas CSS melalui props `inputClass`
- ✅ Slot untuk menempatkan tombol/icon di sisi kanan input
- ✅ Dukungan berbagai tipe input (text, password, email, number, dll)
- ✅ Styling responsif dengan Tailwind CSS

### Props

| Prop | Tipe | Default | Deskripsi |
|------|------|---------|-----------|
| `modelValue` | `String \| Number` | `''` | Nilai input (digunakan dengan v-model) |
| `label` | `String` | - | Label untuk input field |
| `type` | `String` | `'text'` | Tipe input (text, password, email, number, dll) |
| `placeholder` | `String` | - | Placeholder text |
| `error` | `String` | - | Pesan error yang akan ditampilkan |
| `inputClass` | `String` | '' | Kelas CSS tambahan untuk kustomisasi |

### Events

| Event | Payload | Deskripsi |
|-------|---------|-----------|
| `update:modelValue` | `String \| Number` | Dipicu saat nilai input berubah |

### Slots

| Slot | Deskripsi |
|------|-----------|
| `right` | Konten yang ditempatkan di sisi kanan input (contoh: tombol, icon) |

### Contoh Penggunaan

#### Penggunaan Dasar

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@packages/components/base/BaseInput.vue'

const username = ref('')
</script>

<template>
  <BaseInput
    v-model="username"
    label="Username"
    placeholder="Masukkan username"
  />
</template>
```

#### Dengan Tipe Input Berbeda

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@packages/components/base/BaseInput.vue'

const email = ref('')
const password = ref('')
const phone = ref('')
</script>

<template>
  <!-- Email Input -->
  <BaseInput
    v-model="email"
    type="email"
    label="Email"
    placeholder="email@example.com"
  />

  <!-- Password Input -->
  <BaseInput
    v-model="password"
    type="password"
    label="Password"
    placeholder="Masukkan password"
  />

  <!-- Number Input -->
  <BaseInput
    v-model="phone"
    type="number"
    label="Telepon"
    placeholder="081234567890"
  />
</template>
```

#### Dengan State Error

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@packages/components/base/BaseInput.vue'

const email = ref('')
const emailError = ref('')

const validateEmail = () => {
  if (!email.value.includes('@')) {
    emailError.value = 'Email tidak valid'
  } else {
    emailError.value = ''
  }
}
</script>

<template>
  <BaseInput
    v-model="email"
    type="email"
    label="Email"
    placeholder="email@example.com"
    :error="emailError"
  />
</template>
```

#### Dengan Slot Kanan (Tombol/Icon)

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@packages/components/base/BaseInput.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const password = ref('')
const showPassword = ref(false)
</script>

<template>
  <BaseInput
    v-model="password"
    :type="showPassword ? 'text' : 'password'"
    label="Password"
    placeholder="Masukkan password"
  >
    <template #right>
      <button
        @click="showPassword = !showPassword"
        class="text-slate-500 hover:text-slate-700"
      >
        <EyeIcon v-if="!showPassword" class="w-5 h-5" />
        <EyeSlashIcon v-else class="w-5 h-5" />
      </button>
    </template>
  </BaseInput>
</template>
```

#### Dengan Kustomisasi CSS

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@packages/components/base/BaseInput.vue'

const searchQuery = ref('')
</script>

<template>
  <BaseInput
    v-model="searchQuery"
    placeholder="Cari..."
    input-class="bg-slate-50 border-slate-200 focus:bg-white"
  />
</template>
```

#### Contoh Form Lengkap

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@packages/components/base/BaseInput.vue'

const form = ref({
  name: '',
  email: '',
  phone: ''
})

const errors = ref({
  name: '',
  email: '',
  phone: ''
})

const validate = () => {
  errors.value.name = form.value.name ? '' : 'Nama wajib diisi'
  errors.value.email = form.value.email.includes('@') ? '' : 'Email tidak valid'
  errors.value.phone = form.value.phone.length > 9 ? '' : 'Nomor telepon minimal 10 digit'
}

const submit = () => {
  validate()
  if (!errors.value.name && !errors.value.email && !errors.value.phone) {
    console.log('Form submitted:', form.value)
  }
}
</script>

<template>
  <form @submit.prevent="submit" class="space-y-4 max-w-md mx-auto p-6">
    <BaseInput
      v-model="form.name"
      label="Nama Lengkap"
      placeholder="John Doe"
      :error="errors.name"
    />

    <BaseInput
      v-model="form.email"
      type="email"
      label="Email"
      placeholder="john@example.com"
      :error="errors.email"
    />

    <BaseInput
      v-model="form.phone"
      type="number"
      label="Telepon"
      placeholder="081234567890"
      :error="errors.phone"
    />

    <button
      type="submit"
      class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
    >
      Daftar
    </button>
  </form>
</template>
```

---

## Instalasi

Pastikan semua dependencies sudah terinstal:

```bash
pnpm install
```

---

## Konfigurasi

### Tailwind CSS

Pastikan `tailwind.config.js` sudah dikonfigurasi untuk mencakup path ke komponen:

```javascript
export default {
  content: [
    "./**/*.{vue}",
    "../../apps/**/*.{vue,js,jsx,ts,tsx,html}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### PostCSS

Pastikan `postcss.config.js` sudah mengkonfigurasi tailwindcss dan autoprefixer:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Styles

Import styles di main entry file aplikasi Anda:

```javascript
// Di main.js atau main.ts
import '@packages/components/styles/index.css'
```

---

## Lisensi

ISC

