// FILE: js/share-image.js

async function shareReportAsImage(data) {
    const { date, opening, transactions, totalIn, totalOut, finalBalance } = data;

    const voucher = document.createElement('div');
    voucher.id = 'hiddenVoucher';
    voucher.style = `
        width: 400px; padding: 30px; background: #ffffff; font-family: 'Inter', sans-serif;
        position: fixed; left: -9999px; top: 0; color: #111827;
    `;

    let rowsHtml = '';
    transactions.forEach(t => {
        const color = t.t_type === 'IN' ? '#059669' : '#dc2626';
        const prefix = t.t_type === 'IN' ? '+' : '-';
        rowsHtml += `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; font-size: 14px;">
                <span>${t.party_name}</span>
                <span style="color: ${color}; font-weight: 600;">${prefix} ₹${t.amount.toLocaleString('en-IN')}</span>
            </div>
        `;
    });

    voucher.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="margin: 0; color: #2563eb; font-size: 22px;">HISAB MANAGER</h2>
            <p style="margin: 5px 0 0; font-size: 12px; color: #6b7280;">Daily Cash Report</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px;">
            <span><b>Date:</b> ${date}</span>
            <span><b>Opening:</b> ₹${opening.toLocaleString('en-IN')}</span>
        </div>

        <div style="margin-bottom: 20px;">
            <div style="font-weight: 700; font-size: 12px; color: #9ca3af; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;">Transactions</div>
            ${rowsHtml || '<p style="text-align:center; color:#9ca3af;">No transactions</p>'}
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 13px;">
                <span>Total Received:</span>
                <span style="color: #059669; font-weight: 600;">+ ₹${totalIn.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px;">
                <span>Total Paid:</span>
                <span style="color: #dc2626; font-weight: 600;">- ₹${totalOut.toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-top: 2px dashed #d1d5db; pt: 10px; margin-top: 10px; padding-top: 10px;">
                <span style="font-weight: 700;">Closing Balance:</span>
                <span style="font-weight: 800; color: #2563eb; font-size: 18px;">₹${finalBalance.toLocaleString('en-IN')}</span>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 10px; color: #9ca3af;">
            Report by Keshab Sarkar • ${new Date().toLocaleString()}
        </div>
    `;

    document.body.appendChild(voucher);

    try {
        const canvas = await html2canvas(voucher, { scale: 2 });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const file = new File([blob], `Hisab_Report_${date}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Daily Hisab Report',
                text: `Cash Report for ${date}`
            });
        } else {
            const link = document.createElement('a');
            link.download = `Hisab_Report_${date}.png`;
            link.href = canvas.toDataURL();
            link.click();
            alert("Sharing not supported. Image downloaded instead.");
        }
    } catch (err) {
        console.error("Error sharing image:", err);
        alert("Failed to generate image report.");
    } finally {
        document.body.removeChild(voucher);
    }
}
