# Developer Documentation

Welcome to the developer documentation for this project.

## Architecture & Component Guidelines

Kami membedakan dua jenis komponen utama untuk menjaga struktur dan penggunaan tetap bersih:

### 1. Base Components
**Lokasi**: `packages/components/base/`
**Penamaan**: Gunakan awalan `Base` (contoh: `BaseInput.vue`)

Base component adalah komponen UI standar yang sangat direkomendasikan untuk membungkus kemampuan tambahan atau *smart defaults* bawaan jika memungkinkan. Tujuannya adalah mempermudah penggunaan tanpa harus mengatur konfigurasi berulang-ulang.
**Contoh**: `BaseInput.vue` pada `type="number"` atau `type="money"` sudah diatur agar otomatis menampilkan *keyboard layout* khusus angka di perangkat mobile.

### 2. Feature Components
**Lokasi**: 
- File UI (Vue): `packages/components/features/`
- Pembungkus logika (JS): `packages/utils/`
**Penamaan**: Gunakan akhiran `Feature` pada file Vue (contoh: `LoadingFeature.vue`)

Feature component ditujukan khusus untuk mempermudah penggunaan fungsionalitas UI yang biasanya membutuhkan manajemen *state* (misal: modal, loading, notifikasi, form). 
Komponen jenis ini dapat dipanggil secara imperatif melalui JavaScript/Event Handler untuk menghindari polusi template di mana kita harus mendeklarasikan terlalu banyak variabel (model/state) hanya untuk memicu satu komponen berjalan.
**Contoh**:
1. `Loading.js` (`packages/utils/Loading.js`). Untuk menjalankan *loading indicator*, kita cukup memanggil `new Loading().start()` di JavaScript tanpa perlu menaruh `<Loading v-model="isLoading" />` di template.
2. `FormFeatures.vue` (`packages/components/features/FormFeatures.vue`). Komponen form yang terintegrasi secara otomatis dengan `BaseButton` (`type="submit"`). Saat submit dipanggil, `event.loading.start()` dan `event.loading.stop()` dapat dijalankan secara imperatif di fungsi handler tanpa perlu meneruskan prop `:loading` manual ke `BaseButton`.

