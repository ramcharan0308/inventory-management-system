### Inventory & Order Management API — sample requests

Base URL (local): `http://localhost:8000/api/v1`  
Interactive docs: `http://localhost:8000/api/docs`

Replace `{{baseUrl}}` and UUID placeholders before running.

---

#### Health check

```http
GET http://localhost:8000/health
```

---

#### Products

```http
### Create product
POST {{baseUrl}}/products
Content-Type: application/json

{
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "price": 29.99,
  "quantity_in_stock": 100
}

### List products
GET {{baseUrl}}/products?skip=0&limit=20

### Get product by ID
GET {{baseUrl}}/products/{{productId}}

### Update product
PUT {{baseUrl}}/products/{{productId}}
Content-Type: application/json

{
  "name": "Wireless Mouse Pro",
  "price": 34.99,
  "quantity_in_stock": 95
}

### Delete product
DELETE {{baseUrl}}/products/{{productId}}
```

---

#### Customers

```http
### Create customer
POST {{baseUrl}}/customers
Content-Type: application/json

{
  "full_name": "Jane Doe",
  "email": "jane.doe@example.com",
  "phone_number": "+1-555-0100"
}

### List customers
GET {{baseUrl}}/customers?skip=0&limit=20

### Get customer by ID
GET {{baseUrl}}/customers/{{customerId}}

### Delete customer
DELETE {{baseUrl}}/customers/{{customerId}}
```

---

#### Orders

```http
### Create order (multi-line)
POST {{baseUrl}}/orders
Content-Type: application/json

{
  "customer_id": "{{customerId}}",
  "items": [
    { "product_id": "{{productId}}", "quantity": 2 }
  ]
}

### List orders
GET {{baseUrl}}/orders?skip=0&limit=20

### Get order by ID
GET {{baseUrl}}/orders/{{orderId}}

### Cancel/delete order
DELETE {{baseUrl}}/orders/{{orderId}}
```

---

#### Dashboard

```http
### Dashboard stats
GET {{baseUrl}}/dashboard/stats
```

---

#### cURL examples

```bash
# Create product
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"USB Cable","sku":"USB-001","price":9.99,"quantity_in_stock":50}'

# Create customer
curl -X POST http://localhost:8000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Smith","email":"john@example.com","phone_number":"555-0200"}'

# Dashboard stats
curl http://localhost:8000/api/v1/dashboard/stats
```

---

#### Expected error cases

| Scenario | Status | Example |
|----------|--------|---------|
| Duplicate SKU | 409 | `"detail": "Product with SKU 'WM-001' already exists."` |
| Duplicate email | 409 | `"detail": "Customer with email 'jane@example.com' already exists."` |
| Insufficient stock | 409 | `"detail": "Insufficient stock for 'Wireless Mouse'..."` |
| Validation error | 422 | `"detail": "body -> price: Input should be greater than 0"` |
| Not found | 404 | `"detail": "Product with id '...' not found"` |
