<?php
require __DIR__ . '/vendor/autoload.php';
use Supabase\Postgrest\PostgrestClient;

// Initialize Supabase
$supabaseUrl = 'https://dogqmxadstqpaacenrnb.supabase.co';
$supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZ3FteGFkc3RxcGFhY2Vucm5iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEyNDI4NSwiZXhwIjoyMDY1NzAwMjg1fQ.fCJe2Y_im5YZNlic5TIFv6RkP-g6pcwgSwPgzbhkUv8';
$supabase = new PostgrestClient($supabaseUrl, $supabaseKey);

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $tanggal = $_POST['tanggal'] ?? '';
    $no_surat_jalan = $_POST['no_surat_jalan'] ?? '';
    $no_sphp = $_POST['no_sphp'] ?? '';
    $artikel = $_POST['artikel'] ?? '';
    $jumlah = intval($_POST['jumlah'] ?? 0);
    $tujuan = $_POST['tujuan'] ?? '';

    if (empty($tanggal) || empty($no_surat_jalan) || empty($no_sphp) || empty($artikel) || $jumlah <= 0 || empty($tujuan)) {
        echo "<script>alert('All fields are required!');</script>";
    } else {
        try {
            $response = $supabase->from('pengiriman')->insert([
                'tanggal_pengiriman' => $tanggal,
                'no_surat_jalan' => $no_surat_jalan,
                'no_sphp' => $no_sphp,
                'artikel' => $artikel,
                'jumlah' => $jumlah,
                'tujuan' => $tujuan
            ])->execute();

            echo "<script>
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Shipping data saved successfully',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        window.location.reload();
                    });
                  </script>";
        } catch (Exception $e) {
            echo "<script>
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: 'Failed to save data: " . addslashes($e->getMessage()) . "'
                    });
                  </script>";
        }
    }
}

require_once "access_control.php";

// Fetch shipping data
try {
    $response = $supabase->from('pengiriman')
                         ->select('*')
                         ->order('tanggal_pengiriman', ['ascending' => false])
                         ->execute();
    $data_pengiriman = $response->data;
    
    // Calculate summary stats
    $totalShipments = count($data_pengiriman);
    $todayShipments = count(array_filter($data_pengiriman, fn($item) => $item['tanggal_pengiriman'] == date('Y-m-d')));
    $totalItems = array_sum(array_column($data_pengiriman, 'jumlah'));
    $uniqueDestinations = count(array_unique(array_column($data_pengiriman, 'tujuan')));
} catch (Exception $e) {
    $data_pengiriman = [];
    $totalShipments = $todayShipments = $totalItems = $uniqueDestinations = 0;
    error_log("Supabase error: " . $e->getMessage());
}

require_once "pengirimann_view.php";
?>
