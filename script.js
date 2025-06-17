const supabaseUrl = 'https://dogqmxadstqpaacenrnb.supabase.co';
const supabaseKey = 'ISI_ANEK_YANG_AMAN';
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
