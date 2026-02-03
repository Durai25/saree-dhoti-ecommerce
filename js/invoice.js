// Minimal invoice generator that uses jsPDF if available
export function generateInvoice(order){
  if(!window.jspdf){
    alert('Please include jsPDF (CDN) to enable invoice download');
    return;
  }
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  let y = 20;
  pdf.text('TAX INVOICE', 80, y); y+=10;
  pdf.text(`Invoice No: ${order.paymentId || 'N/A'}`, 10, y); y+=8;
  pdf.text(`Date: ${new Date().toLocaleDateString()}`, 10, y); y+=10;
  pdf.text(`Bill To: ${order.customerName}`, 10, y); y+=7;
  (order.items||[]).forEach((p,i) => { pdf.text(`${i+1}. ${p.name} - ₹${p.price}`, 10, y); y+=7; });
  pdf.save(`Invoice_${order.paymentId || Date.now()}.pdf`);
}