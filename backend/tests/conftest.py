import os

# Use SQLite for tests before any app modules initialize the DB engine.
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import importlib
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.config import get_settings

get_settings.cache_clear()
import app.database as database_module

importlib.reload(database_module)

from app.main import app
from app.database import Base
from app.dependencies import get_db

SQLALCHEMY_TEST_DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def sample_product(client):
    response = client.post(
        "/api/v1/products",
        json={"name": "Widget A", "sku": "WGT-001", "price": 9.99, "quantity_in_stock": 100},
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture()
def sample_customer(client):
    response = client.post(
        "/api/v1/customers",
        json={"full_name": "Alice Smith", "email": "alice@example.com", "phone_number": "555-1234"},
    )
    assert response.status_code == 201
    return response.json()
