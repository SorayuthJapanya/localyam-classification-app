import os

class Config:
    # Flask settings
    FLASK_APP = os.getenv('FLASK_APP', 'main.py')
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

    # Model settings
    MODEL_PATH = os.getenv('MODEL_PATH', 'model/resnet101_leaf_model_12_V0.keras')

    @classmethod
    def get_config(cls):
        # Debug print statements to help trace values
        print(f"FLASK_APP: {cls.FLASK_APP}")
        print(f"FLASK_ENV: {cls.FLASK_ENV}")
        print(f"PORT: {cls.PORT}")
        print(f"DEBUG: {cls.DEBUG}")
        print(f"MODEL_PATH: {cls.MODEL_PATH}")
        return {
            'flask_app': cls.FLASK_APP,
            'flask_env': cls.FLASK_ENV,
            'port': cls.PORT,
            'debug': cls.DEBUG,
            'model_path': cls.MODEL_PATH,
        }