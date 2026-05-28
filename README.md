# @packages/components

Koleksi komponen Vue 3 reusable yang dipakai lintas aplikasi pada monorepo ini. Paket ini berisi komponen input/select, wrapper interaktif, dan feature component untuk status loading maupun notifikasi.

## Daftar Komponen

| Komponen | Lokasi | Fungsi |
|---|---|---|
| `BaseDialog` | `base/BaseDialog.vue` | Wrapper modal generik untuk util dialog |
| `BaseInput` | `base/BaseInput.vue` | Input teks dengan validasi, dukungan `money`, dan slot sisi kanan |
| `BaseLookup` | `base/BaseLookup.vue` | Select yang memuat opsi dari API |
| `BaseSelect` | `base/BaseSelect.vue` | Select statis berbasis array option |
| `SliderFeatures` | `base/SliderFeatures.vue` | Carousel sederhana untuk daftar subject |
| `SwitcherFeatures` | `base/SwitcherFeatures.vue` | Header switcher dengan tombol prev/next |
| `LoadingFeaures` | `features/LoadingFeaures.vue` | Overlay loading global |
| `NotificationFeature` | `features/NotificationFeature.vue` | Toast notifikasi sukses/gagal |

## Instalasi

```bash
pnpm install
```

Import stylesheet shared di entry aplikasi:

```js
import '@packages/components/styles/index.css'
```

## Konfigurasi

Contoh `tailwind.config.js` agar class di package ikut diproses:

```js
export default {
  content: [
    './**/*.{vue}',
    '../../apps/**/*.{vue,js,jsx,ts,tsx,html}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Dokumentasi Komponen

### BaseDialog

Komponen modal generik yang bisa dipakai dalam dua mode:

- Mode util: dipakai oleh `Dialog` util dengan prop `component`
- Mode komposisi: konten ditulis langsung via default slot

#### Props

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `dialog` | `Object \| null` | `null` | Instance `Dialog` untuk aksi `ok/close/dismiss` |
| `component` | `Object \| Function \| null` | `null` | Komponen isi dialog (`<component :is="..." />`) |
| `positionClass` | `String` | `'items-center'` | Class posisi vertikal modal |
| `okButton` | `Object \| null` | `null` | Konfigurasi tombol OK |
| `closeButton` | `Object \| null` | `null` | Konfigurasi tombol Close |

#### Slot

| Slot | Keterangan |
|---|---|
| default | Konten dialog saat tidak menggunakan prop `component` |
| `footer` | Override area tombol footer |

Slot props yang tersedia:

- `dialog`
- `setDialogData(payload)`
- `ok(payload)`
- `close(payload)`
- `okButton`
- `closeButton`

#### Event

Saat `dialog` tidak diberikan, komponen akan emit event berikut:

- `ok`
- `close`
- `dismiss`
- `dialog-update`

#### Event dari komponen isi (mode util)

`BaseDialog` mendengarkan event dari komponen isi dialog:

- `dialog-update`
- `dialog-ok`
- `dialog-close`

#### Contoh mode slot

```vue
<BaseDialog
  :position-class="'items-center'"
  :ok-button="{ label: 'Save', value: true }"
  :close-button="{ label: 'Cancel', value: false }"
  @ok="onSave"
  @close="onCancel"
>
  <template #default="{ setDialogData }">
    <h3 class="text-lg font-semibold">Example Dialog</h3>
    <p class="mt-2 text-sm text-slate-600">Isi dialog bisa disusun langsung pakai slot.</p>
    <input
      class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
      @input="setDialogData($event.target.value)"
    />
  </template>
</BaseDialog>
```

### BaseInput

Input form generik dengan dukungan `v-model`, validasi internal, validasi eksternal lewat prop `error`, dan format tampilan khusus saat `type="money"`.

#### Props

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `modelValue` | `String \| Number` | `''` | Nilai yang diikat dengan `v-model` |
| `label` | `String` | `undefined` | Label field |
| `type` | `String` | `'text'` | Mendukung tipe standar HTML plus `'money'` |
| `placeholder` | `String` | `undefined` | Placeholder input |
| `error` | `String` | `''` | Pesan error dari parent |
| `inputClass` | `String` | `'base-input__control'` | Class untuk elemen input |
| `wrapperClass` | `String` | `'base-input'` | Class wrapper utama |
| `labelClass` | `String` | `'base-input__label'` | Class label |
| `fieldWrapperClass` | `String` | `'base-input__field'` | Class pembungkus input |
| `errorClass` | `String` | `'base-input__error'` | Class pesan error |
| `inputErrorClass` | `String` | `'base-input__control--error'` | Class input saat invalid |
| `rightSlotClass` | `String` | `''` | Class wrapper slot kanan |
| `required` | `Boolean` | `false` | Mengaktifkan validasi wajib isi |
| `validate` | `Array \| null` | `null` | Format `[message, validatorFn]` |
| `validator` | `Function` | `undefined` | Validator lanjutan, boleh return `string` atau `false` |

#### Event

| Event | Payload |
|---|---|
| `update:modelValue` | Nilai input terbaru |

#### Slot

| Slot | Fungsi |
|---|---|
| `right` | Konten tambahan di sisi kanan input |

#### Catatan

- Saat `type="money"`, nilai yang di-emits berupa digit mentah tanpa pemisah ribuan.
- Validasi internal baru ditampilkan setelah field disentuh atau saat prop `error` diisi.

#### Contoh

```vue
<script setup>
import { ref } from 'vue'
import BaseInput from '@packages/components/base/BaseInput.vue'

const amount = ref('150000')
</script>

<template>
  <BaseInput
    v-model="amount"
    type="money"
    label="Nominal"
    placeholder="0"
    :validate="['Nominal wajib diisi', (value) => Number(value) > 0]"
    required
  />
</template>
```

### BaseLookup

Komponen select dinamis yang memuat daftar opsi dari endpoint API. Komponen ini mendukung auth header, filter query, validasi, dan notifikasi error request.

#### Props

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `modelValue` | `String \| Number` | `''` | Nilai aktif |
| `label` | `String` | `''` | Label select |
| `wrapperClass` | `String` | `'base-lookup'` | Class wrapper |
| `labelClass` | `String` | `'base-lookup__label'` | Class label |
| `selectClass` | `String` | `'base-lookup__select'` | Class elemen select |
| `errorClass` | `String` | `'base-lookup__error'` | Class teks error |
| `selectErrorClass` | `String` | `'base-lookup__select--error'` | Class select saat error |
| `required` | `Boolean` | `false` | Validasi wajib isi |
| `validate` | `Array \| null` | `null` | Format `[message, validatorFn]` |
| `validator` | `Function` | `undefined` | Validator tambahan |
| `error` | `String` | `''` | Error dari parent |
| `placeholder` | `String` | `'-- Pilih --'` | Opsi kosong awal |
| `route` | `String` | wajib | Endpoint pengambilan data |
| `itemKey` | `String` | `'id'` | Field sumber value option |
| `display` | `String` | `'name'` | Field sumber label option |
| `auth` | `Boolean` | `false` | Menambahkan bearer token dari `localStorage.access_token` |
| `filter` | `Array` | `[]` | Di-serialize ke query `filter` |

#### Event

| Event | Payload |
|---|---|
| `update:modelValue` | Value terpilih |
| `loaded` | Array item hasil request |
| `error` | Pesan error request |

#### Perilaku Penting

- Request hanya dijalankan sekali per kombinasi `route` dan `filter`, lalu akan di-refresh saat salah satunya berubah.
- Placeholder berubah menjadi `Memuat data...` saat request berlangsung.
- Error fetch akan ditampilkan di bawah select dan juga di-emit ke parent.

### BaseSelect

Select statis berbasis array option. Cocok untuk enum sederhana tanpa fetch.

#### Props

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `modelValue` | `String \| Number` | `''` | Nilai aktif |
| `label` | `String` | `''` | Label field |
| `wrapperClass` | `String` | `'base-select'` | Class wrapper |
| `labelClass` | `String` | `'base-select__label'` | Class label |
| `selectClass` | `String` | `'base-select__control'` | Class select |
| `errorClass` | `String` | `'base-select__error'` | Class teks error |
| `selectErrorClass` | `String` | `'base-select__control--error'` | Class select saat invalid |
| `placeholder` | `String` | `'-- Pilih --'` | Opsi kosong pertama |
| `required` | `Boolean` | `false` | Validasi wajib isi |
| `validate` | `Array \| null` | `null` | Format `[message, validatorFn]` |
| `validator` | `Function` | `undefined` | Validator tambahan |
| `error` | `String` | `''` | Error dari parent |
| `options` | `Array` | `[]` | Format item `{ label, value }` |

#### Event

| Event | Payload |
|---|---|
| `update:modelValue` | Value terpilih |

### SliderFeatures

Carousel presentasi dengan judul, subtitle, autoplay, tombol navigasi, dan indikator dot.

#### Props

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `title` | `String` | `''` | Judul section |
| `subtitle` | `String` | `''` | Subjudul section |
| `autoPlayInterval` | `Number` | `5000` | Interval autoplay dalam milidetik, `0` untuk mematikan |
| `subjects` | `Array` | wajib | Daftar slide, minimal berisi `id`, `title`, `description`, opsional `image` |

#### Perilaku Penting

- `nextSlide` dan `prevSlide` melakukan looping otomatis di awal/akhir daftar.
- Interval autoplay akan dibersihkan saat komponen di-unmount.

### SwitcherFeatures

Wrapper kecil untuk kontrol prev/next dengan slot konten di tengah. Cocok untuk switch bulan, range waktu, atau context carousel lain.

#### Props

| Prop | Tipe | Default |
|---|---|---|
| `label` | `String` | wajib |
| `rootClass` | `String` | `''` |
| `contentClass` | `String` | `''` |
| `slotClass` | `String` | `''` |
| `labelClass` | `String` | `''` |
| `prevButtonClass` | `String` | `''` |
| `nextButtonClass` | `String` | `''` |

#### Event

| Event | Payload |
|---|---|
| `prev` | Tidak ada |
| `next` | Tidak ada |

### LoadingFeaures

Overlay loading global yang dapat dipakai langsung sebagai komponen atau dikendalikan lewat instance `Loading` dari package util.

#### Props

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `show` | `Boolean` | `false` | Menampilkan overlay |
| `label` | `String` | `'Loading...'` | Teks yang ditampilkan |
| `loading` | `Object \| null` | `null` | Objek reactive dari util `Loading` |

#### Perilaku Penting

- Jika prop `loading` diberikan, komponen membaca `loading.show.value` dan `loading.label.value`.
- Jika tidak, komponen memakai prop biasa `show` dan `label`.

### NotificationFeature

Toast notifikasi untuk status `success` dan `error`. Bisa dipakai langsung sebagai komponen atau melalui util `Notification`.

#### Props

| Prop | Tipe | Default | Keterangan |
|---|---|---|---|
| `message` | `String` | `''` | Isi pesan notifikasi |
| `type` | `String` | `'success'` | Tipe visual notifikasi |
| `duration` | `Number` | `2000` | Durasi tampil dalam milidetik |
| `notification` | `Object \| null` | `null` | Objek reactive dari util `Notification` |

#### Event

| Event | Payload |
|---|---|
| `close` | Tidak ada |

#### Perilaku Penting

- Jika prop `notification` diberikan, komponen membaca dan memutasi `notification.show.value` secara langsung.
- Timer auto close akan di-reset saat pesan baru masuk.

## Lisensi

ISC

