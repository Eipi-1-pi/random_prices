let priceHistory = [];

function generatePrice() {
    const originalPrice = parseFloat(document.getElementById('originalPrice').value);
    
    if (!originalPrice || originalPrice <= 0) {
        alert('Please enter a valid price');
        return;
    }
    
    const random = Math.random() * 100;
    let finalPrice, appliedRule;
    
    if (random < 0.1) {
        finalPrice = originalPrice;
        appliedRule = "Original Price (0.1%)";
    } else if (random < 40) {
        finalPrice = originalPrice * 1.5;
        appliedRule = "1.5x Original Price (39.9%)";
    } else {
        finalPrice = originalPrice * 2.5;
        appliedRule = "2.5x Original Price (60%)";
    }
    
    const result = {
        timestamp: new Date(),
        originalPrice: originalPrice,
        finalPrice: finalPrice,
        appliedRule: appliedRule
    };
    
    priceHistory.unshift(result);
    localStorage.setItem('priceHistory', JSON.stringify(priceHistory.slice(0, 50)));
    
    showResult(result);
    showHistory();
}

function showResult(result) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <h3>Generated Price Result:</h3>
        <p><strong>Original Price:</strong> $${result.originalPrice.toFixed(2)}</p>
        <p><strong>Final Price:</strong> $${result.finalPrice.toFixed(2)}</p>
        <p><strong>Applied Rule:</strong> ${result.appliedRule}</p>
        <p><small>Generated at: ${new Date(result.timestamp).toLocaleString()}</small></p>
    `;
}

function showHistory() {
    const historyDiv = document.getElementById('priceHistory');
    
    if (priceHistory.length === 0) {
        historyDiv.innerHTML = '<p>No price history available</p>';
        return;
    }
    
    let html = '';
    priceHistory.forEach(entry => {
        html += `
            <div class="history-item">
                <p><strong>Date:</strong> ${new Date(entry.timestamp).toLocaleString()}</p>
                <p><strong>Original Price:</strong> $${entry.originalPrice.toFixed(2)}</p>
                <p><strong>Final Price:</strong> $${entry.finalPrice.toFixed(2)}</p>
                <p><strong>Rule Applied:</strong> ${entry.appliedRule}</p>
            </div>
        `;
    });
    
    historyDiv.innerHTML = html;
}

// Load price history when page loads
window.onload = function() {
    const savedHistory = localStorage.getItem('priceHistory');
    if (savedHistory) {
        priceHistory = JSON.parse(savedHistory);
        showHistory();
    }
    
    // Add enter key support for input field
    const input = document.getElementById('originalPrice');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generatePrice();
        }
    });
};
