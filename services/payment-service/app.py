from flask import Flask, request, jsonify
from datetime import datetime
import os

app = Flask(__name__)

payments = []

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "OK",
        "service": "Payment Service",
        "timestamp": datetime.utcnow().isoformat()
    })

@app.route('/api/payments', methods=['GET', 'POST'])
def handle_payments():
    if request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        payment = {
            "id": len(payments) + 1,
            "order_id": data.get('order_id'),
            "user_id": data.get('user_id', 1),
            "amount": data.get('amount', 0),
            "currency": data.get('currency', 'USD'),
            "status": "processing",
            "created_at": datetime.utcnow().isoformat()
        }
        payments.append(payment)
        
        return jsonify({
            "message": "Payment initiated successfully",
            "payment": payment
        }), 201
    
    # GET request
    return jsonify({
        "payments": payments,
        "total": len(payments)
    })

@app.route('/api/payments/<int:payment_id>', methods=['GET'])
def get_payment(payment_id):
    payment = next((p for p in payments if p['id'] == payment_id), None)
    if not payment:
        return jsonify({"error": "Payment not found"}), 404
    return jsonify({"payment": payment})

@app.route('/api/payments/order/<int:order_id>', methods=['GET'])
def get_payment_by_order(order_id):
    payment = next((p for p in payments if p['order_id'] == order_id), None)
    if not payment:
        return jsonify({"error": "Payment not found for this order"}), 404
    return jsonify({"payment": payment})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3004))
    app.run(host='0.0.0.0', port=port, debug=True)
