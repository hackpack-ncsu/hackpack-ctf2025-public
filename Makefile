# Target to build and deploy the Docker containers
deploy:
	@echo "Deploying the challenge..."
	docker compose up --build -d

# Target to run proof of concept exploits
poc:
	@python3 ./pocs/poc.py

# Target to run unit tests
test:
	@python3 -m unittest discover -s tests > /dev/null 2>&1 || (echo "Tests failed!" && exit 1)
	@echo "Tests Passed"