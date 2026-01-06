from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="ai_analytics",
    version="0.1.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="AI Analytics Service for tracking feature usage and generating insights",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/ai-analytics",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.8',
    install_requires=[
        'fastapi>=0.68.0',
        'uvicorn>=0.15.0',
        'pandas>=1.3.0',
        'numpy>=1.21.0',
        'python-jose[cryptography]>=3.3.0',
        'pydantic>=1.8.0',
        'python-multipart>=0.0.5',
        'python-dotenv>=0.19.0',
    ],
    extras_require={
        'dev': [
            'pytest>=6.2.5',
            'httpx>=0.19.0',
            'black>=21.9b0',
            'isort>=5.9.3',
            'flake8>=4.0.1',
        ],
    },
)
