import pytest
from app import create_app
from flask_sqlalchemy import SQLAlchemy

@pytest.fixture
def app():
    app = create_app('testing')
    return app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def db(app):
    db = SQLAlchemy(app)
    with app.app_context():
        db.create_all()
    yield db
    with app.app_context():
        db.drop_all()