// Initialize Supabase client
const supabaseUrl = 'https://dogqmxadstqpaacenrnb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvZ3FteGFkc3RxcGFhY2Vucm5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMjQyODUsImV4cCI6MjA2NTcwMDI4NX0.pNf4kLpFaPUks2sTegXV12a61OigTYCuw_AGn0ISjwM';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initDate();
    initSelect2();
    initDataTable();
    loadShippingData();
    setupRealtimeUpdates();
    
    // Form submission
    document.getElementById('shippingForm').addEventListener('submit', handleFormSubmit);
    
    // Button events
    document.getElementById('clearForm').addEventListener('click', clearForm);
    document.getElementById('refreshTable').addEventListener('click', refreshTable);
    document.getElementById('exportExcel').addEventListener('click', exportExcel);
});

// Initialize current date
function initDate() {
    const now = new Date();
    document.getElementById('currentDate').textContent = formatDate(now);
    document.getElementById('currentYear').textContent = now.getFullYear();
    document.getElementById('tanggal').valueAsDate = now;
}

// Format date as "01 January 2023"
function formatDate(date) {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Initialize Select2
function initSelect2() {
    $('.select2').select2({
        placeholder: "-- Select Destination --",
        allowClear: true
    });
}

// Initialize DataTable
function initDataTable() {
    $('#dataTable').DataTable({
        order: [[0, 'desc']],
        responsive: true,
        language: {
            lengthMenu: "Show _MENU_ entries per page",
            zeroRecords: "No shipping records found",
            info: "Showing _START_ to _END_ of _TOTAL_ entries",
            infoEmpty: "No records available",
            infoFiltered: "(filtered from _MAX_ total entries)",
            search: "Search:",
            paginate: {
                first: "First",
                last: "Last",
                next: "Next",
                previous: "Previous"
            }
        }
    });
}

// Load shipping data from Supabase
async function loadShippingData() {
    try {
        // Show loading state
        $('#shippingTableBody').html('<tr><td colspan="7" class="text-center py-4"><div class="spinner-border text-primary" role="status"></div></td></tr>');
        
        // Fetch data from Supabase
        const { data: pengiriman, error } = await supabase
            .from('pengiriman')
            .select('*')
            .order('tanggal_pengiriman', { ascending: false });
        
        if (error) throw error;
        
        // Update summary cards
        updateSummaryCards(pengiriman);
        
        // Populate table
        populateShippingTable(pengiriman);
        
    } catch (error) {
        console.error('Error loading shipping data:', error);
        Swal.fire('Error!', 'Failed to load shipping data', 'error');
    }
}

// Update summary cards
function updateSummaryCards(data) {
    const today = new Date().toISOString().split('T')[0];
    
    // Total shipments
    document.getElementById('totalShipments').textContent = data.length;
    
    // Today's shipments
    const todayShipments = data.filter(item => 
        item.tanggal_pengiriman === today
    ).length;
    document.getElementById('todayShipments').textContent = todayShipments;
    
    // Total items
    const totalItems = data.reduce((sum, item) => sum + (item.jumlah || 0), 0);
    document.getElementById('totalItems').textContent = totalItems.toLocaleString();
    
    // Unique destinations
    const uniqueDestinations = [...new Set(data.map(item => item.tujuan))].length;
    document.getElementById('uniqueDestinations').textContent = uniqueDestinations;
}

// Populate shipping table
function populateShippingTable(data) {
    const tableBody = document.getElementById('shippingTableBody');
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">No shipping records found</td></tr>';
        return;
    }
    
    data.forEach(item => {
        const row = document.createElement('tr');
        const badgeClass = getBadgeClass(item.tujuan);
        
        row.innerHTML = `
            <td>${formatDisplayDate(item.tanggal_pengiriman)}</td>
            <td>${escapeHtml(item.no_surat_jalan)}</td>
            <td>${escapeHtml(item.no_sphp)}</td>
            <td>${escapeHtml(item.artikel)}</td>
            <td class="text-right">${item.jumlah.toLocaleString()}</td>
            <td>
                <span class="badge tujuan-badge ${badgeClass}">
                    ${escapeHtml(item.tujuan)}
                </span>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-circle btn-info view-details" 
                        data-id="${item.id}" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-circle btn-danger delete-item" 
                        data-id="${item.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Re-attach event listeners
    attachRowEventListeners();
}

// Format date for display (01 Jan 2023)
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    });
}

// Get badge class based on destination
function getBadgeClass(tujuan) {
    if (!tujuan) return 'badge-primary';
    if (tujuan.includes('GT')) return 'badge-GT';
    if (tujuan.includes('MT')) return 'badge-MT';
    if (tujuan.includes('OL')) return 'badge-OL';
    if (tujuan.includes('CS')) return 'badge-CS';
    return 'badge-primary';
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Attach event listeners to table rows
function attachRowEventListeners() {
    // View details
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', viewShippingDetails);
    });
    
    // Delete item
    document.querySelectorAll('.delete-item').forEach(btn => {
        btn.addEventListener('click', deleteShippingItem);
    });
}

// View shipping details
async function viewShippingDetails(event) {
    const id = event.currentTarget.getAttribute('data-id');
    $('#detailsModal').modal('show');
    
    try {
        const { data: item, error } = await supabase
            .from('pengiriman')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        
        const badgeClass = getBadgeClass(item.tujuan);
        
        document.getElementById('shippingDetails').innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Shipping Date</label>
                        <p class="form-control-static">${formatDisplayDate(item.tanggal_pengiriman)}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Document No.</label>
                        <p class="form-control-static">${escapeHtml(item.no_surat_jalan)}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>SPHP No.</label>
                        <p class="form-control-static">${escapeHtml(item.no_sphp)}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Article</label>
                        <p class="form-control-static">${escapeHtml(item.artikel)}</p>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Quantity</label>
                        <p class="form-control-static">${item.jumlah.toLocaleString()}</p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group">
                        <label>Destination</label>
                        <p class="form-control-static">
                            <span class="badge ${badgeClass}">${escapeHtml(item.tujuan)}</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading shipping details:', error);
        document.getElementById('shippingDetails').innerHTML = `
            <div class="alert alert-danger">Failed to load shipping details</div>
        `;
    }
}

// Delete shipping item
async function deleteShippingItem(event) {
    const id = event.currentTarget.getAttribute('data-id');
    
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    });
    
    if (result.isConfirmed) {
        try {
            const { error } = await supabase
                .from('pengiriman')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            Swal.fire(
                'Deleted!',
                'Shipping record has been deleted.',
                'success'
            );
            
            // Refresh data
            loadShippingData();
            
        } catch (error) {
            console.error('Error deleting shipping item:', error);
            Swal.fire(
                'Error!',
                'Failed to delete shipping record',
                'error'
            );
        }
    }
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Prepare data for Supabase
    const shippingData = {
        tanggal_pengiriman: formData.get('tanggal'),
        no_surat_jalan: formData.get('no_surat_jalan'),
        no_sphp: formData.get('no_sphp'),
        artikel: formData.get('artikel'),
        jumlah: parseInt(formData.get('jumlah')),
        tujuan: formData.get('tujuan')
    };
    
    try {
        // Show loading
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
        submitBtn.disabled = true;
        
        // Insert into Supabase
        const { data, error } = await supabase
            .from('pengiriman')
            .insert([shippingData])
            .select();
        
        if (error) throw error;
        
        // Success
        Swal.fire(
            'Success!',
            'Shipping record has been added.',
            'success'
        );
        
        // Reset form
        form.reset();
        $('.select2').val(null).trigger('change');
        document.getElementById('tanggal').valueAsDate = new Date();
        
        // Refresh data
        loadShippingData();
        
    } catch (error) {
        console.error('Error submitting form:', error);
        Swal.fire(
            'Error!',
            'Failed to add shipping record: ' + error.message,
            'error'
        );
    } finally {
        // Reset button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Validate form
function validateForm() {
    let isValid = true;
    const form = document.getElementById('shippingForm');
    
    // Check required fields
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    // Validate quantity
    const quantity = document.getElementById('jumlah');
    if (quantity.value <= 0) {
        quantity.classList.add('is-invalid');
        isValid = false;
    } else {
        quantity.classList.remove('is-invalid');
    }
    
    if (!isValid) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please fill all required fields with valid values',
        });
    }
    
    return isValid;
}

// Clear form
function clearForm(event) {
    event.preventDefault();
    document.getElementById('shippingForm').reset();
    $('.select2').val(null).trigger('change');
    document.getElementById('tanggal').valueAsDate = new Date();
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
}

// Refresh table
function refreshTable(event) {
    event.preventDefault();
    loadShippingData();
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Table refreshed',
        showConfirmButton: false,
        timer: 1000
    });
}

// Export to Excel (placeholder)
function exportExcel(event) {
    event.preventDefault();
    Swal.fire({
        title: 'Export to Excel',
        text: 'This feature will be available in the next version',
        icon: 'info',
        confirmButtonText: 'OK'
    });
}

// Setup realtime updates
function setupRealtimeUpdates() {
    const channel = supabase
        .channel('pengiriman-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'pengiriman'
            },
            payload => {
                console.log('Change received!', payload);
                loadShippingData(); // Refresh data on any change
            }
        )
        .subscribe();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        supabase.removeChannel(channel);
    });
}

// Floating action button
function initFloatingButton() {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary btn-lg rounded-circle floating-btn animate-bounce';
    btn.innerHTML = '<i class="fas fa-plus"></i>';
    btn.addEventListener('click', () => {
        window.scrollTo({
            top: document.getElementById('shippingForm').offsetTop - 20,
            behavior: 'smooth'
        });
    });
    document.body.appendChild(btn);
}

// Initialize floating button
initFloatingButton();

const { data, error } = await supabase
  .from('pengiriman')
  .select('*')
  .limit(1);

if (error) {
  console.error('Supabase connection error:', error);
  alert('Database connection failed: ' + error.message);
}

