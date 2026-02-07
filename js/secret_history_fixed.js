// Copy this quickReturn function to replace the existing one in secret_history.js

async function quickReturn(id, name, desc) {
    const input = document.getElementById(`ret_${id}`);
    const amount = parseFloat(input.value);
    
    console.log('=== QUICK RETURN START ===');
    console.log('Entry ID:', id);
    console.log('Name:', name);
    console.log('Amount to Return:', amount);
    
    if (!amount || amount <= 0) {
        return alert("Enter valid return amount");
    }
    
    // IMPORTANT: Fetch fresh data directly from database
    const timestamp = Date.now(); // Force cache bust
    const { data: takeEntries, error: fetchError } = await _supabase
        .from('secret_box')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('party_name', name)
        .eq('t_type', 'TAKE')
        .order('created_at', { ascending: true });
    
    console.log('Take Entries Found:', takeEntries);
    
    if (fetchError) {
        console.error('Fetch Error:', fetchError);
        return alert("Error fetching data: " + fetchError.message);
    }
    
    // Calculate total remaining from fresh data
    let totalRemaining = 0;
    const activeEntries = [];
    
    takeEntries.forEach(entry => {
        const rem = parseFloat(entry.remaining_amount || entry.amount);
        console.log(`Entry ID ${entry.id}: Amount=${entry.amount}, Remaining=${rem}`);
        
        if (rem > 0) {
            totalRemaining += rem;
            activeEntries.push(entry);
        }
    });
    
    console.log('Total Remaining:', totalRemaining);
    console.log('Active Entries:', activeEntries.length);
    
    if (amount > totalRemaining) {
        console.log('BLOCKED: Amount exceeds remaining');
        return alert(`❌ Cannot return ₹${amount}!\n\nCurrent due: ₹${totalRemaining.toFixed(2)}\nYou can only return up to ₹${totalRemaining.toFixed(2)}`);
    }
    
    // Process return
    let remainingReturn = amount;
    console.log('Processing returns...');
    
    for (const entry of activeEntries) {
        if (remainingReturn <= 0) break;
        
        const entryRemaining = parseFloat(entry.remaining_amount || entry.amount);
        const deduction = Math.min(remainingReturn, entryRemaining);
        const newRemaining = entryRemaining - deduction;
        
        console.log(`Entry ID ${entry.id}:`);
        console.log(`  - Current Remaining: ${entryRemaining}`);
        console.log(`  - Deduction: ${deduction}`);
        console.log(`  - New Remaining: ${newRemaining}`);
        
        const { error: updateError } = await _supabase
            .from('secret_box')
            .update({ remaining_amount: newRemaining })
            .eq('id', entry.id);
        
        if (updateError) {
            console.error(`  ❌ Update Error:`, updateError);
            return alert('Update failed: ' + updateError.message);
        }
        
        console.log(`  ✅ Updated successfully`);
        remainingReturn -= deduction;
        console.log(`  - Remaining to Return: ${remainingReturn}`);
    }
    
    console.log('=== QUICK RETURN END ===\n');
    alert(`✅ ₹${amount} returned successfully!`);
    input.value = '';
    
    // Force complete reload
    await fetchHistory();
}
