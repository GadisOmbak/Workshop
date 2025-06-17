<?php
// Koneksi ke database
$koneksi = new mysqli("localhost", "root", "", "db_sam");
if ($koneksi->connect_error) {
    die("Koneksi gagal: " . $koneksi->connect_error);
}

// Bagian pemrosesan form jika ada POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validate and sanitize all inputs
    $tanggal = isset($_POST['tanggal']) ? $koneksi->real_escape_string($_POST['tanggal']) : '';
    $no_surat_jalan = isset($_POST['no_surat_jalan']) ? $koneksi->real_escape_string($_POST['no_surat_jalan']) : '';
    $no_sphp = isset($_POST['no_sphp']) ? $koneksi->real_escape_string($_POST['no_sphp']) : '';
    $artikel = isset($_POST['artikel']) ? $koneksi->real_escape_string($_POST['artikel']) : '';
    $jumlah = isset($_POST['jumlah']) ? intval($_POST['jumlah']) : 0;
    $tujuan = isset($_POST['tujuan']) ? $koneksi->real_escape_string($_POST['tujuan']) : '';

    // Validate all required fields are filled
    if (empty($tanggal) || empty($no_surat_jalan) || empty($no_sphp) || empty($artikel) || $jumlah <= 0 || empty($tujuan)) {
        echo "<script>alert('Semua field harus diisi!');</script>";
    } else {
        $query = "INSERT INTO pengiriman (tanggal_pengiriman, no_surat_jalan, no_sphp, artikel, jumlah, tujuan) 
                  VALUES ('$tanggal', '$no_surat_jalan', '$no_sphp', '$artikel', '$jumlah', '$tujuan')";

        if ($koneksi->query($query) === TRUE) {
            echo "<script>
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Data pengiriman berhasil disimpan',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.reload();
                    });
                  </script>";
        } else {
            echo "<script>
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal!',
                        text: 'Terjadi kesalahan: " . addslashes($koneksi->error) . "'
                    });
                  </script>";
        }
    }
}

require_once "access_control.php";
// Ambil semua data pengiriman untuk ditampilkan
$data_pengiriman = $koneksi->query("SELECT * FROM pengiriman ORDER BY tanggal_pengiriman DESC");

// Include the view file
require_once "pengirimann_view.php";
?>