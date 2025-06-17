const supabaseUrl = 'https://dogqmxadstqpaacenrnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZ3FteGFkc3RxcGFhY2Vucm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjQyODUsImV4cCI6MjA2NTcwMDI4NX0.pNf4kLpFaPUks2sTegXV12a61OigTYCuw_AGn0ISjwM';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('shippingForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const tanggal = document.getElementById('tanggal').value;
  const no_surat_jalan = document.getElementById('no_surat_jalan').value;
  const no_sphp = document.getElementById('no_sphp').value;
  const artikel = document.getElementById('artikel').value;
  const jumlah = parseInt(document.getElementById('jumlah').value);
  const tujuan = document.getElementById('tujuan').value;

  const { error } = await supabase.from('pengiriman').insert([
    {
      tanggal_pengiriman: tanggal,
      no_surat_jalan,
      no_sphp,
      artikel,
      jumlah,
      tujuan
    }
  ]);

  if (error) {
    alert('Gagal menyimpan: ' + error.message);
  } else {
    alert('Data berhasil disimpan!');
    document.getElementById('shippingForm').reset();
  }
});
