import pytest


class TestProducts:
    def test_create_product(self, client):
        r = client.post(
            "/api/v1/products",
            json={"name": "Test Widget", "sku": "TST-001", "price": 19.99, "quantity_in_stock": 50},
        )
        assert r.status_code == 201
        data = r.json()
        assert data["sku"] == "TST-001"
        assert data["quantity_in_stock"] == 50

    def test_create_product_duplicate_sku(self, client, sample_product):
        r = client.post(
            "/api/v1/products",
            json={"name": "Duplicate", "sku": sample_product["sku"], "price": 5.0, "quantity_in_stock": 10},
        )
        assert r.status_code == 409

    def test_create_product_negative_stock(self, client):
        r = client.post(
            "/api/v1/products",
            json={"name": "Bad Stock", "sku": "BAD-001", "price": 5.0, "quantity_in_stock": -1},
        )
        assert r.status_code == 422

    def test_list_products(self, client, sample_product):
        r = client.get("/api/v1/products")
        assert r.status_code == 200
        data = r.json()
        assert "items" in data
        assert data["total"] >= 1

    def test_get_product(self, client, sample_product):
        r = client.get(f"/api/v1/products/{sample_product['id']}")
        assert r.status_code == 200
        assert r.json()["id"] == sample_product["id"]

    def test_get_product_not_found(self, client):
        r = client.get("/api/v1/products/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404

    def test_update_product(self, client, sample_product):
        r = client.patch(
            f"/api/v1/products/{sample_product['id']}",
            json={"price": 14.99, "quantity_in_stock": 200},
        )
        assert r.status_code == 200
        assert float(r.json()["price"]) == 14.99

    def test_delete_product(self, client):
        # Create a fresh product to delete
        r = client.post(
            "/api/v1/products",
            json={"name": "To Delete", "sku": "DEL-001", "price": 1.0, "quantity_in_stock": 5},
        )
        pid = r.json()["id"]
        r = client.delete(f"/api/v1/products/{pid}")
        assert r.status_code == 204

    def test_low_stock_filter(self, client):
        client.post(
            "/api/v1/products",
            json={"name": "Low Stock Item", "sku": "LOW-001", "price": 5.0, "quantity_in_stock": 3},
        )
        r = client.get("/api/v1/products?low_stock=true")
        assert r.status_code == 200
        for item in r.json()["items"]:
            assert item["quantity_in_stock"] <= 10
