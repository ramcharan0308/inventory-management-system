class TestOrders:
    def _make_order(self, client, customer_id, product_id, qty=2):
        return client.post(
            "/api/v1/orders",
            json={
                "customer_id": customer_id,
                "items": [{"product_id": product_id, "quantity": qty}],
            },
        )

    def test_create_order(self, client, sample_customer, sample_product):
        r = self._make_order(client, sample_customer["id"], sample_product["id"])
        assert r.status_code == 201
        data = r.json()
        assert data["customer_id"] == sample_customer["id"]
        assert len(data["items"]) == 1
        assert float(data["total_amount"]) == pytest.approx(
            float(sample_product["price"]) * 2, abs=0.01
        )

    def test_create_order_insufficient_stock(self, client, sample_customer, sample_product):
        r = self._make_order(client, sample_customer["id"], sample_product["id"], qty=9999)
        assert r.status_code == 422

    def test_list_orders(self, client, sample_customer, sample_product):
        self._make_order(client, sample_customer["id"], sample_product["id"])
        r = client.get("/api/v1/orders")
        assert r.status_code == 200
        assert r.json()["total"] >= 1

    def test_get_order(self, client, sample_customer, sample_product):
        create = self._make_order(client, sample_customer["id"], sample_product["id"])
        oid = create.json()["id"]
        r = client.get(f"/api/v1/orders/{oid}")
        assert r.status_code == 200

    def test_update_order_status(self, client, sample_customer, sample_product):
        create = self._make_order(client, sample_customer["id"], sample_product["id"])
        oid = create.json()["id"]
        r = client.patch(f"/api/v1/orders/{oid}/status", json={"status": "confirmed"})
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"

    def test_order_not_found(self, client):
        r = client.get("/api/v1/orders/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404

    def test_stock_deducted_on_order(self, client, sample_customer):
        # Create a product with known stock
        pr = client.post(
            "/api/v1/products",
            json={"name": "Stock Test", "sku": "STK-001", "price": 5.0, "quantity_in_stock": 20},
        )
        prod = pr.json()
        self._make_order(client, sample_customer["id"], prod["id"], qty=5)
        r = client.get(f"/api/v1/products/{prod['id']}")
        assert r.json()["quantity_in_stock"] == 15


import pytest
