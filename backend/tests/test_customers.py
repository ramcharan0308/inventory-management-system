class TestCustomers:
    def test_create_customer(self, client):
        r = client.post(
            "/api/v1/customers",
            json={"full_name": "Bob Jones", "email": "bob@example.com"},
        )
        assert r.status_code == 201
        data = r.json()
        assert data["email"] == "bob@example.com"

    def test_create_customer_duplicate_email(self, client, sample_customer):
        r = client.post(
            "/api/v1/customers",
            json={"full_name": "Another Alice", "email": sample_customer["email"]},
        )
        assert r.status_code == 409

    def test_list_customers(self, client, sample_customer):
        r = client.get("/api/v1/customers")
        assert r.status_code == 200
        assert r.json()["total"] >= 1

    def test_get_customer(self, client, sample_customer):
        r = client.get(f"/api/v1/customers/{sample_customer['id']}")
        assert r.status_code == 200
        assert r.json()["id"] == sample_customer["id"]

    def test_get_customer_not_found(self, client):
        r = client.get("/api/v1/customers/00000000-0000-0000-0000-000000000000")
        assert r.status_code == 404

    def test_search_customers(self, client, sample_customer):
        r = client.get(f"/api/v1/customers?search=Alice")
        assert r.status_code == 200
        assert any(c["full_name"] == "Alice Smith" for c in r.json()["items"])

    def test_delete_customer(self, client):
        r = client.post(
            "/api/v1/customers",
            json={"full_name": "Temp User", "email": "temp@example.com"},
        )
        cid = r.json()["id"]
        r = client.delete(f"/api/v1/customers/{cid}")
        assert r.status_code == 204
