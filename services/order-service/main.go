package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sync"
)

type OrderItem struct {
	ProductID int64   `json:"product_id"`
	Quantity  int     `json:"quantity"`
	Price     float64 `json:"price"`
}

type OrderRequest struct {
	UserID int64       `json:"user_id"`
	Items  []OrderItem `json:"items"`
}

type Order struct {
	ID          int64   `json:"id"`
	UserID      int64   `json:"user_id"`
	Status      string  `json:"status"`
	TotalAmount float64 `json:"total_amount"`
}

var (
	orders []Order
	mu     sync.RWMutex
	nextID int64 = 1
)

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "OK",
		"service": "Order Service",
	})
}

func ordersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case "POST":
		var req OrderRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "Invalid request body",
			})
			return
		}

		var total float64
		for _, item := range req.Items {
			total += float64(item.Quantity) * item.Price
		}

		mu.Lock()
		order := Order{
			ID:          nextID,
			UserID:      req.UserID,
			Status:      "pending",
			TotalAmount: total,
		}
		orders = append(orders, order)
		nextID++
		mu.Unlock()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(order)

	case "GET":
		mu.RLock()
		response := map[string]interface{}{
			"orders": orders,
			"total":  len(orders),
		}
		mu.RUnlock()
		json.NewEncoder(w).Encode(response)

	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Method not allowed",
		})
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", corsMiddleware(healthHandler))
	mux.HandleFunc("/api/orders", corsMiddleware(ordersHandler))
	mux.HandleFunc("/api/orders/", corsMiddleware(ordersHandler))

	port := os.Getenv("PORT")
	if port == "" {
		port = "3003"
	}

	log.Printf("Order service starting on port %s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
